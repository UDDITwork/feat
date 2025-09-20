import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const FormView = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [submission, setSubmission] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editField, setEditField] = useState('')
  const [editValue, setEditValue] = useState('')
  const [editedBy, setEditedBy] = useState('')

  useEffect(() => {
    loadSubmission()
  }, [id])

  const loadSubmission = async () => {
    try {
      setIsLoading(true)
      const response = await adminAPI.getSubmission(id)
      
      if (response.success) {
        setSubmission(response.data)
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('Error loading submission:', error)
      toast.error('Failed to load submission')
      navigate('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditField = (field, currentValue) => {
    setEditField(field)
    setEditValue(currentValue || '')
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    if (!editField || !editedBy.trim()) {
      toast.error('Please provide field and editor name')
      return
    }

    try {
      const response = await adminAPI.editSubmission(id, editField, editValue, editedBy)
      
      if (response.success) {
        toast.success('Field updated successfully')
        setIsEditing(false)
        setEditField('')
        setEditValue('')
        setEditedBy('')
        loadSubmission() // Reload to get updated data
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('Error updating field:', error)
      toast.error('Failed to update field')
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditField('')
    setEditValue('')
    setEditedBy('')
  }

  const getFieldValue = (path) => {
    return path.split('.').reduce((obj, key) => obj?.[key], submission?.formData) || 'Not filled by client'
  }

  const getArrayFieldValue = (array, index, field) => {
    if (!array || !array[index]) return 'Not filled by client'
    return array[index][field] || 'Not filled by client'
  }

  const getNestedFieldValue = (array, index, section, field) => {
    if (!array || !array[index] || !array[index][section]) return 'Not filled by client'
    return array[index][section][field] || 'Not filled by client'
  }

  const formatDate = (date) => {
    if (!date) return 'Not filled by client'
    return new Date(date).toLocaleDateString('en-GB')
  }

  const getStatusColor = (value) => {
    return value === 'Not filled by client' ? 'text-red-600' : 'text-green-600'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Submission not found</h2>
        <p className="text-gray-600 mt-2">The requested submission could not be found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Form Submission Details</h2>
          <p className="text-gray-600 mt-1">
            Submitted by: {submission.email}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`status-badge ${
            submission.status === 'completed' ? 'status-completed' :
            submission.status === 'pending' ? 'status-pending' :
            'status-draft'
          }`}>
            {submission.status}
          </span>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Submission Info */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Submission Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium text-gray-900">{submission.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Submitted At</p>
            <p className="font-medium text-gray-900">
              {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'Not submitted'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created At</p>
            <p className="font-medium text-gray-900">
              {new Date(submission.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Form Data */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Form Data</h3>
          <p className="text-sm text-gray-500">
            Click on any field to edit it. Fields marked as "Not filled by client" can be completed by admin.
          </p>
        </div>

        <div className="space-y-8">
          {/* Basic Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => handleEditField('typeOfApplication', getFieldValue('typeOfApplication'))}
              >
                <p className="text-sm text-gray-500">Type of Application</p>
                <p className={`font-medium ${getStatusColor(getFieldValue('typeOfApplication'))}`}>
                  {getFieldValue('typeOfApplication')}
                </p>
              </div>
              <div 
                className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => handleEditField('titleOfInvention', getFieldValue('titleOfInvention'))}
              >
                <p className="text-sm text-gray-500">Title of Invention</p>
                <p className={`font-medium ${getStatusColor(getFieldValue('titleOfInvention'))}`}>
                  {getFieldValue('titleOfInvention')}
                </p>
              </div>
              <div 
                className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => handleEditField('cbrNo', getFieldValue('cbrNo'))}
              >
                <p className="text-sm text-gray-500">CBR No</p>
                <p className={`font-medium ${getStatusColor(getFieldValue('cbrNo'))}`}>
                  {getFieldValue('cbrNo')}
                </p>
              </div>
              <div 
                className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => handleEditField('applicantReference', getFieldValue('applicantReference'))}
              >
                <p className="text-sm text-gray-500">Reference No</p>
                <p className={`font-medium ${getStatusColor(getFieldValue('applicantReference'))}`}>
                  {getFieldValue('applicantReference')}
                </p>
              </div>
            </div>
          </div>

          {/* Applicant Details */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Applicant Details</h4>
            {(submission.formData?.applicants || []).map((applicant, index) => (
              <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-3">Applicant {index + 1}</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className="p-3 border rounded-lg cursor-pointer hover:bg-white"
                    onClick={() => handleEditField(`applicants.${index}.name`, applicant.name)}
                  >
                    <p className="text-sm text-gray-500">Name</p>
                    <p className={`font-medium ${getStatusColor(applicant.name)}`}>
                      {applicant.name || 'Not filled by client'}
                    </p>
                  </div>
                  <div 
                    className="p-3 border rounded-lg cursor-pointer hover:bg-white"
                    onClick={() => handleEditField(`applicants.${index}.nationality`, applicant.nationality)}
                  >
                    <p className="text-sm text-gray-500">Nationality</p>
                    <p className={`font-medium ${getStatusColor(applicant.nationality)}`}>
                      {applicant.nationality || 'Not filled by client'}
                    </p>
                  </div>
                  <div 
                    className="p-3 border rounded-lg cursor-pointer hover:bg-white"
                    onClick={() => handleEditField(`applicants.${index}.address.email`, applicant.address?.email)}
                  >
                    <p className="text-sm text-gray-500">Email</p>
                    <p className={`font-medium ${getStatusColor(applicant.address?.email)}`}>
                      {applicant.address?.email || 'Not filled by client'}
                    </p>
                  </div>
                  <div 
                    className="p-3 border rounded-lg cursor-pointer hover:bg-white"
                    onClick={() => handleEditField(`applicants.${index}.address.contactNumber`, applicant.address?.contactNumber)}
                  >
                    <p className="text-sm text-gray-500">Contact Number</p>
                    <p className={`font-medium ${getStatusColor(applicant.address?.contactNumber)}`}>
                      {applicant.address?.contactNumber || 'Not filled by client'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add more sections as needed */}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Field</h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">Field</label>
                <input
                  type="text"
                  value={editField}
                  className="input-field bg-gray-50"
                  readOnly
                />
              </div>
              
              <div>
                <label className="label">New Value</label>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="input-field"
                  placeholder="Enter new value"
                />
              </div>
              
              <div>
                <label className="label label-required">Edited By</label>
                <input
                  type="text"
                  value={editedBy}
                  onChange={(e) => setEditedBy(e.target.value)}
                  className="input-field"
                  placeholder="Your name"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelEdit}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FormView
