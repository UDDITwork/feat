import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  ClipboardDocumentListIcon,
  PaperAirplaneIcon,
  UsersIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import { primaryInvitationAPI } from '../services/api'

const PrimaryInvitations = () => {
  const { user } = useAuth()
  const [singleEmail, setSingleEmail] = useState('')
  const [bulkEmails, setBulkEmails] = useState('')
  const [adminName, setAdminName] = useState('')
  const [invitations, setInvitations] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingSingle, setIsSendingSingle] = useState(false)
  const [isSendingBulk, setIsSendingBulk] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(null)

  const resolvedAdminName = useMemo(
    () => adminName || user?.name || 'Admin',
    [adminName, user?.name]
  )

  const fetchInvitations = async () => {
    try {
      setIsLoading(true)
      console.time('[PrimaryInvitations] fetchInvitations')
      console.log('[PrimaryInvitations] Fetching invitations list')
      const response = await primaryInvitationAPI.list(25)
      if (response.success) {
        setInvitations(response.data || [])
        console.log('[PrimaryInvitations] Invitations list loaded', response.data)
      } else {
        console.warn('[PrimaryInvitations] Unexpected response while fetching list', response)
      }
    } catch (error) {
      console.error('Failed to load primary invitations:', error)
      toast.error(error.message || 'Failed to load invitations')
    } finally {
      console.timeEnd('[PrimaryInvitations] fetchInvitations')
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInvitations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSingleInvitation = async (event) => {
    event.preventDefault()

    if (!singleEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }

    setIsSendingSingle(true)
    try {
      console.group('[PrimaryInvitations] handleSingleInvitation')
      console.log('Sending single invitation with payload', {
        email: singleEmail.trim(),
        adminName: resolvedAdminName
      })
      const response = await primaryInvitationAPI.send(singleEmail.trim(), resolvedAdminName)
      if (response.success) {
        toast.success('Primary invitation sent successfully')
        setSingleEmail('')
        fetchInvitations()
        console.log('[PrimaryInvitations] Single invitation sent', response.data)
      } else {
        console.warn('[PrimaryInvitations] API returned success=false', response)
        toast.error(response.message || 'Failed to send invitation')
      }
    } catch (error) {
      console.error('Error sending primary invitation:', error)
      toast.error(error.message || 'Failed to send invitation')
    } finally {
      console.groupEnd()
      setIsSendingSingle(false)
    }
  }

  const handleBulkInvitations = async (event) => {
    event.preventDefault()

    const emails = bulkEmails
      .split(/\n|,/) // allow comma or newline separated
      .map((email) => email.trim())
      .filter(Boolean)

    if (emails.length === 0) {
      toast.error('Please enter at least one email address')
      return
    }

    setIsSendingBulk(true)
    try {
      console.group('[PrimaryInvitations] handleBulkInvitations')
      console.log('Sending bulk invitations', { emails, adminName: resolvedAdminName })
      const response = await primaryInvitationAPI.sendBulk(emails, resolvedAdminName)
      if (response.success) {
        const { successful, failed } = response.data
        toast.success(`Processed ${successful} invitations${failed ? `, ${failed} failed` : ''}`)
        setBulkEmails('')
        fetchInvitations()
        console.log('[PrimaryInvitations] Bulk result', response.data)
      } else {
        console.warn('[PrimaryInvitations] Bulk API success=false', response)
        toast.error(response.message || 'Failed to process bulk invitations')
      }
    } catch (error) {
      console.error('Error sending bulk primary invitations:', error)
      toast.error(error.message || 'Failed to process bulk invitations')
    } finally {
      console.groupEnd()
      setIsSendingBulk(false)
    }
  }

  const handleResend = async (email) => {
    setResendingEmail(email)
    try {
      console.group('[PrimaryInvitations] handleResend')
      console.log('Resending invitation', { email, adminName: resolvedAdminName })
      const response = await primaryInvitationAPI.resend(email, resolvedAdminName)
      if (response.success) {
        toast.success('Invitation resent successfully')
        fetchInvitations()
        console.log('[PrimaryInvitations] Resend result', response.data)
      } else {
        console.warn('[PrimaryInvitations] Resend API success=false', response)
        toast.error(response.message || 'Failed to resend invitation')
      }
    } catch (error) {
      console.error('Error resending primary invitation:', error)
      toast.error(error.message || 'Failed to resend invitation')
    } finally {
      console.groupEnd()
      setResendingEmail(null)
    }
  }

  const copyInviteLink = async (token) => {
    const baseUrl = window.location.origin
    const link = `${baseUrl}/primary-invitation/${token}`
    try {
      await navigator.clipboard.writeText(link)
      toast.success('Invitation link copied!')
      console.log('[PrimaryInvitations] Copied invitation link', { token, link })
    } catch (error) {
      console.error('[PrimaryInvitations] Failed to copy link', error)
      toast.error('Failed to copy link')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white -lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="gradient-bg p-3 -lg">
            <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Primary Invitation</h1>
            <p className="text-gray-600">
              Invite clients to submit company, applicant, and inventor details before starting the patent form
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white -lg shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <PaperAirplaneIcon className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Single Invitation</h2>
          </div>

          <form onSubmit={handleSingleInvitation} className="space-y-4">
            <div>
              <label htmlFor="singleEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Client Email Address
              </label>
              <input
                id="singleEmail"
                type="email"
                value={singleEmail}
                onChange={(event) => setSingleEmail(event.target.value)}
                className="w-full px-3 py-2 border border-gray-300 -md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="client@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="primaryAdminName" className="block text-sm font-medium text-gray-700 mb-1">
                Admin Name (Optional)
              </label>
              <input
                id="primaryAdminName"
                type="text"
                value={adminName}
                onChange={(event) => setAdminName(event.target.value)}
                className="w-full px-3 py-2 border border-gray-300 -md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={user?.name || 'Admin'}
              />
            </div>

            <button
              type="submit"
              disabled={isSendingSingle}
              className="w-full bg-primary-600 text-white py-2 px-4 -md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSendingSingle ? 'Sending...' : 'Send Primary Invitation'}
            </button>
          </form>
        </div>

        <div className="bg-white -lg shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <UsersIcon className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Bulk Invitations</h2>
          </div>

          <form onSubmit={handleBulkInvitations} className="space-y-4">
            <div>
              <label htmlFor="bulkEmails" className="block text-sm font-medium text-gray-700 mb-1">
                Email Addresses (Comma or New Line Separated)
              </label>
              <textarea
                id="bulkEmails"
                value={bulkEmails}
                onChange={(event) => setBulkEmails(event.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 -md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={'client1@example.com\nclient2@example.com'}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSendingBulk}
              className="w-full bg-primary-600 text-white py-2 px-4 -md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSendingBulk ? 'Processing...' : 'Send Bulk Invitations'}
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white -lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ArrowPathIcon className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Primary Invitations</h2>
          </div>
          <button
            type="button"
            onClick={fetchInvitations}
            className="flex items-center text-sm text-primary-600 hover:text-primary-700"
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" /> Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Loading invitations...</div>
        ) : invitations.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No primary invitations sent yet.</div>
        ) : (
          <div className="space-y-3">
            {invitations.map((invitation) => {
              const isCompleted = invitation.status === 'completed'
              const autoPrefill = invitation.autoPrefillMetadata?.enabled

              return (
                <div
                  key={`${invitation._id}-${invitation.token}`}
                  className="flex flex-col md:flex-row md:items-center md:justify-between bg-gray-50 border border-gray-200 -lg p-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">{invitation.email}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                      <span className="flex items-center space-x-1">
                        <CheckCircleIcon className={`h-4 w-4 ${isCompleted ? 'text-green-500' : 'text-primary-500'}`} />
                        <span className="uppercase tracking-wide">{invitation.status}</span>
                      </span>
                      <span>Expires {new Date(invitation.expiresAt).toLocaleDateString()}</span>
                      {invitation.submittedAt && (
                        <span>
                          Completed {new Date(invitation.submittedAt).toLocaleString()}
                        </span>
                      )}
                      <span>{autoPrefill ? 'Auto-prefill enabled' : 'Manual entry'}</span>
                    </div>
                  </div>

                  <div className="mt-3 md:mt-0 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => copyInviteLink(invitation.token)}
                      className="text-xs bg-primary-100 text-primary-700 px-3 py-1  hover:bg-primary-200 transition-colors"
                    >
                      Copy Link
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResend(invitation.email)}
                      disabled={resendingEmail === invitation.email}
                      className="text-xs bg-white border border-primary-200 text-primary-700 px-3 py-1  hover:bg-primary-50 disabled:opacity-50"
                    >
                      {resendingEmail === invitation.email ? 'Resending...' : 'Resend'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 -lg p-6">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-700 space-y-1">
            <p className="font-medium text-blue-900">Primary Invitation Workflow</p>
            <p>• Client completes company, applicant, and inventor details using the secure link.</p>
            <p>• GST and entity certificates are uploaded directly to Cloudinary via the form.</p>
            <p>• If the client email already exists, company details auto-fill and become read-only.</p>
            <p>• Submission timestamp is captured and visible once the form is completed.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrimaryInvitations

