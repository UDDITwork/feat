import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { 
  EnvelopeIcon, 
  UserIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline'

const Invitations = () => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [invitationType, setInvitationType] = useState('single')
  const [singleEmail, setSingleEmail] = useState('')
  const [bulkEmails, setBulkEmails] = useState('')
  const [adminName, setAdminName] = useState('')
  const [recentInvitations, setRecentInvitations] = useState([])

  const handleSingleInvitation = async (e) => {
    e.preventDefault()
    if (!singleEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/email/send-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          email: singleEmail.trim(),
          adminName: adminName || user?.name || 'Admin'
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Invitation sent successfully!')
        setSingleEmail('')
        // Add to recent invitations
        setRecentInvitations(prev => [{
          email: singleEmail,
          token: data.data.token,
          sentAt: new Date().toISOString(),
          status: 'sent'
        }, ...prev.slice(0, 9)])
      } else {
        toast.error(data.message || 'Failed to send invitation')
      }
    } catch (error) {
      console.error('Error sending invitation:', error)
      toast.error('Failed to send invitation. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkInvitations = async (e) => {
    e.preventDefault()
    const emails = bulkEmails.split('\n').map(email => email.trim()).filter(email => email)
    
    if (emails.length === 0) {
      toast.error('Please enter at least one email address')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/email/send-bulk-invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          emails: emails,
          adminName: adminName || user?.name || 'Admin'
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Successfully sent ${data.data.sentCount} invitations!`)
        setBulkEmails('')
        // Add to recent invitations
        const newInvitations = emails.map(email => ({
          email: email,
          token: 'bulk-sent',
          sentAt: new Date().toISOString(),
          status: 'sent'
        }))
        setRecentInvitations(prev => [...newInvitations, ...prev.slice(0, 10 - newInvitations.length)])
      } else {
        toast.error(data.message || 'Failed to send bulk invitations')
      }
    } catch (error) {
      console.error('Error sending bulk invitations:', error)
      toast.error('Failed to send bulk invitations. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="gradient-bg p-3 rounded-lg">
            <EnvelopeIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Send Invitations</h1>
            <p className="text-gray-600">Invite clients to fill out the patent application form</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Invitation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <UserIcon className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Single Invitation</h2>
          </div>
          
          <form onSubmit={handleSingleInvitation} className="space-y-4">
            <div>
              <label htmlFor="singleEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="singleEmail"
                value={singleEmail}
                onChange={(e) => setSingleEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="client@example.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="adminName" className="block text-sm font-medium text-gray-700 mb-1">
                Admin Name (Optional)
              </label>
              <input
                type="text"
                id="adminName"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={user?.name || 'Admin'}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </button>
          </form>
        </div>

        {/* Bulk Invitations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <EnvelopeIcon className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Bulk Invitations</h2>
          </div>
          
          <form onSubmit={handleBulkInvitations} className="space-y-4">
            <div>
              <label htmlFor="bulkEmails" className="block text-sm font-medium text-gray-700 mb-1">
                Email Addresses (One per line)
              </label>
              <textarea
                id="bulkEmails"
                value={bulkEmails}
                onChange={(e) => setBulkEmails(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="client1@example.com&#10;client2@example.com&#10;client3@example.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="bulkAdminName" className="block text-sm font-medium text-gray-700 mb-1">
                Admin Name (Optional)
              </label>
              <input
                type="text"
                id="bulkAdminName"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={user?.name || 'Admin'}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send Bulk Invitations'}
            </button>
          </form>
        </div>
      </div>

      {/* Recent Invitations */}
      {recentInvitations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Invitations</h2>
          <div className="space-y-3">
            {recentInvitations.map((invitation, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{invitation.email}</p>
                    <p className="text-xs text-gray-500">
                      Sent {new Date(invitation.sentAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {invitation.token !== 'bulk-sent' && (
                  <button
                    onClick={() => copyToClipboard(invitation.token)}
                    className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded hover:bg-primary-200 transition-colors"
                  >
                    Copy Token
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">How it works</h3>
            <div className="mt-2 text-sm text-blue-700 space-y-1">
              <p>• Clients receive an email with a secure link to the form</p>
              <p>• Each invitation is valid for 30 days</p>
              <p>• You can track submission status in the Submissions section</p>
              <p>• Form data is automatically saved as clients fill it out</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Invitations
