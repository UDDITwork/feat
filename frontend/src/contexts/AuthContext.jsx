import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem('adminToken'),
  isAuthenticated: false,
  isLoading: true,
  error: null
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        isLoading: false,
        error: null
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Helper function to validate JWT token format
  const isValidJWTFormat = (token) => {
    if (!token || typeof token !== 'string') return false
    
    // JWT should have 3 parts separated by dots
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    // Each part should be base64 encoded (basic check)
    try {
      parts.forEach(part => {
        if (part.length === 0) throw new Error('Empty part')
        // Try to decode each part
        atob(part.replace(/-/g, '+').replace(/_/g, '/'))
      })
      return true
    } catch (error) {
      return false
    }
  }

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        // No token found, set loading to false and not authenticated
        console.log('🔍 No admin token found in localStorage')
        dispatch({ type: 'AUTH_FAILURE', payload: 'No token found' })
        return
      }

      // Validate token format first
      if (!isValidJWTFormat(token)) {
        console.warn('🔐 Invalid JWT token format detected, clearing token')
        localStorage.removeItem('adminToken')
        dispatch({ type: 'AUTH_FAILURE', payload: 'Invalid token format' })
        return
      }

      try {
        console.log('🔍 Verifying existing token...')
        dispatch({ type: 'AUTH_START' })
        
        // Add timeout to prevent hanging
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
        
        const response = await authAPI.verifyToken()
        clearTimeout(timeoutId)
        
        if (response.success) {
          console.log('✅ Token verified successfully')
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: response.data.admin,
              token
            }
          })
        } else {
          throw new Error(response.message)
        }
      } catch (error) {
        console.error('❌ Auth check failed:', error)
        
        // Clear token on any error and continue without authentication
        localStorage.removeItem('adminToken')
        
        // Always set loading to false, even on error
        dispatch({ type: 'AUTH_FAILURE', payload: error.message })
        
        // Don't let auth errors break the app
        console.log('🔄 Continuing without authentication due to API error')
      }
    }

    // Check auth immediately
    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login for:', email)
      dispatch({ type: 'AUTH_START' })
      
      const response = await authAPI.login(email, password)
      console.log('📡 Login response:', response)
      
      if (response.success) {
        const { token, admin } = response.data
        
        localStorage.setItem('adminToken', token)
        console.log('💾 Token saved to localStorage')
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: admin, token }
        })
        
        toast.success('Login successful!')
        return { success: true }
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('❌ Login failed:', error)
      dispatch({ type: 'AUTH_FAILURE', payload: error.message })
      toast.error(error.message || 'Login failed')
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    dispatch({ type: 'LOGOUT' })
    toast.success('Logged out successfully')
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authAPI.changePassword(currentPassword, newPassword)
      
      if (response.success) {
        toast.success('Password changed successfully')
        return { success: true }
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('Password change failed:', error)
      toast.error(error.message || 'Failed to change password')
      return { success: false, error: error.message }
    }
  }

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData })
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const forceLogout = () => {
    console.log('🔐 Force logout - clearing all auth data')
    localStorage.removeItem('adminToken')
    dispatch({ type: 'LOGOUT' })
    toast.success('Logged out successfully')
  }

  const clearCorruptedToken = () => {
    console.log('🔐 Clearing corrupted token')
    localStorage.removeItem('adminToken')
    dispatch({ type: 'AUTH_FAILURE', payload: 'Token cleared due to corruption' })
    toast.error('Authentication token was corrupted. Please login again.')
  }

  const clearAllAuthData = () => {
    console.log('🔐 Clearing all authentication data')
    localStorage.removeItem('adminToken')
    dispatch({ type: 'AUTH_FAILURE', payload: 'Authentication data cleared' })
    toast.error('Authentication data cleared. Please login again.')
  }

  const value = {
    ...state,
    login,
    logout,
    changePassword,
    updateUser,
    clearError,
    forceLogout,
    clearCorruptedToken,
    clearAllAuthData
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthProvider
