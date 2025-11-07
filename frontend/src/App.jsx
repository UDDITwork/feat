import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { FormProvider } from './contexts/FormContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import FormView from './pages/FormView'
import FormSubmission from './pages/FormSubmission'
import Invitations from './pages/Invitations'
import Submissions from './pages/Submissions'
import PrimaryInvitations from './pages/PrimaryInvitations'
import PrimaryInvitationForm from './pages/PrimaryInvitationForm'
import Clients from './pages/Clients'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

function App() {
  console.log('🚀 App component rendering...')
  
  try {
    return (
      <ErrorBoundary>
        <AuthProvider>
          <FormProvider>
            <div className="App min-h-screen bg-gray-50">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/form/:token" element={<FormSubmission />} />
                <Route path="/primary-invitation/:token" element={<PrimaryInvitationForm />} />
                
                {/* Protected admin routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="submission/:id" element={<FormView />} />
                  <Route path="invitations" element={<Invitations />} />
                  <Route path="primary-invitations" element={<PrimaryInvitations />} />
                  <Route path="submissions" element={<Submissions />} />
                  <Route path="clients" element={<Clients />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </FormProvider>
        </AuthProvider>
      </ErrorBoundary>
    )
  } catch (error) {
    console.error('🚨 App component error:', error)
    return (
      <div style={{ padding: '20px', backgroundColor: '#fee' }}>
        <h2>App Error: {error.message}</h2>
        <pre>{error.stack}</pre>
      </div>
    )
  }
}

export default App
