import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import {
  DocumentTextIcon,
  UserIcon,
  BuildingOfficeIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const FormView = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [submission, setSubmission] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editField, setEditField] = useState('')
  const [editValue, setEditValue] = useState('')
  const [editedBy, setEditedBy] = useState('')
  const [activeTab, setActiveTab] = useState('basic')

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
      navigate('/submissions')
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
        loadSubmission()
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

  const handleExportPDF = async () => {
    try {
      await adminAPI.exportSubmission(id)
      toast.success('Submission exported successfully!')
    } catch (error) {
      console.error('Error exporting:', error)
      toast.error('Failed to export submission')
    }
  }

  const getFieldValue = (path) => {
    return path.split('.').reduce((obj, key) => obj?.[key], submission?.formData) || 'Not provided'
  }

  const formatDate = (date) => {
    if (!date) return 'Not provided'
    return new Date(date).toLocaleDateString('en-GB')
  }

  const getStatusColor = (value) => {
    return value === 'Not provided' ? 'text-gray-400 italic' : 'text-gray-900'
  }

  const FieldRow = ({ label, value, fieldPath }) => (
    <div
      className="p-3 border border-gray-200 -lg cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => handleEditField(fieldPath, value)}
    >
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-sm ${getStatusColor(value)}`}>
        {value || 'Not provided'}
      </p>
    </div>
  )

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

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: DocumentTextIcon },
    { id: 'applicants', name: 'Applicants & Inventors', icon: UserIcon },
    { id: 'forms', name: 'Additional Forms', icon: BuildingOfficeIcon }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white -lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Form Submission Details</h2>
            <p className="text-gray-600 mt-1">
              Submitted by: <span className="font-medium">{submission.email}</span>
            </p>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-sm text-gray-500">
                Submitted: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'Not submitted'}
              </p>
              <p className="text-sm text-gray-500">
                Created: {new Date(submission.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-3 py-1 -full text-sm font-medium ${
              submission.status === 'completed' ? 'bg-green-100 text-green-800' :
              submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {submission.status}
            </span>
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center px-4 py-2 border border-gray-300 -md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export PDF
            </button>
            <button
              onClick={() => navigate('/submissions')}
              className="inline-flex items-center px-4 py-2 border border-transparent -md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white -lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FieldRow label="Application Number" value={getFieldValue('applicationNo')} fieldPath="applicationNo" />
                  <FieldRow label="Filing Date" value={formatDate(getFieldValue('filingDate'))} fieldPath="filingDate" />
                  <FieldRow label="CBR No" value={getFieldValue('cbrNo')} fieldPath="cbrNo" />
                  <FieldRow label="Applicant Reference" value={getFieldValue('applicantReference')} fieldPath="applicantReference" />
                  <FieldRow label="Type of Application" value={getFieldValue('typeOfApplication')} fieldPath="typeOfApplication" />
                  <div className="md:col-span-3">
                    <FieldRow label="Title of Invention" value={getFieldValue('titleOfInvention')} fieldPath="titleOfInvention" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Patent Agent</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FieldRow label="INPA Number" value={getFieldValue('patentAgent.inPaNo')} fieldPath="patentAgent.inPaNo" />
                  <FieldRow label="Agent Name" value={getFieldValue('patentAgent.agentName')} fieldPath="patentAgent.agentName" />
                  <FieldRow label="Mobile Number" value={getFieldValue('patentAgent.mobileNo')} fieldPath="patentAgent.mobileNo" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address for Service</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldRow label="Name" value={getFieldValue('addressForService.name')} fieldPath="addressForService.name" />
                  <FieldRow label="Telephone" value={getFieldValue('addressForService.telephoneNo')} fieldPath="addressForService.telephoneNo" />
                  <FieldRow label="Mobile" value={getFieldValue('addressForService.mobileNo')} fieldPath="addressForService.mobileNo" />
                  <FieldRow label="Email" value={getFieldValue('addressForService.emailId')} fieldPath="addressForService.emailId" />
                  <div className="md:col-span-2">
                    <FieldRow label="Postal Address" value={getFieldValue('addressForService.postalAddress')} fieldPath="addressForService.postalAddress" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Applicants & Inventors Tab */}
          {activeTab === 'applicants' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Applicants</h3>
                {(submission.formData?.applicants || []).length > 0 ? (
                  submission.formData.applicants.map((applicant, index) => (
                    <div key={index} className="mb-6 p-4 bg-gray-50 -lg border border-gray-200">
                      <h5 className="font-medium text-gray-900 mb-3">Applicant {index + 1}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldRow label="Name" value={applicant.name} fieldPath={`applicants.${index}.name`} />
                        <FieldRow label="Gender" value={applicant.gender} fieldPath={`applicants.${index}.gender`} />
                        <FieldRow label="Nationality" value={applicant.nationality} fieldPath={`applicants.${index}.nationality`} />
                        <FieldRow label="Age" value={applicant.age} fieldPath={`applicants.${index}.age`} />
                        <FieldRow label="Category" value={applicant.category} fieldPath={`applicants.${index}.category`} />
                        <FieldRow label="Email" value={applicant.address?.email} fieldPath={`applicants.${index}.address.email`} />
                        <FieldRow label="Contact" value={applicant.address?.contactNumber} fieldPath={`applicants.${index}.address.contactNumber`} />
                        <FieldRow label="City" value={applicant.address?.city} fieldPath={`applicants.${index}.address.city`} />
                        <FieldRow label="State" value={applicant.address?.state} fieldPath={`applicants.${index}.address.state`} />
                        <FieldRow label="PIN Code" value={applicant.address?.pinCode} fieldPath={`applicants.${index}.address.pinCode`} />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No applicants provided</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventors</h3>
                {(submission.formData?.inventors || []).length > 0 ? (
                  submission.formData.inventors.map((inventor, index) => (
                    <div key={index} className="mb-6 p-4 bg-gray-50 -lg border border-gray-200">
                      <h5 className="font-medium text-gray-900 mb-3">Inventor {index + 1}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldRow label="Name" value={inventor.name} fieldPath={`inventors.${index}.name`} />
                        <FieldRow label="Nationality" value={inventor.nationality} fieldPath={`inventors.${index}.nationality`} />
                        <div className="md:col-span-2">
                          <FieldRow label="Address" value={inventor.address} fieldPath={`inventors.${index}.address`} />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No inventors provided</p>
                )}
              </div>
            </div>
          )}

          {/* Additional Forms Tab */}
          {activeTab === 'forms' && (
            <div className="space-y-6">
              {/* Form 2 - Complete Specification */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Form 2 - Complete Specification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldRow label="Invention Title" value={getFieldValue('form2_invention_title')} fieldPath="form2_invention_title" />
                  <FieldRow label="Applicant Name" value={getFieldValue('form2_applicant_name')} fieldPath="form2_applicant_name" />
                  <FieldRow label="Applicant Nationality" value={getFieldValue('form2_applicant_nationality')} fieldPath="form2_applicant_nationality" />
                  <FieldRow label="Specification Type" value={getFieldValue('form2_specification_type')} fieldPath="form2_specification_type" />
                  <div className="md:col-span-2">
                    <FieldRow label="Applicant Address" value={getFieldValue('form2_applicant_address')} fieldPath="form2_applicant_address" />
                  </div>
                  <div className="md:col-span-2">
                    <FieldRow
                      label="Description"
                      value={submission.formData?.form2_specification_description ? `${submission.formData.form2_specification_description.substring(0, 200)}...` : 'Not provided'}
                      fieldPath="form2_specification_description"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FieldRow
                      label="Claims"
                      value={submission.formData?.form2_specification_claims ? `${submission.formData.form2_specification_claims.substring(0, 200)}...` : 'Not provided'}
                      fieldPath="form2_specification_claims"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FieldRow label="Abstract" value={getFieldValue('form2_specification_abstract')} fieldPath="form2_specification_abstract" />
                  </div>
                </div>
              </div>

              {/* Form 3 */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Form 3 - Statement and Undertaking</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FieldRow label="Undertaking" value={getFieldValue('form3_undertaking_checked') ? 'Accepted' : 'Not accepted'} fieldPath="form3_undertaking_checked" />
                  <FieldRow label="Date" value={formatDate(getFieldValue('form3_date'))} fieldPath="form3_date" />
                  <FieldRow label="Signature" value={getFieldValue('form3_signature') ? 'Uploaded' : 'Not uploaded'} fieldPath="form3_signature" />
                </div>
              </div>

              {/* Form 5 */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Form 5 - Declaration as to Inventorship</h3>
                {(submission.formData?.form5_inventors || []).length > 0 ? (
                  <div className="space-y-4">
                    {submission.formData.form5_inventors.map((inventor, index) => (
                      <div key={index} className="p-4 bg-gray-50 -lg">
                        <h5 className="font-medium text-gray-900 mb-3">Inventor {index + 1}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FieldRow label="Name" value={inventor.name} fieldPath={`form5_inventors.${index}.name`} />
                          <FieldRow label="Nationality" value={inventor.nationality} fieldPath={`form5_inventors.${index}.nationality`} />
                          <div className="md:col-span-3">
                            <FieldRow label="Address" value={inventor.address} fieldPath={`form5_inventors.${index}.address`} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No Form 5 data</p>
                )}
              </div>

              {/* Form 6 */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Form 6 - Change in Applicant</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldRow label="Application Number" value={getFieldValue('form6_application_number')} fieldPath="form6_application_number" />
                  <FieldRow label="Filing Date" value={formatDate(getFieldValue('form6_filing_date'))} fieldPath="form6_filing_date" />
                  <div className="md:col-span-2">
                    <FieldRow label="Change Reason" value={getFieldValue('form6_change_reason')} fieldPath="form6_change_reason" />
                  </div>
                  <FieldRow label="Former Applicant" value={getFieldValue('form6_former_applicant_name')} fieldPath="form6_former_applicant_name" />
                  <FieldRow label="New Applicant" value={getFieldValue('form6_new_applicant_name')} fieldPath="form6_new_applicant_name" />
                </div>
              </div>

              {/* Form 7A */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Form 7A - Opposition</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldRow label="Application Number" value={getFieldValue('form7A_application_number')} fieldPath="form7A_application_number" />
                  <FieldRow label="Publication Date" value={formatDate(getFieldValue('form7A_publication_date'))} fieldPath="form7A_publication_date" />
                  <FieldRow label="Opponent Name" value={getFieldValue('form7A_opponent_name')} fieldPath="form7A_opponent_name" />
                  <FieldRow label="Opponent Nationality" value={getFieldValue('form7A_opponent_nationality')} fieldPath="form7A_opponent_nationality" />
                </div>
              </div>

              {/* Form 8 */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Form 8 - Mention of Inventor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldRow label="Requestor Name" value={getFieldValue('form8_requestor_name')} fieldPath="form8_requestor_name" />
                  <FieldRow label="Requestor Capacity" value={getFieldValue('form8_requestor_capacity')} fieldPath="form8_requestor_capacity" />
                </div>
                {(submission.formData?.form8_inventors || []).length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h5 className="font-medium text-gray-900">Inventors to Mention:</h5>
                    {submission.formData.form8_inventors.map((inventor, index) => (
                      <div key={index} className="p-3 bg-gray-50 -lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <FieldRow label="Name" value={inventor.name} fieldPath={`form8_inventors.${index}.name`} />
                          <FieldRow label="Nationality" value={inventor.nationality} fieldPath={`form8_inventors.${index}.nationality`} />
                          <FieldRow label="Address" value={inventor.address} fieldPath={`form8_inventors.${index}.address`} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form 13 */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Form 13 - Amendment Request</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldRow label="Application Number" value={getFieldValue('form13_application_number')} fieldPath="form13_application_number" />
                  <FieldRow label="Applicant Name" value={getFieldValue('form13_applicant_name')} fieldPath="form13_applicant_name" />
                  <FieldRow label="Amendment Reason" value={getFieldValue('form13_amendment_reason_type')} fieldPath="form13_amendment_reason_type" />
                  <FieldRow label="Section 59 Compliance" value={getFieldValue('form13_declaration_section59') ? 'Yes' : 'No'} fieldPath="form13_declaration_section59" />
                </div>
              </div>

              {/* Form 16 */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Form 16 - Registration of Title</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldRow label="Patent Number" value={getFieldValue('form16_patent_number')} fieldPath="form16_patent_number" />
                  <FieldRow label="Transaction Type" value={getFieldValue('form16_transaction_type')} fieldPath="form16_transaction_type" />
                  <FieldRow label="Transferor" value={getFieldValue('form16_transferor_name')} fieldPath="form16_transferor_name" />
                  <FieldRow label="Transferee" value={getFieldValue('form16_transferee_name')} fieldPath="form16_transferee_name" />
                  <FieldRow label="Transaction Date" value={formatDate(getFieldValue('form16_transaction_date'))} fieldPath="form16_transaction_date" />
                </div>
              </div>

              {/* Form 26 */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Form 26 - Authorization of Agent</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldRow label="Principal Name" value={getFieldValue('form26_principal_name')} fieldPath="form26_principal_name" />
                  <FieldRow label="Authorization Mode" value={getFieldValue('form26_authorization_mode')} fieldPath="form26_authorization_mode" />
                </div>
                {(submission.formData?.form26_agents || []).length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h5 className="font-medium text-gray-900">Authorized Agents:</h5>
                    {submission.formData.form26_agents.map((agent, index) => (
                      <div key={index} className="p-3 bg-gray-50 -lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <FieldRow label="Agent Name" value={agent.name} fieldPath={`form26_agents.${index}.name`} />
                          <FieldRow label="INPA Number" value={agent.inpa_number} fieldPath={`form26_agents.${index}.inpa_number`} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form 28 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Form 28 - Entity Declaration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldRow label="Applicant Name" value={getFieldValue('form28_applicant_name')} fieldPath="form28_applicant_name" />
                  <FieldRow label="Entity Type" value={getFieldValue('form28_entity_type')} fieldPath="form28_entity_type" />
                  <FieldRow label="Application Number" value={getFieldValue('form28_application_number')} fieldPath="form28_application_number" />
                  <FieldRow label="Declaration Correctness" value={getFieldValue('form28_declaration_correctness') ? 'Accepted' : 'Not accepted'} fieldPath="form28_declaration_correctness" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white -lg p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Field</h3>
              <button onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-500">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                <input
                  type="text"
                  value={editField}
                  className="w-full px-3 py-2 border border-gray-300 -md bg-gray-50"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Value</label>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 -md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter new value"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Edited By *</label>
                <input
                  type="text"
                  value={editedBy}
                  onChange={(e) => setEditedBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 -md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelEdit}
                className="inline-flex items-center px-4 py-2 border border-gray-300 -md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="inline-flex items-center px-4 py-2 border border-transparent -md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <CheckCircleIcon className="h-4 w-4 mr-2" />
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
