import React, { useEffect, useState } from 'react'
import { useForm } from '../../contexts/FormContext'
import { UploadIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

const Form13Amendment = ({
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

  // Auto-fetch from Forms 1, 2, 6
  useEffect(() => {
    const autoFetchFromPreviousForms = () => {
      const fetched = {}

      // Section 1: Applicant Details - Priority: Form 6 → Form 2 → Form 1
      if (!formData.form13_applicant_name) {
        if (formData.form6_new_applicant_name) {
          setFieldValue('form13_applicant_name', formData.form6_new_applicant_name)
          fetched.form13_applicant_name = 'form6'
        } else if (formData.form2_applicant_name) {
          setFieldValue('form13_applicant_name', formData.form2_applicant_name)
          fetched.form13_applicant_name = 'form2'
        } else if (formData.applicants?.[0]?.name_full) {
          setFieldValue('form13_applicant_name', formData.applicants[0].name_full)
          fetched.form13_applicant_name = 'form1'
        }
      }

      if (!formData.form13_applicant_address) {
        if (formData.form6_new_applicant_address) {
          setFieldValue('form13_applicant_address', formData.form6_new_applicant_address)
          fetched.form13_applicant_address = 'form6'
        } else if (formData.form2_applicant_address) {
          setFieldValue('form13_applicant_address', formData.form2_applicant_address)
          fetched.form13_applicant_address = 'form2'
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
            setFieldValue('form13_applicant_address', addressParts.join('\n'))
            fetched.form13_applicant_address = 'form1'
          }
        }
      }

      // Section 2: Application Details
      if (!formData.form13_application_number && formData.application_number) {
        setFieldValue('form13_application_number', formData.application_number)
        fetched.form13_application_number = 'form1'
      }

      if (!formData.form13_filing_date && formData.filing_date) {
        setFieldValue('form13_filing_date', formData.filing_date)
        fetched.form13_filing_date = 'form1'
      }

      // Signature section
      if (!formData.form13_signatory_name && formData.patent_agent?.name) {
        setFieldValue('form13_signatory_name', formData.patent_agent.name)
        fetched.form13_signatory_name = 'agent'
      }

      if (!formData.form13_patent_agent_inpa && formData.patent_agent?.inpa_no) {
        setFieldValue('form13_patent_agent_inpa', `IN/PA/${formData.patent_agent.inpa_no}`)
        fetched.form13_patent_agent_inpa = 'form1'
      }

      // Default current date for filing
      if (!formData.form13_filing_date_form) {
        const today = new Date().toISOString().split('T')[0]
        setFieldValue('form13_filing_date_form', today)
        fetched.form13_filing_date_form = 'default'
      }

      setAutoFetchedFields(fetched)
    }

    autoFetchFromPreviousForms()
  }, [])

  // Auto-generate request statement
  useEffect(() => {
    const generateRequestStatement = () => {
      const applicantName = formData.form13_applicant_name || '[APPLICANT NAME]'
      const applicantAddress = formData.form13_applicant_address || '[APPLICANT ADDRESS]'
      const appNumber = formData.form13_application_number || '[APPLICATION NUMBER]'
      const filingDate = formData.form13_filing_date || '[FILING DATE]'

      const statement = `We, ${applicantName} of the address: ${applicantAddress}, request leave to amend the application/any document related thereto/complete specification with respect to application for patent No. ${appNumber} dated: ${filingDate} as highlighted in the copy annexed hereto:`

      setRequestStatement(statement)
    }

    generateRequestStatement()
  }, [
    formData.form13_applicant_name,
    formData.form13_applicant_address,
    formData.form13_application_number,
    formData.form13_filing_date
  ])

  const handleChange = (field, value) => {
    setFieldValue(field, value)
  }

  const handleDocumentCheckbox = (field, checked) => {
    setFieldValue(field, checked)
  }

  const handleFileUpload = (field, event) => {
    const file = event.target.files[0]
    if (file) {
      const maxSize = field.includes('signature') ? 2 * 1024 * 1024 : 10 * 1024 * 1024

      if (file.size > maxSize) {
        alert(`File size must be less than ${maxSize / (1024 * 1024)}MB`)
        return
      }

      const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        alert('Only JPG, PNG, and PDF files are allowed')
        return
      }

      setFieldValue(`${field}_file`, file)
      setFieldValue(`${field}_filename`, file.name)
    }
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
      form6: { color: 'purple', text: '🔄 From Form 6' },
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

  const reasonTemplates = [
    {
      value: 'voluntary',
      label: 'Voluntary Correction',
      template: 'The applicant wishes to voluntarily amend the [claims/description/abstract] by way of correction as mentioned below:\n\n[Specify what is being corrected and why]\n\nThe amendments are made to:\n- Clarify the scope of the invention\n- Correct typographical errors\n- Remove ambiguities\n- Narrow the claims to improve patentability'
    },
    {
      value: 'examination',
      label: 'Response to Examination Report',
      template: 'The applicant wishes to amend the [claims/description] in response to the First Examination Report (FER) dated [DATE], objections raised under Section [X].\n\nThe amendments address the following objections:\n- [Objection 1] - Addressed by [specific amendment]\n- [Objection 2] - Addressed by [specific amendment]\n\nThe amendments overcome the objections while maintaining the inventive concept.'
    },
    {
      value: 'narrowing',
      label: 'Narrowing Claims',
      template: 'The applicant wishes to amend the claims to narrow the scope and improve clarity.\n\nThe amendments do not introduce new matter and are fully supported by the originally filed specification.'
    },
    {
      value: 'custom',
      label: 'Custom Reason',
      template: ''
    }
  ]

  const handleReasonTemplateSelect = (templateType) => {
    const template = reasonTemplates.find(t => t.value === templateType)
    if (template) {
      setFieldValue('form13_reason', template.template)
    }
  }

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Form 13: Application for Amendment of Application/Specification
        </h2>
        <p className="text-sm text-gray-600 mb-1">
          Section 57; Sub-rule (1) of Rule 81 of The Patents Act, 1970 & The Patents Rules, 2003
        </p>
        <p className="text-xs text-emerald-700 mt-2">
          📋 Request amendments to patent application, complete specification, or related documents
        </p>
        <p className="text-xs text-gray-600 mt-1">
          All fields are optional. Applicant details will auto-populate from previous forms.
        </p>
      </div>

      {/* Section 1: APPLICANT/PATENTEE DETAILS */}
      <div className="form-section">
        <h3 className="form-section-title">Section 1: Applicant/Patentee Details</h3>

        <p className="text-sm text-gray-600 mb-4">
          Current applicant on record. Auto-populated from Form 6 (if changed) → Form 2 → Form 1. All fields are optional.
        </p>

        <div className="grid grid-cols-1 gap-6">
          {/* Applicant Name */}
          <div>
            <label className="label">
              Applicant/Patentee Name
              <AutoFetchBadge source={getAutoFetchSource('form13_applicant_name')} />
            </label>
            <input
              type="text"
              value={formData.form13_applicant_name || ''}
              onChange={(e) => handleChange('form13_applicant_name', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form13_applicant_name') === 'form6' ? 'bg-purple-50 border-purple-300' :
                getAutoFetchSource('form13_applicant_name') === 'form2' ? 'bg-blue-50 border-blue-300' :
                getAutoFetchSource('form13_applicant_name') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="e.g., YARA UK LIMITED"
              maxLength={300}
            />
            {isFieldAutoFetched('form13_applicant_name') && (
              <p className="text-xs text-gray-600 mt-1">
                ✅ Auto-populated (current applicant on record)
              </p>
            )}
          </div>

          {/* Applicant Address */}
          <div>
            <label className="label">
              Applicant/Patentee Address
              <AutoFetchBadge source={getAutoFetchSource('form13_applicant_address')} />
            </label>
            <textarea
              value={formData.form13_applicant_address || ''}
              onChange={(e) => handleChange('form13_applicant_address', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form13_applicant_address') === 'form6' ? 'bg-purple-50 border-purple-300' :
                getAutoFetchSource('form13_applicant_address') === 'form2' ? 'bg-blue-50 border-blue-300' :
                getAutoFetchSource('form13_applicant_address') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              rows={4}
              placeholder="Wellington Road Pocklington Industrial Estate..."
              maxLength={500}
            />
          </div>
        </div>
      </div>

      {/* Section 2: APPLICATION/PATENT DETAILS */}
      <div className="form-section">
        <h3 className="form-section-title">Section 2: Application/Patent Details</h3>

        <p className="text-sm text-gray-600 mb-4">
          Patent application or patent number being amended. Auto-populated from Form 1. All fields are optional.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Application Number */}
          <div>
            <label className="label">
              Application/Patent Number
              <AutoFetchBadge source={getAutoFetchSource('form13_application_number')} />
            </label>
            <input
              type="text"
              value={formData.form13_application_number || ''}
              onChange={(e) => handleChange('form13_application_number', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form13_application_number') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="e.g., 202317058797"
              maxLength={50}
            />
          </div>

          {/* Filing Date */}
          <div>
            <label className="label">
              Application Filing Date
              <AutoFetchBadge source={getAutoFetchSource('form13_filing_date')} />
            </label>
            <input
              type="date"
              value={formData.form13_filing_date || ''}
              onChange={(e) => handleChange('form13_filing_date', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form13_filing_date') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
            />
          </div>
        </div>
      </div>

      {/* Section 3: AMENDMENT REQUEST */}
      <div className="form-section">
        <h3 className="form-section-title">Section 3: Documents to be Amended</h3>

        <p className="text-sm text-gray-600 mb-4">
          Select which document(s) you wish to amend. All selections are optional.
        </p>

        <div className="space-y-3">
          <label className="flex items-start p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.form13_amend_application || false}
              onChange={(e) => handleDocumentCheckbox('form13_amend_application', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            />
            <span className="ml-3 text-sm text-gray-700">
              <strong>Application (Form 1)</strong>
            </span>
          </label>

          <label className="flex items-start p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.form13_amend_description || false}
              onChange={(e) => handleDocumentCheckbox('form13_amend_description', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            />
            <span className="ml-3 text-sm text-gray-700">
              <strong>Complete Specification - Description</strong>
            </span>
          </label>

          <label className="flex items-start p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.form13_amend_claims || false}
              onChange={(e) => handleDocumentCheckbox('form13_amend_claims', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            />
            <span className="ml-3 text-sm text-gray-700">
              <strong>Complete Specification - Claims</strong> (Most Common)
            </span>
          </label>

          <label className="flex items-start p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.form13_amend_abstract || false}
              onChange={(e) => handleDocumentCheckbox('form13_amend_abstract', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            />
            <span className="ml-3 text-sm text-gray-700">
              <strong>Complete Specification - Abstract</strong>
            </span>
          </label>

          <label className="flex items-start p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.form13_amend_drawings || false}
              onChange={(e) => handleDocumentCheckbox('form13_amend_drawings', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            />
            <span className="ml-3 text-sm text-gray-700">
              <strong>Complete Specification - Drawings</strong>
            </span>
          </label>

          <label className="flex items-start p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.form13_amend_other || false}
              onChange={(e) => handleDocumentCheckbox('form13_amend_other', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            />
            <span className="ml-3 text-sm text-gray-700">
              <strong>Any other document related to the application</strong>
            </span>
          </label>
        </div>
      </div>

      {/* Auto-Generated Request Statement */}
      <div className="form-section bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <h3 className="form-section-title">Section 4: Auto-Generated Request Statement</h3>

        <div className="bg-white border border-gray-300 rounded-lg p-4">
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {requestStatement}
          </p>
        </div>

        <p className="text-xs text-indigo-600 mt-2">
          📝 This statement is automatically generated from the information above
        </p>
      </div>

      {/* Section 4: REASON FOR AMENDMENT */}
      <div className="form-section">
        <h3 className="form-section-title">Section 5: Reason for Amendment</h3>

        <div className="space-y-4">
          {/* Template Selection */}
          <div>
            <label className="label">
              Select Reason Type (Optional - or write custom)
            </label>
            <select
              value={formData.form13_reason_type || ''}
              onChange={(e) => {
                handleChange('form13_reason_type', e.target.value)
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
              Detailed Reason for Amendment
            </label>
            <textarea
              value={formData.form13_reason || ''}
              onChange={(e) => handleChange('form13_reason', e.target.value)}
              className="input-field font-mono text-sm"
              rows={8}
              placeholder="Explain why amendment is being requested..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Provide clear explanation: voluntary correction, response to examination, narrowing claims, etc.
            </p>
          </div>
        </div>
      </div>

      {/* Section 5: SPECIFIC AMENDMENTS DESCRIPTION */}
      <div className="form-section">
        <h3 className="form-section-title">Section 6: Specific Amendments Description</h3>

        <div>
          <label className="label">
            Detailed List of All Amendments
          </label>
          <textarea
            value={formData.form13_specific_amendments || ''}
            onChange={(e) => handleChange('form13_specific_amendments', e.target.value)}
            className="input-field font-mono text-sm"
            rows={10}
            placeholder="Amendment made in claims are as follows:&#10;a. Claims 1 and 10 have been suitably amended&#10;b. Claims 19 to 26 have been deleted&#10;c. New claim 27 has been added..."
          />
          <p className="text-xs text-gray-500 mt-1">
            List each amendment: which claim/paragraph/drawing changed, what was changed, why it was changed
          </p>
        </div>
      </div>

      {/* Section 6: SUPPORTING DOCUMENTS */}
      <div className="form-section">
        <h3 className="form-section-title">Section 7: Supporting Documents</h3>

        <p className="text-sm text-gray-600 mb-4">
          Upload marked and clean copies showing amendments. All uploads are optional.
        </p>

        <div className="space-y-4">
          {/* Marked Copy */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={formData.form13_marked_copy || false}
                onChange={(e) => handleDocumentCheckbox('form13_marked_copy', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <span className="ml-3 text-sm text-gray-700">
                <strong>Marked Copy</strong> (showing track changes - deletions in strikethrough, additions underlined)
              </span>
            </label>

            {formData.form13_marked_copy && (
              <div className="mt-3 ml-7">
                <div className="p-2 bg-yellow-50 border border-yellow-300 rounded mb-2">
                  <p className="text-xs text-yellow-800">
                    <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                    Show deletions with strikethrough, additions with underline or highlighting
                  </p>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload('form13_marked_copy_doc', e)}
                  className="text-sm"
                />
                {formData.form13_marked_copy_doc_filename && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Uploaded: {formData.form13_marked_copy_doc_filename}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Clean Copy */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={formData.form13_clean_copy || false}
                onChange={(e) => handleDocumentCheckbox('form13_clean_copy', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <span className="ml-3 text-sm text-gray-700">
                <strong>Clean Copy</strong> (final version as it will appear after amendment)
              </span>
            </label>

            {formData.form13_clean_copy && (
              <div className="mt-3 ml-7">
                <div className="p-2 bg-green-50 border border-green-300 rounded mb-2">
                  <p className="text-xs text-green-800">
                    Show the complete document as it will appear - no track changes, clean final version
                  </p>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload('form13_clean_copy_doc', e)}
                  className="text-sm"
                />
                {formData.form13_clean_copy_doc_filename && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Uploaded: {formData.form13_clean_copy_doc_filename}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Supporting Statement */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={formData.form13_supporting_statement || false}
                onChange={(e) => handleDocumentCheckbox('form13_supporting_statement', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <span className="ml-3 text-sm text-gray-700">
                <strong>Supporting Statement/Explanation</strong> (optional detailed explanatory document)
              </span>
            </label>

            {formData.form13_supporting_statement && (
              <div className="mt-3 ml-7">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload('form13_supporting_statement_doc', e)}
                  className="text-sm"
                />
                {formData.form13_supporting_statement_doc_filename && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Uploaded: {formData.form13_supporting_statement_doc_filename}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 7: LEGAL DECLARATIONS */}
      <div className="form-section bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="form-section-title">Section 8: Legal Declarations</h3>

        <p className="text-sm text-gray-600 mb-4">
          All declarations are optional but recommended for proper compliance.
        </p>

        <div className="space-y-3">
          <label className="flex items-start p-3 bg-white border border-gray-300 rounded-lg">
            <input
              type="checkbox"
              checked={formData.form13_section59_compliance || false}
              onChange={(e) => handleDocumentCheckbox('form13_section59_compliance', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            />
            <span className="ml-3 text-sm text-gray-800">
              Amendments made are within the scope of section 59 of the Patents Act and are well supported by the originally filed complete specification.
            </span>
          </label>

          <label className="flex items-start p-3 bg-white border border-gray-300 rounded-lg">
            <input
              type="checkbox"
              checked={formData.form13_no_litigation || false}
              onChange={(e) => handleDocumentCheckbox('form13_no_litigation', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            />
            <span className="ml-3 text-sm text-gray-800">
              We declare that no action for infringement or for the revocation of the patent in question is pending before any Court.
            </span>
          </label>

          <label className="flex items-start p-3 bg-white border border-gray-300 rounded-lg">
            <input
              type="checkbox"
              checked={formData.form13_truth_declaration || false}
              onChange={(e) => handleDocumentCheckbox('form13_truth_declaration', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            />
            <span className="ml-3 text-sm text-gray-800">
              We declare that the facts and matters stated herein are true to the best of my/our knowledge information and belief.
            </span>
          </label>
        </div>
      </div>

      {/* Section 8: DATE AND SIGNATURE */}
      <div className="form-section">
        <h3 className="form-section-title">Section 9: Date and Signature</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Filing Date */}
          <div>
            <label className="label">
              Date of Filing
              <AutoFetchBadge source={getAutoFetchSource('form13_filing_date_form')} />
            </label>
            <input
              type="date"
              value={formData.form13_filing_date_form || ''}
              onChange={(e) => handleChange('form13_filing_date_form', e.target.value)}
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: "Dated this [day] day of [Month] [Year]"
            </p>
          </div>

          {/* Signatory Name */}
          <div>
            <label className="label">
              Name of Signatory
              <AutoFetchBadge source={getAutoFetchSource('form13_signatory_name')} />
            </label>
            <input
              type="text"
              value={formData.form13_signatory_name || ''}
              onChange={(e) => handleChange('form13_signatory_name', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form13_signatory_name') === 'agent' ? 'bg-orange-50 border-orange-300' : ''
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
              value={formData.form13_signatory_capacity || ''}
              onChange={(e) => handleChange('form13_signatory_capacity', e.target.value)}
              className="input-field"
              placeholder="e.g., Agent for the Applicant, Applicant, Patentee"
              maxLength={100}
            />
          </div>

          {/* Patent Agent INPA */}
          <div>
            <label className="label">
              Patent Agent Registration Number (if applicable)
              <AutoFetchBadge source={getAutoFetchSource('form13_patent_agent_inpa')} />
            </label>
            <input
              type="text"
              value={formData.form13_patent_agent_inpa || ''}
              onChange={(e) => handleChange('form13_patent_agent_inpa', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form13_patent_agent_inpa') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="(IN/PA/XXXX)"
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
                    onChange={(e) => handleFileUpload('form13_signature', e)}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                JPG, PNG, PDF up to 2MB
              </p>
              {formData.form13_signature_filename && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-700">
                    ✅ Uploaded: {formData.form13_signature_filename}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
        <h4 className="text-sm font-medium text-emerald-800 mb-2">Form 13 Important Guidelines:</h4>
        <ul className="text-xs text-emerald-700 space-y-1">
          <li>• All fields are optional - fill only the information you have available</li>
          <li>• Used to amend application, claims, description, abstract, or drawings</li>
          <li>• Applicant details auto-fetch from Form 6 (if changed) → Form 2 → Form 1</li>
          <li>• Must upload both marked copy (with track changes) AND clean copy (final version)</li>
          <li>• Section 59 compliance: amendments must not introduce new matter or broaden claims</li>
          <li>• Declarations are optional but strongly recommended</li>
          <li>• Before grant: amendments generally allowed; After grant: more restrictions apply</li>
        </ul>
      </div>
    </div>
  )
}

export default Form13Amendment
