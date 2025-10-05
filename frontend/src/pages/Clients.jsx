import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { adminAPI } from '../services/api'
import toast from 'react-hot-toast'
import { 
  UsersIcon, 
  MagnifyingGlassIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

const Clients = () => {
  const { user } = useAuth()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50
  })
  const [statusSummary, setStatusSummary] = useState({})

  // Fetch clients data from API
  const fetchClients = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== 'all' && { status: filterStatus })
      }

      const response = await adminAPI.getClients(params)
      
      if (response.success) {
        setClients(response.data.clients)
        setPagination(response.data.pagination)
        setStatusSummary(response.data.statusSummary)
      } else {
        toast.error('Failed to load clients data')
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
      toast.error('Failed to load clients data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [pagination.currentPage, searchTerm, filterStatus])

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.currentPage !== 1) {
        setPagination(prev => ({ ...prev, currentPage: 1 }))
      } else {
        fetchClients()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Handle filter change
  useEffect(() => {
    if (pagination.currentPage !== 1) {
      setPagination(prev => ({ ...prev, currentPage: 1 }))
    } else {
      fetchClients()
    }
  }, [filterStatus])

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      prospect: { color: 'bg-yellow-100 text-yellow-800', label: 'Prospect' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' }
    }

    const config = statusConfig[status] || statusConfig.prospect

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 -full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin -full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading clients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white -lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="gradient-bg p-3 -lg">
              <UsersIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
              <p className="text-gray-600">Manage your client relationships and information</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white -lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.totalItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-white -lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900">
                {statusSummary.active || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white -lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Prospects</p>
              <p className="text-2xl font-bold text-gray-900">
                {statusSummary.prospect || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white -lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <EnvelopeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">
                {pagination.totalItems}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white -lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 -md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 -md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="prospect">Prospect</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-white -lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                <p className="text-sm text-gray-600">{client.company}</p>
              </div>
              {getStatusBadge(client.status)}
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                {client.email}
              </div>
              {client.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                  {client.phone}
                </div>
              )}
              {client.address && (
                <div className="flex items-start text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                  <span className="line-clamp-2">{client.address}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Submissions: {client.submissions}</span>
                <span>Last Contact: {formatDate(client.lastContact)}</span>
              </div>
              {client.notes && (
                <p className="text-sm text-gray-600 line-clamp-2">{client.notes}</p>
              )}
            </div>

            <div className="mt-4 flex space-x-2">
              <button 
                onClick={() => window.open(`/submission/${client.id}`, '_blank')}
                className="flex-1 bg-primary-100 text-primary-700 px-3 py-2 -md text-sm font-medium hover:bg-primary-200 transition-colors"
              >
                View Submission
              </button>
              <button 
                onClick={() => window.open(`mailto:${client.email}`, '_blank')}
                className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 -md text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Contact
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {clients.length === 0 && !loading && (
        <div className="text-center py-12">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No clients found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'No form submissions found. Clients will appear here when they submit forms.'
            }
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.totalItems}</span>{' '}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, pagination.currentPage - 2) + i
                  if (pageNum > pagination.totalPages) return null
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === pagination.currentPage
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Clients
