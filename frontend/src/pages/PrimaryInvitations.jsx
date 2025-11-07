import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  ClipboardDocumentListIcon,
  PaperAirplaneIcon,
  UsersIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  XMarkIcon
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
  const [activeTab, setActiveTab] = useState('manage')
  const [completedInvitations, setCompletedInvitations] = useState([])
  const [completedMeta, setCompletedMeta] = useState({ page: 1, total: 0, hasMore: false })
  const [completedSearchInput, setCompletedSearchInput] = useState('')
  const [completedSearchTerm, setCompletedSearchTerm] = useState('')
  const [isLoadingCompleted, setIsLoadingCompleted] = useState(false)
  const [isLoadingCompletedDetails, setIsLoadingCompletedDetails] = useState(false)
  const [selectedCompletedInvitation, setSelectedCompletedInvitation] = useState(null)
  const [documentLoadingField, setDocumentLoadingField] = useState(null)

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

  const loadCompletedInvitations = async (page = 1, searchTerm = completedSearchTerm) => {
    const limit = 20
    const trimmedSearch = searchTerm.trim()
    const timerLabel = `[PrimaryInvitations] loadCompletedInvitations page:${page}`
    console.time(timerLabel)
    console.group('[PrimaryInvitations] loadCompletedInvitations')
    console.info('Params', { page, limit, search: trimmedSearch })

    try {
      setIsLoadingCompleted(true)
      const response = await primaryInvitationAPI.listCompleted({ page, limit, search: trimmedSearch })
      if (response.success) {
        const results = response.data?.results || []
        setCompletedInvitations((prev) => {
          if (page === 1) {
            return results
          }

          const existingIds = new Set(prev.map((item) => item._id))
          const merged = [...prev]
          results.forEach((item) => {
            if (!existingIds.has(item._id)) {
              merged.push(item)
            }
          })
          return merged
        })

        setCompletedMeta({
          page: response.data?.page || page,
          pageSize: response.data?.pageSize || results.length,
          total: response.data?.total || results.length,
          hasMore: Boolean(response.data?.hasMore),
        })

        setCompletedSearchTerm(trimmedSearch)
        console.info('[PrimaryInvitations] Completed invitations loaded', {
          count: results.length,
          total: response.data?.total,
          hasMore: response.data?.hasMore,
        })
      } else {
        console.warn('[PrimaryInvitations] Completed API success=false', response)
        toast.error(response.message || 'Failed to load completed invitations')
      }
    } catch (error) {
      console.error('Failed to load completed invitations:', error)
      toast.error(error.message || 'Failed to load completed invitations')
    } finally {
      console.groupEnd()
      console.timeEnd(timerLabel)
      setIsLoadingCompleted(false)
    }
  }

  const handleCompletedSearch = (event) => {
    event.preventDefault()
    console.log('[PrimaryInvitations] Search completed invitations', { term: completedSearchInput })
    loadCompletedInvitations(1, completedSearchInput)
  }

  const handleResetCompletedSearch = () => {
    console.log('[PrimaryInvitations] Reset completed invitations search')
    setCompletedSearchInput('')
    loadCompletedInvitations(1, '')
  }

  const handleLoadMoreCompleted = () => {
    if (!completedMeta.hasMore) {
      console.info('[PrimaryInvitations] No more completed invitations to load')
      return
    }
    const nextPage = (completedMeta.page || 1) + 1
    console.log('[PrimaryInvitations] Loading more completed invitations', { nextPage })
    loadCompletedInvitations(nextPage)
  }

  const handleViewCompletedDetails = async (invitationId) => {
    if (!invitationId) {
      return
    }

    console.group('[PrimaryInvitations] handleViewCompletedDetails')
    console.info('Fetching detail for invitation', { invitationId })
    setIsLoadingCompletedDetails(true)

    try {
      const response = await primaryInvitationAPI.getCompletedById(invitationId)
      if (response.success) {
        setSelectedCompletedInvitation(response.data)
        console.info('Completed invitation detail loaded', response.data)
      } else {
        console.warn('Completed invitation detail success=false', response)
        toast.error(response.message || 'Failed to load invitation details')
      }
    } catch (error) {
      console.error('Error loading completed invitation detail:', error)
      toast.error(error.message || 'Failed to load invitation details')
    } finally {
      console.groupEnd()
      setIsLoadingCompletedDetails(false)
    }
  }

  const closeCompletedDetails = () => {
    console.log('[PrimaryInvitations] Closing completed invitation detail view')
    setSelectedCompletedInvitation(null)
  }

  const openDocumentWithBlob = async (fieldName, doc) => {
    if (!doc?.secureUrl) {
      toast.error('Document link is unavailable')
      return
    }

    console.group('[PrimaryInvitations] openDocumentWithBlob')
    console.info('Opening document', { fieldName, url: doc.secureUrl })
    setDocumentLoadingField(fieldName)

    try {
      const response = await fetch(doc.secureUrl, { mode: 'cors' })
      if (!response.ok) {
        throw new Error(`Failed to fetch document (${response.status})`)
      }

      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const newWindow = window.open(blobUrl, '_blank', 'noopener')

      if (!newWindow) {
        // Fallback: trigger download if popup blocked
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = doc.originalFilename || `${fieldName}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl)
      }, 60_000)

      console.info('Document opened successfully')
    } catch (error) {
      console.error('Error opening document via blob:', error)
      toast.error(error.message || 'Failed to open document')
    } finally {
      console.groupEnd()
      setDocumentLoadingField(null)
    }
  }

  useEffect(() => {
    fetchInvitations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (activeTab === 'completed') {
      loadCompletedInvitations(1, completedSearchTerm)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== 'completed') {
      setSelectedCompletedInvitation(null)
    }
  }, [activeTab])

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

  const tabButtonClass = (tab) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      activeTab === tab
        ? 'border-primary-600 text-primary-700 bg-primary-50'
        : 'border-transparent text-gray-600 hover:text-primary-600 hover:border-primary-300'
    }`

  const formatDateTime = (value, fallback = 'Not recorded') => {
    if (!value) {
      return fallback
    }

    try {
      return new Date(value).toLocaleString()
    } catch (error) {
      console.warn('[PrimaryInvitations] Failed to format date', { value, error })
      return fallback
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
        <div className="mt-6 flex space-x-2 border-b border-gray-200">
          <button
            type="button"
            className={tabButtonClass('manage')}
            onClick={() => setActiveTab('manage')}
          >
            Manage Invitations
          </button>
          <button
            type="button"
            className={tabButtonClass('completed')}
            onClick={() => setActiveTab('completed')}
          >
            Completed Dashboard
          </button>
        </div>
      </div>

      {activeTab === 'manage' && (
        <>
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
        </>
      )}

      {activeTab === 'completed' && (
        <div className="space-y-6">
          <div className="bg-white -lg shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-2">
                <MagnifyingGlassIcon className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">Completed Invitations</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span>Total: {completedMeta.total}</span>
                <button
                  type="button"
                  onClick={() => loadCompletedInvitations(1, completedSearchTerm)}
                  className="flex items-center text-primary-600 hover:text-primary-700"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-1" /> Refresh
                </button>
              </div>
            </div>

            <form onSubmit={handleCompletedSearch} className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={completedSearchInput}
                  onChange={(event) => setCompletedSearchInput(event.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 -md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Search by email, company name, or GST number"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-4 py-2 -md hover:bg-primary-700 transition-colors"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={handleResetCompletedSearch}
                  className="bg-gray-100 text-gray-700 px-4 py-2 -md hover:bg-gray-200 transition-colors disabled:opacity-50"
                  disabled={!completedSearchTerm && !completedSearchInput}
                >
                  Clear
                </button>
              </div>
            </form>

            {isLoadingCompleted ? (
              <div className="py-8 text-center text-gray-500">Loading completed invitations...</div>
            ) : completedInvitations.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No completed invitations found.</div>
            ) : (
              <div className="space-y-3">
                {completedInvitations.map((invitation) => {
                  const submittedAtDisplay = formatDateTime(invitation.submittedAt, 'Submission pending')
                  const companyName = invitation.companyInfo?.name || 'Unknown company'
                  const inventorCount = Array.isArray(invitation.inventors) ? invitation.inventors.length : 0

                  return (
                    <div
                      key={invitation._id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between bg-gray-50 border border-gray-200 -lg p-4 space-y-3 md:space-y-0"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-900">{invitation.email}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                          <span>Company: {companyName}</span>
                          <span>Submitted: {submittedAtDisplay}</span>
                          <span>Inventors: {inventorCount}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => copyInviteLink(invitation.token)}
                          className="text-xs bg-primary-100 text-primary-700 px-3 py-1  hover:bg-primary-200 transition-colors"
                        >
                          Copy Link
                        </button>
                        <button
                          type="button"
                          onClick={() => handleViewCompletedDetails(invitation._id)}
                          className="flex items-center text-xs bg-white border border-primary-200 text-primary-700 px-3 py-1  hover:bg-primary-50 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {completedMeta.hasMore && !isLoadingCompleted && (
              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={handleLoadMoreCompleted}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Load more
                </button>
              </div>
            )}
          </div>

          {selectedCompletedInvitation && (
            <div className="bg-white -lg shadow-sm border border-primary-200 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Invitation Details</h3>
                  <p className="text-sm text-gray-600">Review the information submitted by the client.</p>
                </div>
                <button
                  type="button"
                  onClick={closeCompletedDetails}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close details panel"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3 text-sm text-gray-700">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">General</h4>
                  <p><span className="font-medium text-gray-900">Email:</span> {selectedCompletedInvitation.email}</p>
                  <p><span className="font-medium text-gray-900">Admin:</span> {selectedCompletedInvitation.adminName || '—'}</p>
                  <p><span className="font-medium text-gray-900">Invited:</span> {formatDateTime(selectedCompletedInvitation.invitedAt)}</p>
                  <p><span className="font-medium text-gray-900">Submitted:</span> {formatDateTime(selectedCompletedInvitation.submittedAt)}</p>
                </div>

                <div className="space-y-3 text-sm text-gray-700">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Company Info</h4>
                  <p><span className="font-medium text-gray-900">Name:</span> {selectedCompletedInvitation.companyInfo?.name || '—'}</p>
                  <p><span className="font-medium text-gray-900">Address:</span> {selectedCompletedInvitation.companyInfo?.address || '—'}</p>
                  <p><span className="font-medium text-gray-900">Pin Code:</span> {selectedCompletedInvitation.companyInfo?.pinCode || '—'}</p>
                  <p><span className="font-medium text-gray-900">GST Number:</span> {selectedCompletedInvitation.companyInfo?.gstNumber || '—'}</p>
                  <p><span className="font-medium text-gray-900">Entity Type:</span> {selectedCompletedInvitation.companyInfo?.entityType || '—'}</p>
                  <p>
                    <span className="font-medium text-gray-900">GST Certificate:</span>{' '}
                    {selectedCompletedInvitation.companyInfo?.gstCertificate?.secureUrl ? (
                      <button
                        type="button"
                        onClick={() => openDocumentWithBlob('gstCertificate', selectedCompletedInvitation.companyInfo.gstCertificate)}
                        className="text-primary-600 hover:text-primary-700 underline disabled:opacity-50"
                        disabled={documentLoadingField === 'gstCertificate'}
                      >
                        {documentLoadingField === 'gstCertificate' ? 'Opening…' : 'View document'}
                      </button>
                    ) : (
                      'Not uploaded'
                    )}
                  </p>
                  <p>
                    <span className="font-medium text-gray-900">Entity Certificate:</span>{' '}
                    {selectedCompletedInvitation.companyInfo?.entityCertificate?.secureUrl ? (
                      <button
                        type="button"
                        onClick={() => openDocumentWithBlob('entityCertificate', selectedCompletedInvitation.companyInfo.entityCertificate)}
                        className="text-primary-600 hover:text-primary-700 underline disabled:opacity-50"
                        disabled={documentLoadingField === 'entityCertificate'}
                      >
                        {documentLoadingField === 'entityCertificate' ? 'Opening…' : 'View document'}
                      </button>
                    ) : (
                      'Not uploaded'
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3 text-sm text-gray-700">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Applicant Info</h4>
                  <p><span className="font-medium text-gray-900">Name:</span> {selectedCompletedInvitation.applicantInfo?.name || '—'}</p>
                  <p><span className="font-medium text-gray-900">Address:</span> {selectedCompletedInvitation.applicantInfo?.address || '—'}</p>
                  <p><span className="font-medium text-gray-900">Pin Code:</span> {selectedCompletedInvitation.applicantInfo?.pinCode || '—'}</p>
                  <p><span className="font-medium text-gray-900">Same As Company:</span> {selectedCompletedInvitation.applicantInfo?.sameAsCompany ? 'Yes' : 'No'}</p>
                </div>

                <div className="space-y-3 text-sm text-gray-700">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Comments</h4>
                  <div className="bg-gray-50 border border-gray-200 -md p-3 min-h-[80px]">
                    {selectedCompletedInvitation.comments ? (
                      <span>{selectedCompletedInvitation.comments}</span>
                    ) : (
                      <span className="text-gray-400">No comments provided.</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Inventors</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(!selectedCompletedInvitation.inventors || selectedCompletedInvitation.inventors.length === 0) ? (
                    <div className="border border-gray-200 bg-gray-50 -md p-4 text-sm text-gray-600">
                      No inventor details submitted.
                    </div>
                  ) : (
                    (selectedCompletedInvitation.inventors || []).map((inventor, index) => (
                      <div
                        key={`${inventor?.name || 'inventor'}-${index}`}
                        className="border border-gray-200 bg-gray-50 -md p-4 space-y-2 text-sm text-gray-700"
                      >
                        <p className="font-semibold text-gray-900">Inventor {index + 1}</p>
                        <p><span className="font-medium text-gray-900">Name:</span> {inventor?.name || '—'}</p>
                        <p><span className="font-medium text-gray-900">Address:</span> {inventor?.address || '—'}</p>
                        <p><span className="font-medium text-gray-900">Pin Code:</span> {inventor?.pinCode || '—'}</p>
                        <p><span className="font-medium text-gray-900">Nationality:</span> {inventor?.nationality || '—'}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {isLoadingCompletedDetails && (
                <div className="text-sm text-gray-500">Refreshing details...</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PrimaryInvitations

