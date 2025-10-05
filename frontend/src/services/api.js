import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

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

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Skip auth for public endpoints (form endpoints)
    const publicEndpoints = ['/form/', '/email/verify-token/']
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url.includes(endpoint))
    
    if (!isPublicEndpoint) {
      const token = localStorage.getItem('adminToken')
      
      if (token) {
        // Validate token format before sending
        if (isValidJWTFormat(token)) {
          config.headers.Authorization = `Bearer ${token}`
        } else {
          console.warn('🔐 Invalid JWT token format detected, clearing token')
          localStorage.removeItem('adminToken')
          // Don't add the malformed token to headers
        }
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear token and redirect
      console.log('🔐 Clearing invalid token and redirecting to login')
      localStorage.removeItem('adminToken')
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    
    // Handle JWT malformed errors specifically
    if (error.response?.data?.error === 'JWT_MALFORMED') {
      console.log('🔐 JWT token is malformed, clearing and redirecting')
      localStorage.removeItem('adminToken')
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    
    // Handle JWT signature errors
    if (error.response?.status === 401 && error.response?.data?.message?.includes('invalid signature')) {
      console.log('🔐 JWT signature is invalid, clearing token and redirecting')
      localStorage.removeItem('adminToken')
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred'
    return Promise.reject(new Error(errorMessage))
  }
)

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  verifyToken: () => api.get('/auth/verify'),
  refreshToken: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  changePassword: (currentPassword, newPassword) => 
    api.post('/auth/change-password', { currentPassword, newPassword }),
}

// Email API
export const emailAPI = {
  sendInvitation: (email, adminName) => 
    api.post('/email/send-invitation', { email, adminName }),
  sendBulkInvitations: (emails, adminName) => 
    api.post('/email/send-bulk-invitations', { emails, adminName }),
  verifyToken: (token) => api.get(`/email/verify-token/${token}`),
  resendInvitation: (email, adminName) => 
    api.post('/email/resend-invitation', { email, adminName }),
  getInvitationStatus: (email) => api.get(`/email/invitation-status/${email}`),
}

// Form API
export const formAPI = {
  getForm: (token) => api.get(`/form/${token}`),
  saveDraft: (token, formData) => 
    api.post('/form/save-draft', { token, formData }),
  submitForm: (token, formData) => 
    api.post('/form/submit', { token, formData }),
  getFormStatus: (token) => api.get(`/form/status/${token}`),
  validateField: (field, value, fieldType) => 
    api.post('/form/validate-field', { field, value, fieldType }),
}

// Admin API
export const adminAPI = {
  getSubmissions: (params = {}) => api.get('/admin/submissions', { params }),
  getSubmission: (id) => api.get(`/admin/submission/${id}`),
  editSubmission: (id, field, newValue, editedBy) =>
    api.put(`/admin/submission/${id}/edit`, { field, newValue, editedBy }),
  bulkEditSubmissions: (submissionIds, field, newValue, editedBy) =>
    api.put('/admin/submissions/bulk-edit', { submissionIds, field, newValue, editedBy }),
  getEditHistory: (id) => api.get(`/admin/submission/${id}/edit-history`),
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getNotifications: (limit = 10) => api.get('/admin/notifications', { params: { limit } }),
  getClients: (params = {}) => api.get('/admin/clients', { params }),
  deleteSubmission: (id) => api.delete(`/admin/submission/${id}`),
  exportSubmission: async (id) => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      throw new Error('No authentication token found')
    }

    // Fetch with authentication
    const response = await fetch(`${API_BASE_URL}/admin/submission/${id}/export`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to export submission')
    }

    // Create blob and download
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = `submission_${id}_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(downloadUrl)
    document.body.removeChild(a)
  },
}

// Utility functions
export const handleApiError = (error) => {
  console.error('API Error:', error)
  return {
    success: false,
    message: error.message || 'An unexpected error occurred',
    error: error.response?.data || error
  }
}

export const createFormData = (data) => {
  const formData = new FormData()
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      if (data[key] instanceof File) {
        formData.append(key, data[key])
      } else if (typeof data[key] === 'object') {
        formData.append(key, JSON.stringify(data[key]))
      } else {
        formData.append(key, data[key])
      }
    }
  })
  return formData
}

// File upload helper - converts to base64 and uploads
export const uploadFile = async (token, fieldName, file, onProgress = null) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async () => {
      try {
        const base64Data = reader.result

        const response = await api.post('/upload/upload', {
          token,
          fieldName,
          file: {
            data: base64Data,
            name: file.name,
            type: file.type,
            size: file.size
          }
        })

        resolve(response)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}

// Health check
export const healthCheck = () => api.get('/health')

export default api
