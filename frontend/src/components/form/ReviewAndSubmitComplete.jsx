import React from 'react'
import { CheckCircleIcon, ExclamationTriangleIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

const ReviewAndSubmitComplete = ({ formData }) => {
  const getFieldValue = (path) => {
    const value = path.split('.').reduce((obj, key) => obj?.[key], formData)
    return value || 'Not filled by client'
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

  const FieldRow = ({ label, value }) => (
    <div className="flex items-start py-2 border-b border-gray-100">
      <div className="flex items-center min-w-0 flex-1">
        {getStatusIcon(value)}
        <span className="ml-2 text-sm text-gray-600 w-1/3">{label}:</span>
        <span className={`ml-2 text-sm font-medium ${getStatusColor(value)} flex-1`}>
          {value}
        </span>
      </div>
    </div>
  )

  const SectionTitle = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-3 mb-4 mt-8 pb-3 border-b-2 border-indigo-200">
      {Icon && <Icon className="h-6 w-6 text-indigo-600" />}
      <h3 className="text-lg font-semibold text-indigo-900">{title}</h3>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 -lg shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Review Your Complete Application</h2>
        <p className="text-indigo-100">
          Please carefully review ALL information below before final submission. You can go back to any step to make changes.
        </p>
      </div>

      {/* FORM 1 - BASIC APPLICATION */}
      <div className="bg-white p-6 -lg shadow-sm border border-gray-200">
        <SectionTitle icon={DocumentTextIcon} title="Form 1 - Basic Patent Application" />

        <h4 className="font-semibold text-gray-800 mt-4 mb-3">Basic Information</h4>
        <FieldRow label="Type of Application" value={getFieldValue('typeOfApplication')} />
        <FieldRow label="Title of Invention" value={getFieldValue('titleOfInvention')} />
        <FieldRow label="CBR Number" value={getFieldValue('cbrNo')} />
        <FieldRow label="Applicant Reference" value={getFieldValue('applicantReference')} />

        <h4 className="font-semibold text-gray-800 mt-6 mb-3">Applicants</h4>
        {(formData.applicants || []).map((applicant, index) => (
          <div key={index} className="mb-4 p-4 bg-gray-50 -lg">
            <p className="font-medium text-gray-900 mb-2">Applicant {index + 1}</p>
            <FieldRow label="Name" value={applicant.name || 'Not filled'} />
            <FieldRow label="Nationality" value={applicant.nationality || 'Not filled'} />
            <FieldRow label="Email" value={applicant.address?.email || 'Not filled'} />
            <FieldRow label="Contact" value={applicant.address?.contactNumber || 'Not filled'} />
          </div>
        ))}

        <h4 className="font-semibold text-gray-800 mt-6 mb-3">Inventors</h4>
        {(formData.inventors || []).map((inventor, index) => (
          <div key={index} className="mb-4 p-4 bg-gray-50 -lg">
            <p className="font-medium text-gray-900 mb-2">Inventor {index + 1}</p>
            <FieldRow label="Name" value={inventor.name || 'Not filled'} />
            <FieldRow label="Nationality" value={inventor.nationality || 'Not filled'} />
          </div>
        ))}

        <h4 className="font-semibold text-gray-800 mt-6 mb-3">Patent Agent</h4>
        <FieldRow label="Agent Name" value={formData.patentAgent?.agentName || 'Not filled'} />
        <FieldRow label="INPA Number" value={formData.patentAgent?.inPaNo || 'Not filled'} />
      </div>

      {/* FORM 2 - COMPLETE SPECIFICATION */}
      {formData.form2_invention_title && (
        <div className="bg-white p-6 -lg shadow-sm border border-gray-200">
          <SectionTitle icon={DocumentTextIcon} title="Form 2 - Complete Specification" />
          <FieldRow label="Invention Title" value={getFieldValue('form2_invention_title')} />
          <FieldRow label="Applicant Name" value={getFieldValue('form2_applicant_name')} />
          <FieldRow label="Applicant Nationality" value={getFieldValue('form2_applicant_nationality')} />
          <FieldRow label="Specification Type" value={getFieldValue('form2_specification_type')} />
          <FieldRow label="Description" value={formData.form2_specification_description ? `${formData.form2_specification_description.substring(0, 100)}...` : 'Not filled'} />
          <FieldRow label="Claims" value={formData.form2_specification_claims ? `${formData.form2_specification_claims.substring(0, 100)}...` : 'Not filled'} />
          <FieldRow label="Abstract" value={formData.form2_specification_abstract || 'Not filled'} />
        </div>
      )}

      {/* FORM 3 - STATEMENT & UNDERTAKING */}
      {formData.form3_undertaking_checked && (
        <div className="bg-white p-6 -lg shadow-sm border border-gray-200">
          <SectionTitle icon={DocumentTextIcon} title="Form 3 - Statement & Undertaking" />
          <FieldRow label="Undertaking Accepted" value={formData.form3_undertaking_checked ? 'Yes' : 'No'} />
          <FieldRow label="Date" value={formatDate(formData.form3_date)} />
          <FieldRow label="Signature" value={formData.form3_signature?.name || 'Not uploaded'} />
        </div>
      )}

      {/* FORM 5 - INVENTORSHIP DECLARATION */}
      {formData.form5_inventors && formData.form5_inventors.length > 0 && (
        <div className="bg-white p-6 -lg shadow-sm border border-gray-200">
          <SectionTitle icon={DocumentTextIcon} title="Form 5 - Declaration as to Inventorship" />
          {formData.form5_inventors.map((inventor, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-50 -lg">
              <p className="font-medium text-gray-900 mb-2">Inventor {index + 1}</p>
              <FieldRow label="Name" value={inventor.name || 'Not filled'} />
              <FieldRow label="Nationality" value={inventor.nationality || 'Not filled'} />
              <FieldRow label="Address" value={inventor.address || 'Not filled'} />
            </div>
          ))}
          <FieldRow label="Signature" value={formData.form5_signature?.name || 'Not uploaded'} />
        </div>
      )}

      {/* FORM 6 - CHANGE IN APPLICANT */}
      {formData.form6_application_number && (
        <div className="bg-white p-6 -lg shadow-sm border border-gray-200">
          <SectionTitle icon={DocumentTextIcon} title="Form 6 - Change in Applicant" />
          <FieldRow label="Application Number" value={getFieldValue('form6_application_number')} />
          <FieldRow label="Change Reason" value={getFieldValue('form6_change_reason')} />
          <FieldRow label="Former Applicant" value={getFieldValue('form6_former_applicant_name')} />
          <FieldRow label="New Applicant" value={getFieldValue('form6_new_applicant_name')} />
          <FieldRow label="Supporting Documents" value={formData.form6_supporting_documents?.name || 'Not uploaded'} />
        </div>
      )}

      {/* FORM 7A - OPPOSITION */}
      {formData.form7A_application_number && (
        <div className="bg-white p-6 -lg shadow-sm border border-gray-200">
          <SectionTitle icon={DocumentTextIcon} title="Form 7A - Opposition" />
          <FieldRow label="Application Number" value={getFieldValue('form7A_application_number')} />
          <FieldRow label="Opponent Name" value={getFieldValue('form7A_opponent_name')} />
          <FieldRow label="Opponent Nationality" value={getFieldValue('form7A_opponent_nationality')} />
          <FieldRow label="Grounds Details" value={getFieldValue('form7A_grounds_details')} />
        </div>
      )}

      {/* FORM 8 - INVENTOR MENTION */}
      {formData.form8_requestor_name && (
        <div className="bg-white p-6 -lg shadow-sm border border-gray-200">
          <SectionTitle icon={DocumentTextIcon} title="Form 8 - Request for Inventor Mention" />
          <FieldRow label="Requestor Name" value={getFieldValue('form8_requestor_name')} />
          <FieldRow label="Requestor Capacity" value={getFieldValue('form8_requestor_capacity')} />
          {formData.form8_inventors && formData.form8_inventors.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-800 mb-3">Inventors to Mention</h4>
              {formData.form8_inventors.map((inv, idx) => (
                <div key={idx} className="mb-2 p-3 bg-gray-50 ">
                  <FieldRow label="Name" value={inv.name || 'Not filled'} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FORM 13 - AMENDMENT */}
      {formData.form13_application_number && (
        <div className="bg-white p-6 -lg shadow-sm border border-gray-200">
          <SectionTitle icon={DocumentTextIcon} title="Form 13 - Amendment Request" />
          <FieldRow label="Application Number" value={getFieldValue('form13_application_number')} />
          <FieldRow label="Applicant Name" value={getFieldValue('form13_applicant_name')} />
          <FieldRow label="Amendment Reason" value={getFieldValue('form13_amendment_reason_type')} />
          <FieldRow label="Section 59 Compliance" value={formData.form13_declaration_section59 ? 'Yes' : 'No'} />
        </div>
      )}

      {/* FORM 16 - TITLE REGISTRATION */}
      {formData.form16_patent_number && (
        <div className="bg-white p-6 -lg shadow-sm border border-gray-200">
          <SectionTitle icon={DocumentTextIcon} title="Form 16 - Registration of Title" />
          <FieldRow label="Patent Number" value={getFieldValue('form16_patent_number')} />
          <FieldRow label="Transaction Type" value={getFieldValue('form16_transaction_type')} />
          <FieldRow label="Transferor" value={getFieldValue('form16_transferor_name')} />
          <FieldRow label="Transferee" value={getFieldValue('form16_transferee_name')} />
        </div>
      )}

      {/* FORM 26 - AGENT AUTHORIZATION */}
      {formData.form26_principal_name && (
        <div className="bg-white p-6 -lg shadow-sm border border-gray-200">
          <SectionTitle icon={DocumentTextIcon} title="Form 26 - Authorization of Patent Agent" />
          <FieldRow label="Principal Name" value={getFieldValue('form26_principal_name')} />
          <FieldRow label="Authorization Mode" value={getFieldValue('form26_authorization_mode')} />
          {formData.form26_agents && formData.form26_agents.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-800 mb-3">Authorized Agents</h4>
              {formData.form26_agents.map((agent, idx) => (
                <div key={idx} className="mb-2 p-3 bg-gray-50 ">
                  <FieldRow label="Agent Name" value={agent.name || 'Not filled'} />
                  <FieldRow label="INPA Number" value={agent.inpa_number || 'Not filled'} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FORM 28 - ENTITY DECLARATION */}
      {formData.form28_entity_type && (
        <div className="bg-white p-6 -lg shadow-sm border border-gray-200">
          <SectionTitle icon={DocumentTextIcon} title="Form 28 - Entity Declaration" />
          <FieldRow label="Applicant Name" value={getFieldValue('form28_applicant_name')} />
          <FieldRow label="Entity Type" value={getFieldValue('form28_entity_type')} />
          <FieldRow label="Declaration Accepted" value={formData.form28_declaration_correctness ? 'Yes' : 'No'} />
        </div>
      )}

      {/* SUBMISSION SUMMARY */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 -lg border-2 border-indigo-200">
        <h4 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
          <CheckCircleIcon className="h-6 w-6" />
          Submission Summary
        </h4>
        <div className="space-y-2 text-sm text-indigo-800">
          <p>✓ All information will be securely stored and encrypted</p>
          <p>✓ You will receive a confirmation email upon submission</p>
          <p>✓ The admin can review and edit fields if needed</p>
          <p>✓ Fields marked as "Not filled by client" can be completed later</p>
          <p className="font-semibold mt-4">Please ensure all information is accurate before submitting.</p>
        </div>
      </div>
    </div>
  )
}

export default ReviewAndSubmitComplete
