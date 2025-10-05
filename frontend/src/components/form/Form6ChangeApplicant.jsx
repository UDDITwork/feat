import React, { useEffect, useState } from 'react'
import { useForm } from '../../contexts/FormContext'
import { UploadIcon, DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

const Form6ChangeApplicant = ({
  formData,
  setFieldValue,
  setNestedFieldValue,
  setArrayFieldValue,
  addArrayItem,
  removeArrayItem
}) => {
  const { errors } = useForm()
  const [autoFetchedFields, setAutoFetchedFields] = useState({})
  const [requestStatement, setRequestStatement] = useState('')

  // Patent Office locations
  const patentOfficeLocations = [
    { value: 'delhi', label: 'Delhi - Intellectual Property Office Building, Boudhik Sampada Bhawan, Plot No. 32, Sector 14, Dwarka, New Delhi - 110078' },
    { value: 'mumbai', label: 'Mumbai - Intellectual Property Office, Baudhik Sampada Bhavan, S. M. Road, Antop Hill, Mumbai - 400037' },
    { value: 'kolkata', label: 'Kolkata - Intellectual Property Office Building, CP-2 Sector V, Salt Lake City, Kolkata - 700091' },
    { value: 'chennai', label: 'Chennai - Intellectual Property Office Building, G.S.T. Road, Guindy, Chennai - 600032' }
  ]

  // Reason templates
  const reasonTemplates = [
    {
      value: 'assignment',
      label: 'Assignment (Sale/Transfer of Rights)',
      template: 'The Application should proceed in the name of [NEW_APPLICANT] for the reason that [ORIGINAL_APPLICANT] have assigned their entire rights of the above identified Patent application to [NEW_APPLICANT].'
    },
    {
      value: 'transmission',
      label: 'Transmission (Inheritance)',
      template: 'The Application should proceed in the name of [NEW_APPLICANT] for the reason that [ORIGINAL_APPLICANT] has died/ceased to exist and [NEW_APPLICANT] is the legal heir/successor.'
    },
    {
      value: 'merger',
      label: 'Merger/Acquisition',
      template: 'The Application should proceed in the name of [NEW_APPLICANT] for the reason that [ORIGINAL_APPLICANT] has merged with [NEW_APPLICANT].'
    },
    {
      value: 'restructuring',
      label: 'Corporate Restructuring',
      template: 'The Application should proceed in the name of [NEW_APPLICANT] for the reason that there has been a change in the legal entity due to corporate restructuring.'
    },
    {
      value: 'custom',
      label: 'Custom Reason',
      template: ''
    }
  ]

  // Auto-fetch from Forms 1, 2, 5 (excluding Form 7A)
  useEffect(() => {
    const autoFetchFromPreviousForms = () => {
      const fetched = {}

      // Section 2: Original Patent Application Details
      // Auto-fetch application number from Form 1
      if (!formData.form6_original_application_number && formData.application_number) {
        setFieldValue('form6_original_application_number', formData.application_number)
        fetched.form6_original_application_number = 'form1'
      }

      // Auto-fetch filing date from Form 1
      if (!formData.form6_original_filing_date && formData.filing_date) {
        setFieldValue('form6_original_filing_date', formData.filing_date)
        fetched.form6_original_filing_date = 'form1'
      }

      // Section 3: Original Applicant Details
      // Priority: Form 2 → Form 1
      if (!formData.form6_original_applicant_name) {
        if (formData.form2_applicant_name) {
          setFieldValue('form6_original_applicant_name', formData.form2_applicant_name)
          fetched.form6_original_applicant_name = 'form2'
        } else if (formData.applicants?.[0]?.name_full) {
          setFieldValue('form6_original_applicant_name', formData.applicants[0].name_full)
          fetched.form6_original_applicant_name = 'form1'
        }
      }

      // Auto-fetch original applicant address
      if (!formData.form6_original_applicant_address) {
        if (formData.form2_applicant_address) {
          setFieldValue('form6_original_applicant_address', formData.form2_applicant_address)
          fetched.form6_original_applicant_address = 'form2'
        } else if (formData.applicants?.[0]?.address) {
          const addr = formData.applicants[0].address
          const addressParts = [
            addr.house_no,
            addr.village ? `${addr.village},` : '',
            addr.post_office ? `P.O. ${addr.post_office}` : '',
            addr.street,
            [addr.city, addr.state, addr.pin_code].filter(Boolean).join(', '),
            addr.country
          ].filter(Boolean)

          if (addressParts.length > 0) {
            setFieldValue('form6_original_applicant_address', addressParts.join('\n'))
            fetched.form6_original_applicant_address = 'form1'
          }
        }
      }

      // Auto-fetch original applicant nationality
      if (!formData.form6_original_applicant_nationality) {
        if (formData.form2_applicant_nationality) {
          setFieldValue('form6_original_applicant_nationality', formData.form2_applicant_nationality)
          fetched.form6_original_applicant_nationality = 'form2'
        } else if (formData.applicants?.[0]?.nationality) {
          setFieldValue('form6_original_applicant_nationality', formData.applicants[0].nationality)
          fetched.form6_original_applicant_nationality = 'form1'
        }
      }

      // Section 7: Service Address (conditional - if same agent)
      if (!formData.form6_service_address) {
        if (formData.service_address?.postal_address) {
          setFieldValue('form6_service_address', formData.service_address.postal_address)
          fetched.form6_service_address = 'form1'
        }
      }

      if (!formData.form6_service_contact_name && formData.service_address?.name) {
        setFieldValue('form6_service_contact_name', formData.service_address.name)
        fetched.form6_service_contact_name = 'form1'
      }

      if (!formData.form6_service_email && formData.service_address?.email_id) {
        setFieldValue('form6_service_email', formData.service_address.email_id)
        fetched.form6_service_email = 'form1'
      }

      if (!formData.form6_service_phone && formData.service_address?.mobile_no) {
        setFieldValue('form6_service_phone', formData.service_address.mobile_no)
        fetched.form6_service_phone = 'form1'
      }

      // Section 8: Signature section - auto-fetch from Form 1 if same agent
      if (!formData.form6_signatory_name && formData.patent_agent?.name) {
        setFieldValue('form6_signatory_name', formData.patent_agent.name)
        fetched.form6_signatory_name = 'agent'
      }

      if (!formData.form6_patent_agent_inpa && formData.patent_agent?.inpa_no) {
        setFieldValue('form6_patent_agent_inpa', `IN/PA-${formData.patent_agent.inpa_no}`)
        fetched.form6_patent_agent_inpa = 'form1'
      }

      // Section 9: Patent Office location from Form 1
      if (!formData.form6_office_location && formData.patent_office_location) {
        setFieldValue('form6_office_location', formData.patent_office_location)
        fetched.form6_office_location = 'form1'
      }

      // Default filing date to current date
      if (!formData.form6_filing_date) {
        const today = new Date().toISOString().split('T')[0]
        setFieldValue('form6_filing_date', today)
        fetched.form6_filing_date = 'default'
      }

      setAutoFetchedFields(fetched)
    }

    autoFetchFromPreviousForms()
  }, [])

  // Auto-generate request statement when key fields change
  useEffect(() => {
    const generateRequestStatement = () => {
      const newApplicant = formData.form6_new_applicant_name || '[NEW APPLICANT NAME]'
      const newAddress = formData.form6_new_applicant_address || '[NEW APPLICANT ADDRESS]'
      const newNationality = formData.form6_new_applicant_nationality || '[NEW APPLICANT NATIONALITY]'
      const appNumber = formData.form6_original_application_number || '[APPLICATION NUMBER]'
      const filingDate = formData.form6_original_filing_date || '[FILING DATE]'
      const originalApplicant = formData.form6_original_applicant_name || '[ORIGINAL APPLICANT NAME]'

      const statement = `We, ${newApplicant} of the address: ${newAddress}; Nationality: ${newNationality}, hereby request that the Application for Patent Number ${appNumber} filed on ${filingDate} made by ${originalApplicant} may proceed in our name and further request that direction of the Controller, if necessary be made in that effect.`

      setRequestStatement(statement)
    }

    generateRequestStatement()
  }, [
    formData.form6_new_applicant_name,
    formData.form6_new_applicant_address,
    formData.form6_new_applicant_nationality,
    formData.form6_original_application_number,
    formData.form6_original_filing_date,
    formData.form6_original_applicant_name
  ])

  const handleChange = (field, value) => {
    setFieldValue(field, value)
  }

  const handleReasonTemplateSelect = (templateType) => {
    const template = reasonTemplates.find(t => t.value === templateType)
    if (template && template.template) {
      const newApplicant = formData.form6_new_applicant_name || '[NEW APPLICANT]'
      const originalApplicant = formData.form6_original_applicant_name || '[ORIGINAL APPLICANT]'

      const filledTemplate = template.template
        .replace(/\[NEW_APPLICANT\]/g, newApplicant)
        .replace(/\[ORIGINAL_APPLICANT\]/g, originalApplicant)

      setFieldValue('form6_reason_for_change', filledTemplate)
    } else {
      setFieldValue('form6_reason_for_change', '')
    }
  }

  const handleFileUpload = (field, event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file size (10MB for documents)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        alert('Only JPG, PNG, and PDF files are allowed')
        return
      }

      setFieldValue(`${field}_file`, file)
      setFieldValue(`${field}_filename`, file.name)
    }
  }

  const handleDocumentCheckbox = (field, checked) => {
    setFieldValue(field, checked)
  }

  const isFieldAutoFetched = (fieldName) => {
    return autoFetchedFields[fieldName] !== undefined
  }

  const getAutoFetchSource = (fieldName) => {
    return autoFetchedFields[fieldName]
  }

  const AutoFetchBadge = ({ source }) => {
    if (!source) return null

    const badgeConfig = {
      form5: { color: 'purple', text: '🔄 From Form 5' },
      form2: { color: 'blue', text: '🔄 From Form 2' },
      form1: { color: 'green', text: '🔄 From Form 1' },
      agent: { color: 'orange', text: '👤 Patent Agent' },
      default: { color: 'gray', text: '📅 Current Date' }
    }

    const config = badgeConfig[source] || { color: 'gray', text: '📥 Auto' }

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium text-${config.color}-700 bg-${config.color}-100 rounded-md ml-2`}>
        {config.text}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Form 6: Request for Change of Applicant/Transfer of Rights
        </h2>
        <p className="text-sm text-gray-600 mb-1">
          Section 20(1), 20(4), 20(5); Rule 34(1), 35(1), 36(1) of The Patents Act, 1970 & The Patents Rules, 2003
        </p>
        <p className="text-xs text-purple-700 mt-2">
          📋 Use this form to request transfer of patent application rights (Assignment, Transmission, Merger, etc.)
        </p>
        <p className="text-xs text-gray-600 mt-1">
          All fields are optional. Original application details will auto-populate from previous forms.
        </p>
      </div>

      {/* Section 1: NEW APPLICANT DETAILS */}
      <div className="form-section bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="form-section-title">Section 1: New Applicant Details (Transferee/Assignee)</h3>

        <p className="text-sm text-gray-600 mb-4">
          Enter details of the person/entity who will become the new applicant. All fields are optional.
        </p>

        <div className="grid grid-cols-1 gap-6">
          {/* New Applicant Name */}
          <div>
            <label className="label">
              New Applicant Name (Individual/Company/Organization)
            </label>
            <input
              type="text"
              value={formData.form6_new_applicant_name || ''}
              onChange={(e) => handleChange('form6_new_applicant_name', e.target.value)}
              className="input-field"
              placeholder="Enter full legal name (e.g., Suzhou BrightHope Pharmatech Co., Ltd)"
              maxLength={300}
            />
            <p className="text-xs text-gray-500 mt-1">
              Full legal name exactly as it appears in assignment/transfer documents
            </p>
          </div>

          {/* New Applicant Address */}
          <div>
            <label className="label">
              Complete Address of New Applicant
            </label>
            <textarea
              value={formData.form6_new_applicant_address || ''}
              onChange={(e) => handleChange('form6_new_applicant_address', e.target.value)}
              className="input-field"
              rows={4}
              placeholder="E775, 5/F, Lecheng Plaza,&#10;No.218, Sangtian Street,&#10;Suzhou Industrial Park,&#10;Jiangsu Province, China 215123"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              Complete registered/principal address including building, street, city, country, postal code
            </p>
          </div>

          {/* New Applicant Nationality */}
          <div>
            <label className="label">
              Nationality / Country of Incorporation
            </label>
            <input
              type="text"
              value={formData.form6_new_applicant_nationality || ''}
              onChange={(e) => handleChange('form6_new_applicant_nationality', e.target.value)}
              className="input-field"
              placeholder="e.g., China, United States of America, India"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              For companies: country of incorporation; For individuals: nationality
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: ORIGINAL PATENT APPLICATION DETAILS */}
      <div className="form-section">
        <h3 className="form-section-title">Section 2: Original Patent Application Details</h3>

        <p className="text-sm text-gray-600 mb-4">
          Details of the patent application being transferred. Auto-populated from Form 1 if available.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patent Application Number */}
          <div>
            <label className="label">
              Patent Application Number
              <AutoFetchBadge source={getAutoFetchSource('form6_original_application_number')} />
            </label>
            <input
              type="text"
              value={formData.form6_original_application_number || ''}
              onChange={(e) => handleChange('form6_original_application_number', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form6_original_application_number') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="e.g., 202317058796"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              Indian Patent Application Number to be transferred
            </p>
          </div>

          {/* Application Filing Date */}
          <div>
            <label className="label">
              Application Filing Date
              <AutoFetchBadge source={getAutoFetchSource('form6_original_filing_date')} />
            </label>
            <input
              type="date"
              value={formData.form6_original_filing_date || ''}
              onChange={(e) => handleChange('form6_original_filing_date', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form6_original_filing_date') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Date when the original application was filed
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: ORIGINAL APPLICANT DETAILS */}
      <div className="form-section">
        <h3 className="form-section-title">Section 3: Original Applicant Details (Transferor/Assignor)</h3>

        <p className="text-sm text-gray-600 mb-4">
          Current/original applicant information. Auto-populated from Forms 1/2 if available.
        </p>

        <div className="grid grid-cols-1 gap-6">
          {/* Original Applicant Name */}
          <div>
            <label className="label">
              Original Applicant Name
              <AutoFetchBadge source={getAutoFetchSource('form6_original_applicant_name')} />
            </label>
            <input
              type="text"
              value={formData.form6_original_applicant_name || ''}
              onChange={(e) => handleChange('form6_original_applicant_name', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form6_original_applicant_name') === 'form2' ? 'bg-blue-50 border-blue-300' :
                getAutoFetchSource('form6_original_applicant_name') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="Name as it appears in Form 1"
              maxLength={300}
            />
            {isFieldAutoFetched('form6_original_applicant_name') && (
              <p className="text-xs text-green-600 mt-1">
                ✅ Auto-populated from previous forms
              </p>
            )}
          </div>

          {/* Original Applicant Address */}
          <div>
            <label className="label">
              Original Applicant Address
              <AutoFetchBadge source={getAutoFetchSource('form6_original_applicant_address')} />
            </label>
            <textarea
              value={formData.form6_original_applicant_address || ''}
              onChange={(e) => handleChange('form6_original_applicant_address', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form6_original_applicant_address') === 'form2' ? 'bg-blue-50 border-blue-300' :
                getAutoFetchSource('form6_original_applicant_address') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              rows={3}
              placeholder="Address from Form 1"
              maxLength={500}
            />
          </div>

          {/* Original Applicant Nationality */}
          <div>
            <label className="label">
              Original Applicant Nationality
              <AutoFetchBadge source={getAutoFetchSource('form6_original_applicant_nationality')} />
            </label>
            <input
              type="text"
              value={formData.form6_original_applicant_nationality || ''}
              onChange={(e) => handleChange('form6_original_applicant_nationality', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form6_original_applicant_nationality') === 'form2' ? 'bg-blue-50 border-blue-300' :
                getAutoFetchSource('form6_original_applicant_nationality') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="Nationality from Form 1"
              maxLength={100}
            />
          </div>
        </div>
      </div>

      {/* Section 4: AUTO-GENERATED REQUEST STATEMENT */}
      <div className="form-section bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <h3 className="form-section-title">Section 4: Formal Request Statement</h3>

        <p className="text-sm text-gray-600 mb-4">
          Auto-generated from the information provided above. Review for accuracy.
        </p>

        <div className="bg-white border border-gray-300 rounded-lg p-4">
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {requestStatement}
          </p>
        </div>

        <p className="text-xs text-indigo-600 mt-2">
          📝 This statement is automatically generated. Update the fields above to modify it.
        </p>
      </div>

      {/* Section 5: REASON FOR CHANGE */}
      <div className="form-section">
        <h3 className="form-section-title">Section 5: Reason for Change of Applicant</h3>

        <div className="space-y-4">
          {/* Template Selection */}
          <div>
            <label className="label">
              Select Reason Type (Optional - or write custom)
            </label>
            <select
              value={formData.form6_reason_type || ''}
              onChange={(e) => {
                handleChange('form6_reason_type', e.target.value)
                handleReasonTemplateSelect(e.target.value)
              }}
              className="input-field"
            >
              <option value="">-- Select a reason template --</option>
              {reasonTemplates.map(template => (
                <option key={template.value} value={template.value}>
                  {template.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reason Statement */}
          <div>
            <label className="label">
              Detailed Reason Statement
            </label>
            <textarea
              value={formData.form6_reason_for_change || ''}
              onChange={(e) => handleChange('form6_reason_for_change', e.target.value)}
              className="input-field font-mono text-sm"
              rows={6}
              placeholder="Provide detailed explanation for the change in applicant. Example:&#10;&#10;The Application should proceed in the name of [NEW APPLICANT] for the reason that [ORIGINAL APPLICANT] have assigned their entire rights of the above identified Patent application to [NEW APPLICANT]."
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              Explain the reason for transfer: Assignment, Transmission, Merger, Restructuring, etc.
            </p>
          </div>
        </div>
      </div>

      {/* Section 6: SUPPORTING DOCUMENTS */}
      <div className="form-section">
        <h3 className="form-section-title">Section 6: Supporting Documents</h3>

        <p className="text-sm text-gray-600 mb-4">
          All document uploads are optional. Upload supporting documents as applicable.
        </p>

        <div className="space-y-4">
          {/* Document A: Assignment Deed */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={formData.form6_doc_assignment_deed || false}
                onChange={(e) => handleDocumentCheckbox('form6_doc_assignment_deed', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <span className="ml-3 text-sm text-gray-700">
                <strong>Duly stamped original Deed of Assignment</strong> executed between original and new applicant
              </span>
            </label>

            {formData.form6_doc_assignment_deed && (
              <div className="mt-3 ml-7">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload('form6_assignment_deed', e)}
                  className="text-sm"
                />
                {formData.form6_assignment_deed_filename && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Uploaded: {formData.form6_assignment_deed_filename}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Document B: Power of Attorney */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={formData.form6_doc_power_of_attorney || false}
                onChange={(e) => handleDocumentCheckbox('form6_doc_power_of_attorney', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <span className="ml-3 text-sm text-gray-700">
                <strong>Duly stamped original General Power of Attorney</strong> executed by new applicant
              </span>
            </label>

            {formData.form6_doc_power_of_attorney && (
              <div className="mt-3 ml-7">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload('form6_power_of_attorney', e)}
                  className="text-sm"
                />
                {formData.form6_power_of_attorney_filename && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Uploaded: {formData.form6_power_of_attorney_filename}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Document C: Revised Forms */}
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={formData.form6_doc_revised_forms || false}
                onChange={(e) => handleDocumentCheckbox('form6_doc_revised_forms', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <span className="ml-3 text-sm text-blue-800">
                <strong>Revised Form 1, Form 2, and Form 5</strong> with updated applicant details
              </span>
            </label>

            {formData.form6_doc_revised_forms && (
              <div className="mt-3 ml-7 space-y-2">
                <div className="p-3 bg-blue-100 border border-blue-300 rounded-lg">
                  <p className="text-xs text-blue-800 mb-2">
                    <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                    <strong>Instructions for Revised Forms:</strong>
                  </p>
                  <ul className="text-xs text-blue-700 space-y-1 ml-5">
                    <li>• Copy all data from original Forms 1, 2, and 5</li>
                    <li>• Replace ONLY the applicant name, address, and nationality with new applicant details</li>
                    <li>• Keep ALL technical content unchanged (invention title, claims, description, inventors)</li>
                    <li>• Highlight or track changes to show what was updated</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <label className="text-xs text-gray-600">Revised Form 1 (PDF):</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload('form6_revised_form1', e)}
                      className="text-sm w-full"
                    />
                    {formData.form6_revised_form1_filename && (
                      <p className="text-xs text-green-600">✅ {formData.form6_revised_form1_filename}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-gray-600">Revised Form 2 (PDF):</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload('form6_revised_form2', e)}
                      className="text-sm w-full"
                    />
                    {formData.form6_revised_form2_filename && (
                      <p className="text-xs text-green-600">✅ {formData.form6_revised_form2_filename}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-gray-600">Revised Form 5 (PDF):</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload('form6_revised_form5', e)}
                      className="text-sm w-full"
                    />
                    {formData.form6_revised_form5_filename && (
                      <p className="text-xs text-green-600">✅ {formData.form6_revised_form5_filename}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Document D: Fee Payment */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={formData.form6_doc_fee_payment || false}
                onChange={(e) => handleDocumentCheckbox('form6_doc_fee_payment', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <span className="ml-3 text-sm text-gray-700">
                <strong>Prescribed official fee</strong> (amount varies by applicant category)
              </span>
            </label>

            {formData.form6_doc_fee_payment && (
              <div className="mt-3 ml-7">
                <input
                  type="text"
                  value={formData.form6_fee_amount || ''}
                  onChange={(e) => handleChange('form6_fee_amount', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Rs. 4000/-"
                  maxLength={50}
                />
                <input
                  type="text"
                  value={formData.form6_fee_reference || ''}
                  onChange={(e) => handleChange('form6_fee_reference', e.target.value)}
                  className="input-field mt-2"
                  placeholder="Payment reference/transaction ID"
                  maxLength={100}
                />
              </div>
            )}
          </div>

          {/* Additional Documents */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={formData.form6_doc_additional || false}
                onChange={(e) => handleDocumentCheckbox('form6_doc_additional', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <span className="ml-3 text-sm text-gray-700">
                <strong>Additional supporting documents</strong> (certificates, consents, etc.)
              </span>
            </label>

            {formData.form6_doc_additional && (
              <div className="mt-3 ml-7">
                <textarea
                  value={formData.form6_additional_docs_description || ''}
                  onChange={(e) => handleChange('form6_additional_docs_description', e.target.value)}
                  className="input-field text-sm"
                  rows={3}
                  placeholder="List additional documents being submitted (e.g., Certificate of incorporation, Board resolution, Merger documents, etc.)"
                  maxLength={500}
                />
                <input
                  type="file"
                  accept=".pdf,.jpg,.png"
                  multiple
                  onChange={(e) => handleFileUpload('form6_additional_docs', e)}
                  className="text-sm mt-2"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 7: ADDRESS FOR SERVICE IN INDIA */}
      <div className="form-section">
        <h3 className="form-section-title">Section 7: Address for Service in India</h3>

        <p className="text-sm text-gray-600 mb-4">
          All communications will be sent to this address. Auto-populated from Form 1 if same agent is handling.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Name */}
          <div className="md:col-span-2">
            <label className="label">
              Contact Person / Patent Agent Name
              <AutoFetchBadge source={getAutoFetchSource('form6_service_contact_name')} />
            </label>
            <input
              type="text"
              value={formData.form6_service_contact_name || ''}
              onChange={(e) => handleChange('form6_service_contact_name', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form6_service_contact_name') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="Name of person/firm"
              maxLength={200}
            />
          </div>

          {/* Service Address */}
          <div className="md:col-span-2">
            <label className="label">
              Complete Postal Address
              <AutoFetchBadge source={getAutoFetchSource('form6_service_address')} />
            </label>
            <textarea
              value={formData.form6_service_address || ''}
              onChange={(e) => handleChange('form6_service_address', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form6_service_address') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              rows={4}
              placeholder="52, Sukhdev Vihar, Mathura Road, New Delhi-110025, India"
              maxLength={500}
            />
          </div>

          {/* Email */}
          <div>
            <label className="label">
              Email Address
              <AutoFetchBadge source={getAutoFetchSource('form6_service_email')} />
            </label>
            <input
              type="email"
              value={formData.form6_service_email || ''}
              onChange={(e) => handleChange('form6_service_email', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form6_service_email') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="email@example.com"
              maxLength={100}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="label">
              Phone Number
              <AutoFetchBadge source={getAutoFetchSource('form6_service_phone')} />
            </label>
            <input
              type="tel"
              value={formData.form6_service_phone || ''}
              onChange={(e) => handleChange('form6_service_phone', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form6_service_phone') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="+91-XXXXXXXXXX"
              maxLength={15}
            />
          </div>
        </div>
      </div>

      {/* Section 8: DATE AND SIGNATURE */}
      <div className="form-section">
        <h3 className="form-section-title">Section 8: Date and Signature</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Filing Date */}
          <div>
            <label className="label">
              Date of Filing Form 6
              <AutoFetchBadge source={getAutoFetchSource('form6_filing_date')} />
            </label>
            <input
              type="date"
              value={formData.form6_filing_date || ''}
              onChange={(e) => handleChange('form6_filing_date', e.target.value)}
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: "Dated this [day] day of [Month], [Year]"
            </p>
          </div>

          {/* Signatory Name */}
          <div>
            <label className="label">
              Name of Signatory
              <AutoFetchBadge source={getAutoFetchSource('form6_signatory_name')} />
            </label>
            <input
              type="text"
              value={formData.form6_signatory_name || ''}
              onChange={(e) => handleChange('form6_signatory_name', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form6_signatory_name') === 'agent' ? 'bg-orange-50 border-orange-300' : ''
              }`}
              placeholder="Full name of person signing"
              maxLength={200}
            />
          </div>

          {/* Signatory Capacity */}
          <div>
            <label className="label">
              Capacity / Designation
            </label>
            <input
              type="text"
              value={formData.form6_signatory_capacity || ''}
              onChange={(e) => handleChange('form6_signatory_capacity', e.target.value)}
              className="input-field"
              placeholder="e.g., Agent for the Applicant, Director, Authorized Representative"
              maxLength={100}
            />
          </div>

          {/* Patent Agent INPA Number */}
          <div>
            <label className="label">
              Patent Agent Registration Number (if applicable)
              <AutoFetchBadge source={getAutoFetchSource('form6_patent_agent_inpa')} />
            </label>
            <input
              type="text"
              value={formData.form6_patent_agent_inpa || ''}
              onChange={(e) => handleChange('form6_patent_agent_inpa', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form6_patent_agent_inpa') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="IN/PA-XXXX"
              maxLength={20}
            />
          </div>
        </div>

        {/* Signature Upload */}
        <div className="mt-6">
          <label className="label">
            Signature Upload
          </label>
          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
            <div className="space-y-2 text-center">
              <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                  <span>Upload signature</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileUpload('form6_signature', e)}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                JPG, PNG, PDF up to 2MB
              </p>
              {formData.form6_signature_filename && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-700">
                    ✅ Uploaded: {formData.form6_signature_filename}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 9: ADDRESSEE (Footer) */}
      <div className="form-section bg-gray-50 border border-gray-300 rounded-lg p-6">
        <h3 className="form-section-title">Section 9: Addressee</h3>

        <div className="space-y-3">
          <div className="flex items-center">
            <label className="label w-40">To:</label>
            <input
              type="text"
              value="The Controller of Patents"
              className="input-field bg-gray-100"
              readOnly
            />
          </div>

          <div className="flex items-center">
            <label className="label w-40">Office:</label>
            <input
              type="text"
              value="The Patent Office"
              className="input-field bg-gray-100"
              readOnly
            />
          </div>

          <div>
            <label className="label">
              Patent Office Location & Address:
              <AutoFetchBadge source={getAutoFetchSource('form6_office_location')} />
            </label>
            <select
              value={formData.form6_office_location || 'delhi'}
              onChange={(e) => handleChange('form6_office_location', e.target.value)}
              className={`input-field mt-2 ${
                getAutoFetchSource('form6_office_location') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
            >
              {patentOfficeLocations.map(location => (
                <option key={location.value} value={location.value}>
                  {location.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select the Patent Office where the original application is being processed
            </p>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
        <h4 className="text-sm font-medium text-purple-800 mb-2">Form 6 Important Guidelines:</h4>
        <ul className="text-xs text-purple-700 space-y-1">
          <li>• All fields are optional - fill only the information you have available</li>
          <li>• Original application details auto-populate from Forms 1 and 2</li>
          <li>• New applicant details must be entered manually (this is the transferee/assignee)</li>
          <li>• Assignment deed must be properly stamped according to applicable laws</li>
          <li>• Revised Forms 1, 2, and 5 should have ONLY applicant details changed</li>
          <li>• Service address auto-fills if same patent agent is handling the transfer</li>
          <li>• Form 6 can be filed anytime after patent application is filed</li>
        </ul>
      </div>
    </div>
  )
}

export default Form6ChangeApplicant
