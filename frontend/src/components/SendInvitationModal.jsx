import React, { useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { XMarkIcon, EnvelopeIcon, UsersIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from './LoadingSpinner'

const SendInvitationModal = ({ onClose, onSendInvitation, onSendBulkInvitations }) => {
  const [activeTab, setActiveTab] = useState('single')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    emails: '',
    adminName: 'SITABIENCEIP Admin'
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateSingleEmail = () => {
    const newErrors = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.adminName.trim()) {
      newErrors.adminName = 'Admin name is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateBulkEmails = () => {
    const newErrors = {}
    
    if (!formData.emails.trim()) {
      newErrors.emails = 'Email list is required'
    } else {
      const emailList = formData.emails.split('\n').map(email => email.trim()).filter(email => email)
      const invalidEmails = emailList.filter(email => !/\S+@\S+\.\S+/.test(email))
      
      if (invalidEmails.length > 0) {
        newErrors.emails = `Invalid emails: ${invalidEmails.join(', ')}`
      }
      
      if (emailList.length === 0) {
        newErrors.emails = 'Please enter at least one valid email'
      }
    }
    
    if (!formData.adminName.trim()) {
      newErrors.adminName = 'Admin name is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSingleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateSingleEmail()) {
      return
    }
    
    setIsLoading(true)
    try {
      await onSendInvitation(formData.email, formData.adminName)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateBulkEmails()) {
      return
    }
    
    const emailList = formData.emails.split('\n').map(email => email.trim()).filter(email => email)
    
    setIsLoading(true)
    try {
      await onSendBulkInvitations(emailList, formData.adminName)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden -lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="gradient-bg p-2 -lg mr-3">
                      <EnvelopeIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                        Send Form Invitation
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        Send patent application form to clients
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-1 mb-6 bg-gray-100 p-1 -lg">
                  <button
                    type="button"
                    onClick={() => setActiveTab('single')}
                    className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium -md transition-colors ${
                      activeTab === 'single'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    Single Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('bulk')}
                    className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium -md transition-colors ${
                      activeTab === 'bulk'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <UsersIcon className="h-4 w-4 mr-2" />
                    Bulk Emails
                  </button>
                </div>

                {/* Single Email Form */}
                {activeTab === 'single' && (
                  <form onSubmit={handleSingleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="label label-required">
                        Client Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`input-field ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
                        placeholder="client@company.com"
                        disabled={isLoading}
                      />
                      {errors.email && (
                        <p className="form-error">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="adminName" className="label label-required">
                        Admin Name
                      </label>
                      <input
                        type="text"
                        id="adminName"
                        name="adminName"
                        value={formData.adminName}
                        onChange={handleChange}
                        className={`input-field ${errors.adminName ? 'border-red-300 focus:ring-red-500' : ''}`}
                        placeholder="Your name"
                        disabled={isLoading}
                      />
                      {errors.adminName && (
                        <p className="form-error">{errors.adminName}</p>
                      )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary"
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-primary flex items-center"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <EnvelopeIcon className="h-4 w-4 mr-2" />
                            Send Invitation
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* Bulk Email Form */}
                {activeTab === 'bulk' && (
                  <form onSubmit={handleBulkSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="emails" className="label label-required">
                        Email List
                      </label>
                      <textarea
                        id="emails"
                        name="emails"
                        rows={6}
                        value={formData.emails}
                        onChange={handleChange}
                        className={`input-field ${errors.emails ? 'border-red-300 focus:ring-red-500' : ''}`}
                        placeholder="client1@company.com&#10;client2@company.com&#10;client3@company.com"
                        disabled={isLoading}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter one email address per line
                      </p>
                      {errors.emails && (
                        <p className="form-error">{errors.emails}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="adminName" className="label label-required">
                        Admin Name
                      </label>
                      <input
                        type="text"
                        id="adminName"
                        name="adminName"
                        value={formData.adminName}
                        onChange={handleChange}
                        className={`input-field ${errors.adminName ? 'border-red-300 focus:ring-red-500' : ''}`}
                        placeholder="Your name"
                        disabled={isLoading}
                      />
                      {errors.adminName && (
                        <p className="form-error">{errors.adminName}</p>
                      )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary"
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-primary flex items-center"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <UsersIcon className="h-4 w-4 mr-2" />
                            Send Bulk Invitations
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* Info Box */}
                <div className="mt-6 p-4 bg-blue-50 -lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">What happens next?</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Client receives a professional email with form link</li>
                    <li>• Link is valid for 30 days</li>
                    <li>• You'll be notified when form is completed</li>
                    <li>• All data is securely stored and encrypted</li>
                  </ul>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default SendInvitationModal
