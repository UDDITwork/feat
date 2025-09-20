import React from 'react'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const ReviewAndSubmit = ({ 
  formData, 
  setFieldValue, 
  setNestedFieldValue, 
  setArrayFieldValue, 
  addArrayItem, 
  removeArrayItem 
}) => {
  const getFieldValue = (path) => {
    return path.split('.').reduce((obj, key) => obj?.[key], formData) || 'Not filled by client'
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

  const getStatusIcon = (value) => {
    return value === 'Not filled by client' ? (
      <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
    ) : (
      <CheckCircleIcon className="h-4 w-4 text-green-500" />
    )
  }

  return (
    <div className="space-y-6">
      <div className="form-section">
        <h3 className="form-section-title">Review Your Information</h3>
        <p className="text-gray-600 mb-6">
          Please review all the information below before submitting. You can go back to previous steps to make changes if needed.
        </p>

        {/* Basic Information */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              {getStatusIcon(getFieldValue('typeOfApplication'))}
              <span className="ml-2 text-sm text-gray-600">Type of Application:</span>
              <span className={`ml-2 text-sm font-medium ${getStatusColor(getFieldValue('typeOfApplication'))}`}>
                {getFieldValue('typeOfApplication')}
              </span>
            </div>
            <div className="flex items-center">
              {getStatusIcon(getFieldValue('titleOfInvention'))}
              <span className="ml-2 text-sm text-gray-600">Title:</span>
              <span className={`ml-2 text-sm font-medium ${getStatusColor(getFieldValue('titleOfInvention'))}`}>
                {getFieldValue('titleOfInvention')}
              </span>
            </div>
            <div className="flex items-center">
              {getStatusIcon(getFieldValue('cbrNo'))}
              <span className="ml-2 text-sm text-gray-600">CBR No:</span>
              <span className={`ml-2 text-sm font-medium ${getStatusColor(getFieldValue('cbrNo'))}`}>
                {getFieldValue('cbrNo')}
              </span>
            </div>
            <div className="flex items-center">
              {getStatusIcon(getFieldValue('applicantReference'))}
              <span className="ml-2 text-sm text-gray-600">Reference No:</span>
              <span className={`ml-2 text-sm font-medium ${getStatusColor(getFieldValue('applicantReference'))}`}>
                {getFieldValue('applicantReference')}
              </span>
            </div>
          </div>
        </div>

        {/* Applicant Details */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Applicant Details</h4>
          {(formData.applicants || []).map((applicant, index) => (
            <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-3">Applicant {index + 1}</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  {getStatusIcon(applicant.name)}
                  <span className="ml-2 text-sm text-gray-600">Name:</span>
                  <span className={`ml-2 text-sm font-medium ${getStatusColor(applicant.name)}`}>
                    {applicant.name || 'Not filled by client'}
                  </span>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(applicant.nationality)}
                  <span className="ml-2 text-sm text-gray-600">Nationality:</span>
                  <span className={`ml-2 text-sm font-medium ${getStatusColor(applicant.nationality)}`}>
                    {applicant.nationality || 'Not filled by client'}
                  </span>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(applicant.category)}
                  <span className="ml-2 text-sm text-gray-600">Category:</span>
                  <span className={`ml-2 text-sm font-medium ${getStatusColor(applicant.category)}`}>
                    {applicant.category || 'Not filled by client'}
                  </span>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(applicant.address?.email)}
                  <span className="ml-2 text-sm text-gray-600">Email:</span>
                  <span className={`ml-2 text-sm font-medium ${getStatusColor(applicant.address?.email)}`}>
                    {applicant.address?.email || 'Not filled by client'}
                  </span>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(applicant.address?.contactNumber)}
                  <span className="ml-2 text-sm text-gray-600">Contact:</span>
                  <span className={`ml-2 text-sm font-medium ${getStatusColor(applicant.address?.contactNumber)}`}>
                    {applicant.address?.contactNumber || 'Not filled by client'}
                  </span>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(applicant.address?.city)}
                  <span className="ml-2 text-sm text-gray-600">City:</span>
                  <span className={`ml-2 text-sm font-medium ${getStatusColor(applicant.address?.city)}`}>
                    {applicant.address?.city || 'Not filled by client'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Inventor Details */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Inventor Details</h4>
          {(formData.inventors || []).map((inventor, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-3">Inventor {index + 1}</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  {getStatusIcon(inventor.name)}
                  <span className="ml-2 text-sm text-gray-600">Name:</span>
                  <span className={`ml-2 text-sm font-medium ${getStatusColor(inventor.name)}`}>
                    {inventor.name || 'Not filled by client'}
                  </span>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(inventor.nationality)}
                  <span className="ml-2 text-sm text-gray-600">Nationality:</span>
                  <span className={`ml-2 text-sm font-medium ${getStatusColor(inventor.nationality)}`}>
                    {inventor.nationality || 'Not filled by client'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Patent Agent */}
        {formData.patentAgent && (
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Patent Agent</h4>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  {getStatusIcon(formData.patentAgent.agentName)}
                  <span className="ml-2 text-sm text-gray-600">Agent Name:</span>
                  <span className={`ml-2 text-sm font-medium ${getStatusColor(formData.patentAgent.agentName)}`}>
                    {formData.patentAgent.agentName || 'Not filled by client'}
                  </span>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(formData.patentAgent.inPaNo)}
                  <span className="ml-2 text-sm text-gray-600">IN/PA No:</span>
                  <span className={`ml-2 text-sm font-medium ${getStatusColor(formData.patentAgent.inPaNo)}`}>
                    {formData.patentAgent.inPaNo || 'Not filled by client'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Address for Service */}
        {formData.addressForService && (
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Address for Service</h4>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  {getStatusIcon(formData.addressForService.name)}
                  <span className="ml-2 text-sm text-gray-600">Name:</span>
                  <span className={`ml-2 text-sm font-medium ${getStatusColor(formData.addressForService.name)}`}>
                    {formData.addressForService.name || 'Not filled by client'}
                  </span>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(formData.addressForService.emailId)}
                  <span className="ml-2 text-sm text-gray-600">Email:</span>
                  <span className={`ml-2 text-sm font-medium ${getStatusColor(formData.addressForService.emailId)}`}>
                    {formData.addressForService.emailId || 'Not filled by client'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Priority Claims */}
        {formData.priorityClaims && formData.priorityClaims.length > 0 && (
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Priority Claims</h4>
            {formData.priorityClaims.map((claim, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-3">Priority Claim {index + 1}</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    {getStatusIcon(claim.country)}
                    <span className="ml-2 text-sm text-gray-600">Country:</span>
                    <span className={`ml-2 text-sm font-medium ${getStatusColor(claim.country)}`}>
                      {claim.country || 'Not filled by client'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(claim.applicationNumber)}
                    <span className="ml-2 text-sm text-gray-600">Application No:</span>
                    <span className={`ml-2 text-sm font-medium ${getStatusColor(claim.applicationNumber)}`}>
                      {claim.applicationNumber || 'Not filled by client'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        <div className="p-6 bg-blue-50 rounded-lg">
          <h4 className="text-lg font-semibold text-blue-900 mb-4">Submission Summary</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• All information will be securely stored and encrypted</p>
            <p>• You will receive a confirmation email upon submission</p>
            <p>• The admin can edit any field after submission if needed</p>
            <p>• Fields marked as "Not filled by client" can be completed by the admin</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewAndSubmit
