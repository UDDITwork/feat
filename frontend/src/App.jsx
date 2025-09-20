import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { FormProvider } from './contexts/FormContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import FormView from './pages/FormView'
import FormSubmission from './pages/FormSubmission'
import Invitations from './pages/Invitations'
import Submissions from './pages/Submissions'
import Clients from './pages/Clients'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

function App() {
  return (
    <AuthProvider>
      <FormProvider>
        <div className="App min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/form/:token" element={<FormSubmission />} />
            
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
              <Route path="submissions" element={<Submissions />} />
              <Route path="clients" element={<Clients />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </FormProvider>
    </AuthProvider>
  )
}

export default App
