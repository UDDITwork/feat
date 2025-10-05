import React, { useEffect, useState } from 'react'
import { useForm } from '../../contexts/FormContext'
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline'

const Form16RegistrationTitle = ({
  formData,
  setFieldValue,
  setNestedFieldValue,
  setArrayFieldValue,
  addArrayItem,
  removeArrayItem
}) => {
  const { errors } = useForm()
  const [autoFetchedFields, setAutoFetchedFields] = useState({})

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
      value: 'merger',
      label: 'Merger/Dissolution',
      template: `1. [ORIGINAL_PATENTEE] was merged into [NEW_OWNER] and then dissolved.

2. That [NEW_OWNER] owing to said merger has acquired all assets and liabilities of [ORIGINAL_PATENTEE], including, but not limited to, patents, copyrights, trademarks, and designs of the latter.

3. The new Assignee ([NEW_OWNER]) has completely bought the assignor ([ORIGINAL_PATENTEE]) and all assets and liabilities have been transferred. The company [ORIGINAL_PATENTEE] has been deleted.

4. [NEW_OWNER] is now the proprietor of the instant Patent No. [PATENT_NUMBER] and therefore claims to substitute the old Patentee in the Patent Register.`
    },
    {
      value: 'assignment',
      label: 'Assignment (Sale/Transfer)',
      template: `1. [ORIGINAL_PATENTEE] has assigned all rights, title, and interest in Patent No. [PATENT_NUMBER] to [NEW_OWNER] through a Deed of Assignment dated [DATE].

2. The assignment includes all rights to make, use, sell, and enforce the patent.

3. [NEW_OWNER] has paid full consideration for the transfer.

4. [NEW_OWNER] requests to be registered as the proprietor in the Patent Register.`
    },
    {
      value: 'transmission',
      label: 'Transmission (Inheritance/Death)',
      template: `1. [ORIGINAL_PATENTEE] passed away on [DATE].

2. [NEW_OWNER] is the legal heir/executor as per succession certificate/will.

3. All rights in Patent No. [PATENT_NUMBER] have devolved to [NEW_OWNER].

4. [NEW_OWNER] requests registration as proprietor.`
    },
    {
      value: 'custom',
      label: 'Custom Reason',
      template: ''
    }
  ]

  // Auto-fetch from Forms 1, 6 (excluding Form 7A)
  useEffect(() => {
    const autoFetchFromPreviousForms = () => {
      const fetched = {}

      // Section 3: Original Patentee Details
      // Try to fetch from Form 1 (if granted patent originated from this application)
      if (!formData.form16_patentee_name) {
        if (formData.form2_applicant_name) {
          setFieldValue('form16_patentee_name', formData.form2_applicant_name)
          fetched.form16_patentee_name = 'form2'
        } else if (formData.applicants?.[0]?.name_full) {
          setFieldValue('form16_patentee_name', formData.applicants[0].name_full)
          fetched.form16_patentee_name = 'form1'
        }
      }

      if (!formData.form16_patentee_address) {
        if (formData.form2_applicant_address) {
          setFieldValue('form16_patentee_address', formData.form2_applicant_address)
          fetched.form16_patentee_address = 'form2'
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
            setFieldValue('form16_patentee_address', addressParts.join('\n'))
            fetched.form16_patentee_address = 'form1'
          }
        }
      }

      // Section 7: Service Address - Conditional auto-fetch
      // Try Form 6 first (if change was done during application), then Form 1
      if (!formData.form16_service_firm) {
        if (formData.form6_service_contact_name) {
          setFieldValue('form16_service_firm', formData.form6_service_contact_name)
          fetched.form16_service_firm = 'form6'
        } else if (formData.service_address?.name) {
          setFieldValue('form16_service_firm', formData.service_address.name)
          fetched.form16_service_firm = 'form1'
        }
      }

      if (!formData.form16_service_address) {
        if (formData.form6_service_address) {
          setFieldValue('form16_service_address', formData.form6_service_address)
          fetched.form16_service_address = 'form6'
        } else if (formData.service_address?.postal_address) {
          setFieldValue('form16_service_address', formData.service_address.postal_address)
          fetched.form16_service_address = 'form1'
        }
      }

      if (!formData.form16_service_telephone) {
        if (formData.form6_service_phone) {
          setFieldValue('form16_service_telephone', formData.form6_service_phone)
          fetched.form16_service_telephone = 'form6'
        } else if (formData.service_address?.telephone_no) {
          setFieldValue('form16_service_telephone', formData.service_address.telephone_no)
          fetched.form16_service_telephone = 'form1'
        }
      }

      if (!formData.form16_service_fax && formData.service_address?.fax_no) {
        setFieldValue('form16_service_fax', formData.service_address.fax_no)
        fetched.form16_service_fax = 'form1'
      }

      if (!formData.form16_service_mobile) {
        if (formData.form6_service_phone) {
          setFieldValue('form16_service_mobile', formData.form6_service_phone)
          fetched.form16_service_mobile = 'form6'
        } else if (formData.service_address?.mobile_no) {
          setFieldValue('form16_service_mobile', formData.service_address.mobile_no)
          fetched.form16_service_mobile = 'form1'
        }
      }

      if (!formData.form16_service_email) {
        if (formData.form6_service_email) {
          setFieldValue('form16_service_email', formData.form6_service_email)
          fetched.form16_service_email = 'form6'
        } else if (formData.service_address?.email_id) {
          setFieldValue('form16_service_email', formData.service_address.email_id)
          fetched.form16_service_email = 'form1'
        }
      }

      // Section 8: Signature - auto-fetch from Form 1 if same agent
      if (!formData.form16_signatory_name) {
        if (formData.patent_agent?.name) {
          setFieldValue('form16_signatory_name', formData.patent_agent.name)
          fetched.form16_signatory_name = 'agent'
        } else if (formData.form6_signatory_name) {
          setFieldValue('form16_signatory_name', formData.form6_signatory_name)
          fetched.form16_signatory_name = 'form6'
        }
      }

      if (!formData.form16_patent_agent_inpa) {
        if (formData.patent_agent?.inpa_no) {
          setFieldValue('form16_patent_agent_inpa', `IN/PA-${formData.patent_agent.inpa_no}`)
          fetched.form16_patent_agent_inpa = 'form1'
        } else if (formData.form6_patent_agent_inpa) {
          setFieldValue('form16_patent_agent_inpa', formData.form6_patent_agent_inpa)
          fetched.form16_patent_agent_inpa = 'form6'
        }
      }

      // Section 9: Patent Office location
      if (!formData.form16_office_location && formData.patent_office_location) {
        setFieldValue('form16_office_location', formData.patent_office_location)
        fetched.form16_office_location = 'form1'
      }

      // Default filing date
      if (!formData.form16_filing_date) {
        const today = new Date().toISOString().split('T')[0]
        setFieldValue('form16_filing_date', today)
        fetched.form16_filing_date = 'default'
      }

      setAutoFetchedFields(fetched)
    }

    autoFetchFromPreviousForms()
  }, [])

  const handleChange = (field, value) => {
    setFieldValue(field, value)
  }

  const handleReasonTemplateSelect = (templateType) => {
    const template = reasonTemplates.find(t => t.value === templateType)
    if (template && template.template) {
      const newOwner = formData.form16_grantee_name || '[NEW OWNER]'
      const originalPatentee = formData.form16_patentee_name || '[ORIGINAL PATENTEE]'
      const patentNumber = formData.form16_patent_number || '[PATENT NUMBER]'
      const today = new Date().toLocaleDateString('en-GB')

      const filledTemplate = template.template
        .replace(/\[NEW_OWNER\]/g, newOwner)
        .replace(/\[ORIGINAL_PATENTEE\]/g, originalPatentee)
        .replace(/\[PATENT_NUMBER\]/g, patentNumber)
        .replace(/\[DATE\]/g, today)

      setFieldValue('form16_reason', filledTemplate)
    } else {
      setFieldValue('form16_reason', '')
    }
  }

  const handleFileUpload = (field, event) => {
    const file = event.target.files[0]
    if (file) {
      const maxSize = field.includes('signature') ? 2 * 1024 * 1024 : 5 * 1024 * 1024

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
      form6: { color: 'purple', text: '🔄 From Form 6' },
      form2: { color: 'blue', text: '🔄 From Form 2' },
      form1: { color: 'green', text: '🔄 From Form 1' },
      agent: { color: 'orange', text: '👤 Patent Agent' },
      default: { color: 'gray', text: '📅 Current Date' }
    }

    const config = badgeConfig[source] || { color: 'gray', text: '📥 Auto' }

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium text-${config.color}-700 bg-${config.color}-100 ml-2`}>
        {config.text}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 -lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Form 16: Application for Registration of Title/Interest in a Patent
        </h2>
        <p className="text-sm text-gray-600 mb-1">
          Section 69(1), 69(2); Rules 90(1), 90(2) of The Patents Act, 1970 & The Patents Rules, 2003
        </p>
        <p className="text-xs text-teal-700 mt-2">
          📋 Use this form to register change of ownership AFTER patent has been GRANTED
        </p>
        <p className="text-xs text-gray-600 mt-1">
          All fields are optional. Original patentee details will auto-populate if patent originated from your application.
        </p>
      </div>

      {/* Section 1: NEW OWNER/GRANTEE DETAILS */}
      <div className="form-section bg-yellow-50 border border-yellow-200 -lg p-6">
        <h3 className="form-section-title">Section 1: New Owner/Grantee Details</h3>

        <p className="text-sm text-gray-600 mb-4">
          Enter details of the person/entity acquiring ownership of the granted patent. All fields are optional.
        </p>

        <div className="grid grid-cols-1 gap-6">
          {/* New Owner Name */}
          <div>
            <label className="label">
              Name of New Owner (Grantee)
            </label>
            <input
              type="text"
              value={formData.form16_grantee_name || ''}
              onChange={(e) => handleChange('form16_grantee_name', e.target.value)}
              className="input-field"
              placeholder="e.g., RUGGLI AG"
              maxLength={300}
            />
            <p className="text-xs text-gray-500 mt-1">
              Full legal name of entity/person acquiring the granted patent
            </p>
          </div>

          {/* New Owner Address */}
          <div>
            <label className="label">
              Complete Address of New Owner
            </label>
            <textarea
              value={formData.form16_grantee_address || ''}
              onChange={(e) => handleChange('form16_grantee_address', e.target.value)}
              className="input-field"
              rows={4}
              placeholder="Tüftelstrasse 50, 5322 Koblenz, Switzerland"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              Complete registered address including street, city, country, postal code
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: GRANTED PATENT DETAILS */}
      <div className="form-section">
        <h3 className="form-section-title">Section 2: Granted Patent Details</h3>

        <p className="text-sm text-gray-600 mb-4">
          Enter the granted Indian Patent Number. All fields are optional.
        </p>

        <div>
          <label className="label">
            Indian Patent Number
          </label>
          <input
            type="text"
            value={formData.form16_patent_number || ''}
            onChange={(e) => handleChange('form16_patent_number', e.target.value)}
            className="input-field"
            placeholder="e.g., 369946"
            maxLength={50}
          />
          <p className="text-xs text-gray-500 mt-1">
            This is the GRANTED patent number (NOT the application number)
          </p>
        </div>
      </div>

      {/* Section 3: ORIGINAL PATENTEE DETAILS */}
      <div className="form-section">
        <h3 className="form-section-title">Section 3: Original Patentee Details (On Record)</h3>

        <p className="text-sm text-gray-600 mb-4">
          Current patentee as recorded in the patent register. Auto-populated if patent originated from your application.
        </p>

        <div className="grid grid-cols-1 gap-6">
          {/* Original Patentee Name */}
          <div>
            <label className="label">
              Original Patentee Name (On Record)
              <AutoFetchBadge source={getAutoFetchSource('form16_patentee_name')} />
            </label>
            <input
              type="text"
              value={formData.form16_patentee_name || ''}
              onChange={(e) => handleChange('form16_patentee_name', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form16_patentee_name') === 'form2' ? 'bg-blue-50 border-blue-300' :
                getAutoFetchSource('form16_patentee_name') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="e.g., RUGGLI PROJECTS AG"
              maxLength={300}
            />
            <p className="text-xs text-gray-500 mt-1">
              Name exactly as it appears in the granted patent certificate
            </p>
          </div>

          {/* Original Patentee Address */}
          <div>
            <label className="label">
              Original Patentee Address (On Record)
              <AutoFetchBadge source={getAutoFetchSource('form16_patentee_address')} />
            </label>
            <textarea
              value={formData.form16_patentee_address || ''}
              onChange={(e) => handleChange('form16_patentee_address', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form16_patentee_address') === 'form2' ? 'bg-blue-50 border-blue-300' :
                getAutoFetchSource('form16_patentee_address') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              rows={3}
              placeholder="Frauentalstrasse 3 6332 Hagendorn, Switzerland"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              Address exactly as recorded in the patent register
            </p>
          </div>
        </div>
      </div>

      {/* Section 4: REASON FOR REGISTRATION */}
      <div className="form-section">
        <h3 className="form-section-title">Section 4: Reason for Change of Ownership</h3>

        <div className="space-y-4">
          {/* Template Selection */}
          <div>
            <label className="label">
              Select Reason Type (Optional - or write custom)
            </label>
            <select
              value={formData.form16_reason_type || ''}
              onChange={(e) => {
                handleChange('form16_reason_type', e.target.value)
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
              Detailed Reason Statement (Numbered Points)
            </label>
            <textarea
              value={formData.form16_reason || ''}
              onChange={(e) => handleChange('form16_reason', e.target.value)}
              className="input-field font-mono text-sm"
              rows={10}
              placeholder="Provide numbered explanation for ownership change. Example:&#10;&#10;1. [ORIGINAL PATENTEE] was merged into [NEW OWNER] and then dissolved.&#10;&#10;2. That [NEW OWNER] owing to said merger has acquired all assets and liabilities..."
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 mt-1">
              Explain the reason: Merger, Assignment, Transmission, etc. Use numbered points.
            </p>
          </div>
        </div>
      </div>

      {/* Section 5: SUPPORTING DOCUMENTS */}
      <div className="form-section">
        <h3 className="form-section-title">Section 5: Supporting Documents</h3>

        <p className="text-sm text-gray-600 mb-4">
          All document uploads are optional. Upload supporting documents as applicable.
        </p>

        <div className="space-y-4">
          {/* Merger Certificate / Assignment Deed */}
          <div className="border border-gray-200 -lg p-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={formData.form16_doc_merger_or_assignment || false}
                onChange={(e) => handleDocumentCheckbox('form16_doc_merger_or_assignment', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300  mt-1"
              />
              <span className="ml-3 text-sm text-gray-700">
                <strong>Notarized Certificate of Merger / Deed of Assignment</strong>
              </span>
            </label>

            {formData.form16_doc_merger_or_assignment && (
              <div className="mt-3 ml-7">
                <select
                  value={formData.form16_transfer_type || ''}
                  onChange={(e) => handleChange('form16_transfer_type', e.target.value)}
                  className="input-field mb-2"
                >
                  <option value="">-- Select document type --</option>
                  <option value="merger">Certificate of Merger</option>
                  <option value="assignment">Deed of Assignment</option>
                  <option value="transmission">Transmission Documents (Death Certificate, Will, etc.)</option>
                </select>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload('form16_merger_assignment', e)}
                  className="text-sm"
                />
                {formData.form16_merger_assignment_filename && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Uploaded: {formData.form16_merger_assignment_filename}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Power of Attorney */}
          <div className="border border-gray-200 -lg p-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={formData.form16_doc_power_of_attorney || false}
                onChange={(e) => handleDocumentCheckbox('form16_doc_power_of_attorney', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300  mt-1"
              />
              <span className="ml-3 text-sm text-gray-700">
                <strong>Power of Attorney</strong> signed on behalf of new owner
              </span>
            </label>

            {formData.form16_doc_power_of_attorney && (
              <div className="mt-3 ml-7">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload('form16_power_of_attorney', e)}
                  className="text-sm"
                />
                {formData.form16_power_of_attorney_filename && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Uploaded: {formData.form16_power_of_attorney_filename}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Additional Documents */}
          <div className="border border-gray-200 -lg p-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={formData.form16_doc_additional || false}
                onChange={(e) => handleDocumentCheckbox('form16_doc_additional', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300  mt-1"
              />
              <span className="ml-3 text-sm text-gray-700">
                <strong>Additional supporting documents</strong> (certificates, board resolutions, etc.)
              </span>
            </label>

            {formData.form16_doc_additional && (
              <div className="mt-3 ml-7">
                <textarea
                  value={formData.form16_additional_docs_description || ''}
                  onChange={(e) => handleChange('form16_additional_docs_description', e.target.value)}
                  className="input-field text-sm"
                  rows={3}
                  placeholder="List additional documents: Certificate of incorporation, Board resolution, Court orders, etc."
                  maxLength={500}
                />
                <input
                  type="file"
                  accept=".pdf,.jpg,.png"
                  multiple
                  onChange={(e) => handleFileUpload('form16_additional_docs', e)}
                  className="text-sm mt-2"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 6: REGISTRATION REQUEST */}
      <div className="form-section bg-indigo-50 border border-indigo-200 -lg p-6">
        <h3 className="form-section-title">Section 6: Request for Registration</h3>

        <div className="flex items-start p-4 bg-white border border-gray-300 -lg">
          <input
            type="checkbox"
            checked={formData.form16_registration_request || false}
            onChange={(e) => handleDocumentCheckbox('form16_registration_request', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300  mt-1"
          />
          <span className="ml-3 text-sm text-gray-800">
            We hereby apply that a notification thereof may be entered into the register of patents.
          </span>
        </div>

        <p className="text-xs text-indigo-600 mt-2">
          📝 Standard request to update the patent register with the new ownership
        </p>
      </div>

      {/* Section 7: ADDRESS FOR SERVICE IN INDIA */}
      <div className="form-section">
        <h3 className="form-section-title">Section 7: Address for Service in India</h3>

        <p className="text-sm text-gray-600 mb-4">
          All communications will be sent to this address. Auto-populated if same agent/firm is handling.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Firm Name */}
          <div className="md:col-span-2">
            <label className="label">
              Firm / Organization Name
              <AutoFetchBadge source={getAutoFetchSource('form16_service_firm')} />
            </label>
            <input
              type="text"
              value={formData.form16_service_firm || ''}
              onChange={(e) => handleChange('form16_service_firm', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form16_service_firm') === 'form6' ? 'bg-purple-50 border-purple-300' :
                getAutoFetchSource('form16_service_firm') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="M/s. United Overseas Patent Firm"
              maxLength={200}
            />
          </div>

          {/* Postal Address */}
          <div className="md:col-span-2">
            <label className="label">
              Complete Postal Address
              <AutoFetchBadge source={getAutoFetchSource('form16_service_address')} />
            </label>
            <textarea
              value={formData.form16_service_address || ''}
              onChange={(e) => handleChange('form16_service_address', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form16_service_address') === 'form6' ? 'bg-purple-50 border-purple-300' :
                getAutoFetchSource('form16_service_address') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              rows={4}
              placeholder="52, Sukhdev Vihar, Mathura Road, New Delhi-110025"
              maxLength={500}
            />
          </div>

          {/* Telephone */}
          <div>
            <label className="label">
              Telephone Number(s)
              <AutoFetchBadge source={getAutoFetchSource('form16_service_telephone')} />
            </label>
            <input
              type="tel"
              value={formData.form16_service_telephone || ''}
              onChange={(e) => handleChange('form16_service_telephone', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form16_service_telephone') ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="(011)-2684-3455; 3295-9881"
              maxLength={100}
            />
          </div>

          {/* Fax */}
          <div>
            <label className="label">
              Fax Number(s)
              <AutoFetchBadge source={getAutoFetchSource('form16_service_fax')} />
            </label>
            <input
              type="tel"
              value={formData.form16_service_fax || ''}
              onChange={(e) => handleChange('form16_service_fax', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form16_service_fax') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="(011)-2682-8578"
              maxLength={50}
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="label">
              Mobile Number
              <AutoFetchBadge source={getAutoFetchSource('form16_service_mobile')} />
            </label>
            <input
              type="tel"
              value={formData.form16_service_mobile || ''}
              onChange={(e) => handleChange('form16_service_mobile', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form16_service_mobile') ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="9810017859"
              maxLength={15}
            />
          </div>

          {/* Email */}
          <div>
            <label className="label">
              Email Address(es)
              <AutoFetchBadge source={getAutoFetchSource('form16_service_email')} />
            </label>
            <input
              type="email"
              value={formData.form16_service_email || ''}
              onChange={(e) => handleChange('form16_service_email', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form16_service_email') ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="patent@example.com; office@example.com"
              maxLength={200}
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
              Date of Filing
              <AutoFetchBadge source={getAutoFetchSource('form16_filing_date')} />
            </label>
            <input
              type="date"
              value={formData.form16_filing_date || ''}
              onChange={(e) => handleChange('form16_filing_date', e.target.value)}
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
              <AutoFetchBadge source={getAutoFetchSource('form16_signatory_name')} />
            </label>
            <input
              type="text"
              value={formData.form16_signatory_name || ''}
              onChange={(e) => handleChange('form16_signatory_name', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form16_signatory_name') === 'agent' ? 'bg-orange-50 border-orange-300' :
                getAutoFetchSource('form16_signatory_name') === 'form6' ? 'bg-purple-50 border-purple-300' : ''
              }`}
              placeholder="Full name of person signing"
              maxLength={200}
            />
          </div>

          {/* Signatory Designation */}
          <div>
            <label className="label">
              Designation
            </label>
            <input
              type="text"
              value={formData.form16_signatory_designation || ''}
              onChange={(e) => handleChange('form16_signatory_designation', e.target.value)}
              className="input-field"
              placeholder="e.g., Registered Patent Agent, Agent for the Applicant"
              maxLength={100}
            />
          </div>

          {/* Patent Agent INPA */}
          <div>
            <label className="label">
              Patent Agent Registration Number (if applicable)
              <AutoFetchBadge source={getAutoFetchSource('form16_patent_agent_inpa')} />
            </label>
            <input
              type="text"
              value={formData.form16_patent_agent_inpa || ''}
              onChange={(e) => handleChange('form16_patent_agent_inpa', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form16_patent_agent_inpa') ? 'bg-green-50 border-green-300' : ''
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
          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed -lg hover:border-primary-400 transition-colors">
            <div className="space-y-2 text-center">
              <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white -md font-medium text-primary-600 hover:text-primary-500">
                  <span>Upload signature</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileUpload('form16_signature', e)}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                JPG, PNG, PDF up to 2MB
              </p>
              {formData.form16_signature_filename && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 ">
                  <p className="text-sm text-green-700">
                    ✅ Uploaded: {formData.form16_signature_filename}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 9: ADDRESSEE */}
      <div className="form-section bg-gray-50 border border-gray-300 -lg p-6">
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
              Patent Office Location:
              <AutoFetchBadge source={getAutoFetchSource('form16_office_location')} />
            </label>
            <select
              value={formData.form16_office_location || 'delhi'}
              onChange={(e) => handleChange('form16_office_location', e.target.value)}
              className={`input-field mt-2 ${
                getAutoFetchSource('form16_office_location') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
            >
              {patentOfficeLocations.map(location => (
                <option key={location.value} value={location.value}>
                  {location.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select the Patent Office where the patent is registered
            </p>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="p-4 bg-teal-50 -lg border border-teal-200">
        <h4 className="text-sm font-medium text-teal-800 mb-2">Form 16 Important Guidelines:</h4>
        <ul className="text-xs text-teal-700 space-y-1">
          <li>• All fields are optional - fill only the information you have available</li>
          <li>• Form 16 is used ONLY for GRANTED patents (after grant)</li>
          <li>• For pending applications, use Form 6 instead</li>
          <li>• Patent number is the GRANTED number, not the application number</li>
          <li>• Merger certificate or assignment deed must be notarized/stamped</li>
          <li>• Service address auto-fills if same patent agent/firm handling</li>
          <li>• Registration request is a standard checkbox acknowledgment</li>
        </ul>
      </div>
    </div>
  )
}

export default Form16RegistrationTitle
