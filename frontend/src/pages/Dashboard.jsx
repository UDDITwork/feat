import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  EnvelopeIcon, 
  DocumentTextIcon, 
  UsersIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { emailAPI, adminAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import SendInvitationModal from '../components/SendInvitationModal'
import SubmissionsTable from '../components/SubmissionsTable'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { isAuthenticated, token } = useAuth()
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    pendingSubmissions: 0,
    completedSubmissions: 0,
    draftSubmissions: 0,
    recentSubmissions: 0,
    expiredSubmissions: 0
  })
  const [submissions, setSubmissions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showInvitationModal, setShowInvitationModal] = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    // Only load data if user is authenticated and has a token
    if (isAuthenticated && token) {
      loadDashboardData()
    }
  }, [isAuthenticated, token])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      console.log('🔄 Loading dashboard data...')
      
      // Load dashboard stats
      console.log('📊 Loading dashboard stats...')
      const statsResponse = await adminAPI.getDashboardStats()
      console.log('📊 Stats response:', statsResponse)
      if (statsResponse.success) {
        setStats(statsResponse.data.overview)
      }

      // Load recent submissions
      console.log('📝 Loading recent submissions...')
      const submissionsResponse = await adminAPI.getSubmissions({ limit: 5 })
      console.log('📝 Submissions response:', submissionsResponse)
      if (submissionsResponse.success) {
        setSubmissions(submissionsResponse.data.submissions)
      }

      // Load notifications
      console.log('🔔 Loading notifications...')
      const notificationsResponse = await adminAPI.getNotifications(5)
      console.log('🔔 Notifications response:', notificationsResponse)
      if (notificationsResponse.success) {
        setNotifications(notificationsResponse.data)
      }

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error)
      setError(error.message || 'Failed to load dashboard data')
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
      console.log('✅ Dashboard data loading completed')
    }
  }

  const handleSendInvitation = async (email, adminName) => {
    try {
      const response = await emailAPI.sendInvitation(email, adminName)
      if (response.success) {
        toast.success('Invitation sent successfully!')
        setShowInvitationModal(false)
        loadDashboardData() // Refresh data
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('Error sending invitation:', error)
      toast.error(error.message || 'Failed to send invitation')
    }
  }

  const handleSendBulkInvitations = async (emails, adminName) => {
    try {
      const response = await emailAPI.sendBulkInvitations(emails, adminName)
      if (response.success) {
        toast.success(`Bulk invitations sent! ${response.data.summary.successful} successful, ${response.data.summary.failed} failed`)
        setShowInvitationModal(false)
        loadDashboardData() // Refresh data
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('Error sending bulk invitations:', error)
      toast.error(error.message || 'Failed to send bulk invitations')
    }
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated || !token) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Please log in to access the dashboard</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 -full flex items-center justify-center mb-4">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-teal-800 mb-2">Error loading dashboard</h3>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <div className="mt-6">
            <button
              onClick={() => {
                setError(null)
                loadDashboardData()
              }}
              className="btn-primary"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      name: 'Total Submissions',
      value: stats.totalSubmissions,
      icon: DocumentTextIcon,
      color: 'bg-gradient-to-br from-teal-500 to-teal-600',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Pending',
      value: stats.pendingSubmissions,
      icon: ClockIcon,
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      change: '+3%',
      changeType: 'positive'
    },
    {
      name: 'Completed',
      value: stats.completedSubmissions,
      icon: CheckCircleIcon,
      color: 'bg-gradient-to-br from-sitabience-500 to-sitabience-600',
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'Draft',
      value: stats.draftSubmissions,
      icon: ExclamationTriangleIcon,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      change: '-2%',
      changeType: 'negative'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-3xl font-bold leading-7 text-gradient sm:text-4xl sm:truncate">
            Dashboard
          </h2>
          <p className="mt-3 text-lg text-teal-700 font-medium">
            Overview of your patent application submissions and system activity
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Built by Engineers. Trusted by Founders.
          </p>
        </div>
        <div className="mt-6 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={() => setShowInvitationModal(true)}
            className="btn-primary flex items-center shadow-glow"
          >
            <EnvelopeIcon className="h-5 w-5 mr-3" />
            Send Invitation
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="card hover:shadow-glow transition-all duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`${stat.color} p-4 -xl shadow-lg`}>
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-semibold text-teal-700 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-3xl font-bold text-teal-800">
                      {stat.value}
                    </div>
                    <div className={`ml-3 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'positive' ? 'text-sitabience-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Submissions */}
        <div className="card hover:shadow-glow transition-all duration-300">
          <div className="card-header">
            <h3 className="card-title flex items-center">
              <DocumentTextIcon className="h-6 w-6 mr-3 text-sitabience-500" />
              Recent Submissions
            </h3>
          </div>
          <div className="space-y-4">
            {submissions.length > 0 ? (
              submissions.map((submission) => (
                <div key={submission._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-sitabience-50 -xl border border-sitabience-100">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-sitabience-500 -lg flex items-center justify-center">
                        <UsersIcon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-teal-800">
                        {submission.email}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`status-badge ${
                      submission.status === 'completed' ? 'status-completed' :
                      submission.status === 'pending' ? 'status-pending' :
                      'status-draft'
                    }`}>
                      {submission.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto h-16 w-16 bg-gradient-to-br from-teal-100 to-sitabience-100 -full flex items-center justify-center mb-4">
                  <DocumentTextIcon className="h-8 w-8 text-teal-500" />
                </div>
                <h3 className="text-lg font-semibold text-teal-800 mb-2">No submissions yet</h3>
                <p className="text-sm text-gray-600">
                  Get started by sending your first invitation.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="card hover:shadow-glow transition-all duration-300">
          <div className="card-header">
            <h3 className="card-title flex items-center">
              <BellIcon className="h-6 w-6 mr-3 text-sitabience-500" />
              Recent Notifications
            </h3>
          </div>
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <div key={index} className="flex items-start p-4 bg-gradient-to-r from-sitabience-50 to-green-50 -xl border border-sitabience-200">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-sitabience-500 to-green-500 -lg flex items-center justify-center">
                      <CheckCircleIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-sitabience-800">
                      New form submission
                    </p>
                    <p className="text-xs text-sitabience-700">
                      {notification.email} completed their form
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(notification.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto h-16 w-16 bg-gradient-to-br from-sitabience-100 to-green-100 -full flex items-center justify-center mb-4">
                  <BellIcon className="h-8 w-8 text-sitabience-500" />
                </div>
                <h3 className="text-lg font-semibold text-teal-800 mb-2">No notifications yet</h3>
                <p className="text-sm text-gray-600">
                  You'll see notifications here when clients submit forms.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Send Invitation Modal */}
      {showInvitationModal && (
        <SendInvitationModal
          onClose={() => setShowInvitationModal(false)}
          onSendInvitation={handleSendInvitation}
          onSendBulkInvitations={handleSendBulkInvitations}
        />
      )}
    </div>
  )
}

export default Dashboard
