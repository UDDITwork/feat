import React, { useEffect, useState } from 'react'
import { useForm } from '../../contexts/FormContext'
import { PlusIcon, TrashIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'

const Form8InventorMention = ({
  formData,
  setFieldValue,
  setNestedFieldValue,
  setArrayFieldValue,
  addArrayItem,
  removeArrayItem
}) => {
  const { errors } = useForm()
  const [autoFetchedFields, setAutoFetchedFields] = useState({})

  // Auto-fetch from Forms 1, 5 (excluding Form 7A)
  useEffect(() => {
    const autoFetchFromPreviousForms = () => {
      const fetched = {}

      // Section 1: Requestor Details - auto-fetch from Form 1
      if (!formData.form8_requestor_name) {
        if (formData.applicants?.[0]?.name_full) {
          setFieldValue('form8_requestor_name', formData.applicants[0].name_full)
          fetched.form8_requestor_name = 'form1'
        }
      }

      if (!formData.form8_requestor_address) {
        if (formData.applicants?.[0]?.address) {
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
            setFieldValue('form8_requestor_address', addressParts.join('\n'))
            fetched.form8_requestor_address = 'form1'
          }
        }
      }

      // Section 2: Application Details - auto-fetch from Form 1
      if (!formData.form8_application_number && formData.application_number) {
        setFieldValue('form8_application_number', formData.application_number)
        fetched.form8_application_number = 'form1'
      }

      if (!formData.form8_filing_date && formData.filing_date) {
        setFieldValue('form8_filing_date', formData.filing_date)
        fetched.form8_filing_date = 'form1'
      }

      if (!formData.form8_original_applicant_name) {
        if (formData.applicants?.[0]?.name_full) {
          setFieldValue('form8_original_applicant_name', formData.applicants[0].name_full)
          fetched.form8_original_applicant_name = 'form1'
        }
      }

      // Section 3: Inventors - partial auto-fetch from Form 5 or Form 1
      if (!formData.form8_inventors || formData.form8_inventors.length === 0) {
        let inventorsList = []
        let source = 'none'

        // Try Form 5 first
        if (formData.form5_inventors && formData.form5_inventors.length > 0) {
          inventorsList = formData.form5_inventors.map(inv => ({
            name: inv.name || '',
            nationality: inv.nationality || '',
            address: inv.address || ''
          }))
          source = 'form5'
        }
        // Then try Form 1 if inventors were listed separately
        else if (formData.inventors_same_as_applicants === 'no' && formData.inventors?.length > 0) {
          inventorsList = formData.inventors.map(inv => ({
            name: inv.name_full || '',
            nationality: inv.nationality || '',
            address: inv.address || ''
          }))
          source = 'form1'
        }
        // If inventors same as applicants in Form 1
        else if (formData.inventors_same_as_applicants === 'yes' && formData.applicants?.length > 0) {
          inventorsList = formData.applicants.map(app => ({
            name: app.name_full || '',
            nationality: app.nationality || '',
            address: app.address ? Object.values(app.address).filter(Boolean).join(', ') : ''
          }))
          source = 'applicants'
        }
        // Default to one blank inventor
        else {
          inventorsList = [{ name: '', nationality: '', address: '' }]
          source = 'none'
        }

        if (inventorsList.length > 0) {
          setFieldValue('form8_inventors', inventorsList)
          if (source !== 'none') {
            fetched.form8_inventors = source
          }
        }
      }

      // Section 6: Service Address - auto-fetch from Form 1
      if (!formData.form8_service_contact && formData.service_address?.name) {
        setFieldValue('form8_service_contact', formData.service_address.name)
        fetched.form8_service_contact = 'form1'
      }

      if (!formData.form8_service_firm && formData.patent_agent?.name) {
        setFieldValue('form8_service_firm', formData.patent_agent.name)
        fetched.form8_service_firm = 'agent'
      }

      if (!formData.form8_service_address && formData.service_address?.postal_address) {
        setFieldValue('form8_service_address', formData.service_address.postal_address)
        fetched.form8_service_address = 'form1'
      }

      if (!formData.form8_service_telephone && formData.service_address?.telephone_no) {
        setFieldValue('form8_service_telephone', formData.service_address.telephone_no)
        fetched.form8_service_telephone = 'form1'
      }

      if (!formData.form8_service_mobile && formData.service_address?.mobile_no) {
        setFieldValue('form8_service_mobile', formData.service_address.mobile_no)
        fetched.form8_service_mobile = 'form1'
      }

      if (!formData.form8_service_email && formData.service_address?.email_id) {
        setFieldValue('form8_service_email', formData.service_address.email_id)
        fetched.form8_service_email = 'form1'
      }

      // Section 7: Signature - auto-fetch from Form 1
      if (!formData.form8_signatory_name && formData.patent_agent?.name) {
        setFieldValue('form8_signatory_name', formData.patent_agent.name)
        fetched.form8_signatory_name = 'agent'
      }

      if (!formData.form8_patent_agent_inpa && formData.patent_agent?.inpa_no) {
        setFieldValue('form8_patent_agent_inpa', `IN/PA/${formData.patent_agent.inpa_no}`)
        fetched.form8_patent_agent_inpa = 'form1'
      }

      // Default filing date
      if (!formData.form8_filing_date_form) {
        const today = new Date().toISOString().split('T')[0]
        setFieldValue('form8_filing_date_form', today)
        fetched.form8_filing_date_form = 'default'
      }

      setAutoFetchedFields(fetched)
    }

    autoFetchFromPreviousForms()
  }, [])

  const handleChange = (field, value) => {
    setFieldValue(field, value)
  }

  const handleInventorChange = (index, field, value) => {
    setArrayFieldValue('form8_inventors', index, field, value)
  }

  const addInventor = () => {
    addArrayItem('form8_inventors', {
      name: '',
      nationality: '',
      address: ''
    })
  }

  const removeInventor = (index) => {
    removeArrayItem('form8_inventors', index)
  }

  const handleFileUpload = (field, event) => {
    const file = event.target.files[0]
    if (file) {
      const maxSize = field.includes('signature') ? 2 * 1024 * 1024 : 5 * 1024 * 1024

      if (file.size > maxSize) {
        alert(`File size must be less than ${maxSize / (1024 * 1024)}MB`)
        return
      }

      const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!validTypes.includes(file.type)) {
        alert('Only JPG, PNG, PDF, DOC, and DOCX files are allowed')
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
      form5: { color: 'purple', text: '🔄 From Form 5' },
      form1: { color: 'green', text: '🔄 From Form 1' },
      applicants: { color: 'blue', text: '🔄 From Applicants' },
      agent: { color: 'orange', text: '👤 Patent Agent' },
      default: { color: 'gray', text: '📅 Current Date' }
    }

    const config = badgeConfig[source] || { color: 'gray', text: '📥 Auto' }

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium text-${config.color}-700 bg-${config.color}-100 -md ml-2`}>
        {config.text}
      </span>
    )
  }

  const inventors = formData.form8_inventors || []

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 -lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Form 8: Request for Mention of Inventor in Patent
        </h2>
        <p className="text-sm text-gray-600 mb-1">
          Section 28(2), 28(3), 28(7); Rules 66, 67, 68 of The Patents Act, 1970 & The Patents Rules, 2003
        </p>
        <p className="text-xs text-pink-700 mt-2">
          📋 Request to specifically mention inventor names in the patent grant certificate
        </p>
        <p className="text-xs text-gray-600 mt-1">
          All fields are optional. Requestor and inventor details will auto-populate from previous forms.
        </p>
      </div>

      {/* Section 1: REQUESTOR DETAILS */}
      <div className="form-section">
        <h3 className="form-section-title">Section 1: Requestor/Applicant Details</h3>

        <p className="text-sm text-gray-600 mb-4">
          Details of the person/entity making this request. Auto-populated from Form 1. All fields are optional.
        </p>

        <div className="grid grid-cols-1 gap-6">
          {/* Requestor Name */}
          <div>
            <label className="label">
              Requestor Name
              <AutoFetchBadge source={getAutoFetchSource('form8_requestor_name')} />
            </label>
            <input
              type="text"
              value={formData.form8_requestor_name || ''}
              onChange={(e) => handleChange('form8_requestor_name', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form8_requestor_name') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="e.g., NewGen IEDC, GLA University, Mathura"
              maxLength={300}
            />
            {isFieldAutoFetched('form8_requestor_name') && (
              <p className="text-xs text-green-600 mt-1">
                ✅ Auto-populated from Form 1
              </p>
            )}
          </div>

          {/* Requestor Address */}
          <div>
            <label className="label">
              Requestor Address
              <AutoFetchBadge source={getAutoFetchSource('form8_requestor_address')} />
            </label>
            <textarea
              value={formData.form8_requestor_address || ''}
              onChange={(e) => handleChange('form8_requestor_address', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form8_requestor_address') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              rows={4}
              placeholder="Complete address"
              maxLength={500}
            />
          </div>
        </div>
      </div>

      {/* Section 2: PATENT APPLICATION DETAILS */}
      <div className="form-section">
        <h3 className="form-section-title">Section 2: Patent Application Details</h3>

        <p className="text-sm text-gray-600 mb-4">
          Details of the patent application. Auto-populated from Form 1. All fields are optional.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Application Number */}
          <div>
            <label className="label">
              Patent Application Number
              <AutoFetchBadge source={getAutoFetchSource('form8_application_number')} />
            </label>
            <input
              type="text"
              value={formData.form8_application_number || ''}
              onChange={(e) => handleChange('form8_application_number', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form8_application_number') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="e.g., 201911052234"
              maxLength={50}
            />
          </div>

          {/* Filing Date */}
          <div>
            <label className="label">
              Application Filing Date
              <AutoFetchBadge source={getAutoFetchSource('form8_filing_date')} />
            </label>
            <input
              type="date"
              value={formData.form8_filing_date || ''}
              onChange={(e) => handleChange('form8_filing_date', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form8_filing_date') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
            />
          </div>

          {/* Original Applicant Name */}
          <div className="md:col-span-2">
            <label className="label">
              Applicant Name (of the Patent Application)
              <AutoFetchBadge source={getAutoFetchSource('form8_original_applicant_name')} />
            </label>
            <input
              type="text"
              value={formData.form8_original_applicant_name || ''}
              onChange={(e) => handleChange('form8_original_applicant_name', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form8_original_applicant_name') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="Applicant name from Form 1"
              maxLength={300}
            />
          </div>
        </div>
      </div>

      {/* Section 3: INVENTOR(S) DETAILS */}
      <div className="form-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="form-section-title">
            Section 3: Inventor(s) Details
            {isFieldAutoFetched('form8_inventors') && (
              <AutoFetchBadge source={getAutoFetchSource('form8_inventors')} />
            )}
          </h3>
          <button
            type="button"
            onClick={addInventor}
            className="btn-primary flex items-center text-sm"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Inventor
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          List all inventors to be mentioned in the patent certificate. Auto-populated from Forms 1/5 if available. All fields are optional.
        </p>

        {inventors.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 -lg border border-gray-200">
            <p className="text-gray-500 mb-4">No inventors added yet</p>
            <button
              type="button"
              onClick={addInventor}
              className="btn-primary flex items-center mx-auto"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add First Inventor
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">S.No.</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Inventor Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Nationality</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Address</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventors.map((inventor, index) => (
                  <tr key={index} className={`${isFieldAutoFetched('form8_inventors') ? 'bg-green-50' : ''}`}>
                    <td className="px-3 py-2 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={inventor.name || ''}
                        onChange={(e) => handleInventorChange(index, 'name', e.target.value)}
                        className="input-field text-sm"
                        placeholder="Full name"
                        maxLength={200}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={inventor.nationality || ''}
                        onChange={(e) => handleInventorChange(index, 'nationality', e.target.value)}
                        className="input-field text-sm"
                        placeholder="Nationality"
                        maxLength={100}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <textarea
                        value={inventor.address || ''}
                        onChange={(e) => handleInventorChange(index, 'address', e.target.value)}
                        className="input-field text-sm"
                        rows={2}
                        placeholder="Complete address"
                        maxLength={500}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => removeInventor(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isFieldAutoFetched('form8_inventors') && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 -lg">
            <p className="text-xs text-green-700">
              ✅ Inventors auto-populated from {getAutoFetchSource('form8_inventors') === 'form5' ? 'Form 5' : getAutoFetchSource('form8_inventors') === 'form1' ? 'Form 1' : 'applicant details'}. You can edit or add more inventors.
            </p>
          </div>
        )}
      </div>

      {/* Section 4: CERTIFICATE REQUEST */}
      <div className="form-section bg-indigo-50 border border-indigo-200 -lg p-6">
        <h3 className="form-section-title">Section 4: Request for Certificate</h3>

        <div className="flex items-start p-4 bg-white border border-gray-300 -lg">
          <input
            type="checkbox"
            checked={formData.form8_certificate_request || false}
            onChange={(e) => setFieldValue('form8_certificate_request', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300  mt-1"
          />
          <span className="ml-3 text-sm text-gray-800">
            and we hereby apply for a certificate to that effect.
          </span>
        </div>

        <p className="text-xs text-indigo-600 mt-3">
          📝 Standard request for certificate showing inventor names
        </p>
      </div>

      {/* Section 5: SUPPORTING STATEMENT */}
      <div className="form-section">
        <h3 className="form-section-title">Section 5: Supporting Statement</h3>

        <p className="text-sm text-gray-600 mb-4">
          Upload a detailed statement explaining the circumstances. All uploads are optional.
        </p>

        <div className="space-y-4">
          {/* Statement Attachment */}
          <div className="border border-gray-200 -lg p-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={formData.form8_statement_attached || false}
                onChange={(e) => setFieldValue('form8_statement_attached', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300  mt-1"
              />
              <span className="ml-3 text-sm text-gray-700">
                <strong>Supporting Statement</strong> setting out circumstances for this request
              </span>
            </label>

            {formData.form8_statement_attached && (
              <div className="mt-3 ml-7">
                <textarea
                  value={formData.form8_statement_content || ''}
                  onChange={(e) => handleChange('form8_statement_content', e.target.value)}
                  className="input-field text-sm mb-2"
                  rows={6}
                  placeholder="Numbered points explaining:&#10;1. The invention covered by this application is a direct consequence of the inventors.&#10;2. To acknowledge the inventorship and safeguard their rights...&#10;3. Inventors would be able to use the certificate as evidence..."
                />
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload('form8_statement', e)}
                  className="text-sm"
                />
                {formData.form8_statement_filename && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Uploaded: {formData.form8_statement_filename}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* NOC from Existing Inventors (if adding new inventors) */}
          <div className="border border-gray-200 -lg p-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={formData.form8_noc_attached || false}
                onChange={(e) => setFieldValue('form8_noc_attached', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300  mt-1"
              />
              <span className="ml-3 text-sm text-gray-700">
                <strong>No Objection Certificate (NOC)</strong> from existing inventors (if adding new inventors)
              </span>
            </label>

            {formData.form8_noc_attached && (
              <div className="mt-3 ml-7">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload('form8_noc', e)}
                  className="text-sm"
                />
                {formData.form8_noc_filename && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Uploaded: {formData.form8_noc_filename}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Revised Form 1 */}
          <div className="border border-blue-200 bg-blue-50 -lg p-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={formData.form8_revised_form1 || false}
                onChange={(e) => setFieldValue('form8_revised_form1', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300  mt-1"
              />
              <span className="ml-3 text-sm text-blue-800">
                <strong>Revised Form 1</strong> with updated inventor details
              </span>
            </label>

            {formData.form8_revised_form1 && (
              <div className="mt-3 ml-7">
                <div className="p-2 bg-blue-100 border border-blue-300  mb-2">
                  <p className="text-xs text-blue-800">
                    Update ONLY Section 4 (Inventor Details). Keep all other sections unchanged.
                  </p>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload('form8_revised_form1_doc', e)}
                  className="text-sm"
                />
                {formData.form8_revised_form1_doc_filename && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Uploaded: {formData.form8_revised_form1_doc_filename}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Revised Form 5 */}
          <div className="border border-blue-200 bg-blue-50 -lg p-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={formData.form8_revised_form5 || false}
                onChange={(e) => setFieldValue('form8_revised_form5', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300  mt-1"
              />
              <span className="ml-3 text-sm text-blue-800">
                <strong>Revised Form 5</strong> with updated inventor details
              </span>
            </label>

            {formData.form8_revised_form5 && (
              <div className="mt-3 ml-7">
                <div className="p-2 bg-blue-100 border border-blue-300  mb-2">
                  <p className="text-xs text-blue-800">
                    Update ONLY Section 2 (Inventor Details). Keep application details unchanged.
                  </p>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload('form8_revised_form5_doc', e)}
                  className="text-sm"
                />
                {formData.form8_revised_form5_doc_filename && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Uploaded: {formData.form8_revised_form5_doc_filename}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 6: ADDRESS FOR SERVICE IN INDIA */}
      <div className="form-section">
        <h3 className="form-section-title">Section 6: Address for Service in India</h3>

        <p className="text-sm text-gray-600 mb-4">
          Contact details for communications. Auto-populated from Form 1. All fields are optional.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Person */}
          <div>
            <label className="label">
              Contact Person Name
              <AutoFetchBadge source={getAutoFetchSource('form8_service_contact')} />
            </label>
            <input
              type="text"
              value={formData.form8_service_contact || ''}
              onChange={(e) => handleChange('form8_service_contact', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form8_service_contact') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="Contact person name"
              maxLength={200}
            />
          </div>

          {/* Firm Name */}
          <div>
            <label className="label">
              Firm / Organization Name
              <AutoFetchBadge source={getAutoFetchSource('form8_service_firm')} />
            </label>
            <input
              type="text"
              value={formData.form8_service_firm || ''}
              onChange={(e) => handleChange('form8_service_firm', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form8_service_firm') === 'agent' ? 'bg-orange-50 border-orange-300' : ''
              }`}
              placeholder="M/s United Overseas Patent Firm"
              maxLength={200}
            />
          </div>

          {/* Service Address */}
          <div className="md:col-span-2">
            <label className="label">
              Complete Postal Address
              <AutoFetchBadge source={getAutoFetchSource('form8_service_address')} />
            </label>
            <textarea
              value={formData.form8_service_address || ''}
              onChange={(e) => handleChange('form8_service_address', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form8_service_address') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              rows={3}
              placeholder="Complete address in India"
              maxLength={500}
            />
          </div>

          {/* Telephone */}
          <div>
            <label className="label">
              Telephone Number(s)
              <AutoFetchBadge source={getAutoFetchSource('form8_service_telephone')} />
            </label>
            <input
              type="tel"
              value={formData.form8_service_telephone || ''}
              onChange={(e) => handleChange('form8_service_telephone', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form8_service_telephone') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="011-2684-3455"
              maxLength={100}
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="label">
              Mobile Number
              <AutoFetchBadge source={getAutoFetchSource('form8_service_mobile')} />
            </label>
            <input
              type="tel"
              value={formData.form8_service_mobile || ''}
              onChange={(e) => handleChange('form8_service_mobile', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form8_service_mobile') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="9810132015"
              maxLength={15}
            />
          </div>

          {/* Email */}
          <div className="md:col-span-2">
            <label className="label">
              Email Address(es)
              <AutoFetchBadge source={getAutoFetchSource('form8_service_email')} />
            </label>
            <input
              type="email"
              value={formData.form8_service_email || ''}
              onChange={(e) => handleChange('form8_service_email', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form8_service_email') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="unitedpatent@example.com; patent@example.com"
              maxLength={200}
            />
          </div>
        </div>
      </div>

      {/* Section 7: DATE AND SIGNATURE */}
      <div className="form-section">
        <h3 className="form-section-title">Section 7: Date and Signature</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Filing Date */}
          <div>
            <label className="label">
              Date of Filing
              <AutoFetchBadge source={getAutoFetchSource('form8_filing_date_form')} />
            </label>
            <input
              type="date"
              value={formData.form8_filing_date_form || ''}
              onChange={(e) => handleChange('form8_filing_date_form', e.target.value)}
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
              <AutoFetchBadge source={getAutoFetchSource('form8_signatory_name')} />
            </label>
            <input
              type="text"
              value={formData.form8_signatory_name || ''}
              onChange={(e) => handleChange('form8_signatory_name', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form8_signatory_name') === 'agent' ? 'bg-orange-50 border-orange-300' : ''
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
              value={formData.form8_signatory_designation || ''}
              onChange={(e) => handleChange('form8_signatory_designation', e.target.value)}
              className="input-field"
              placeholder="e.g., Registered Patent Agent, On behalf of Applicant"
              maxLength={100}
            />
          </div>

          {/* Patent Agent INPA */}
          <div>
            <label className="label">
              Patent Agent Registration Number (if applicable)
              <AutoFetchBadge source={getAutoFetchSource('form8_patent_agent_inpa')} />
            </label>
            <input
              type="text"
              value={formData.form8_patent_agent_inpa || ''}
              onChange={(e) => handleChange('form8_patent_agent_inpa', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form8_patent_agent_inpa') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="(IN/PA/XXX)"
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
                    onChange={(e) => handleFileUpload('form8_signature', e)}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                JPG, PNG, PDF up to 2MB
              </p>
              {formData.form8_signature_filename && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 ">
                  <p className="text-sm text-green-700">
                    ✅ Uploaded: {formData.form8_signature_filename}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="p-4 bg-pink-50 -lg border border-pink-200">
        <h4 className="text-sm font-medium text-pink-800 mb-2">Form 8 Important Guidelines:</h4>
        <ul className="text-xs text-pink-700 space-y-1">
          <li>• All fields are optional - fill only the information you have available</li>
          <li>• Request inventor names to be specifically shown in patent grant certificate</li>
          <li>• Inventor details auto-populate from Forms 1/5 if available</li>
          <li>• Supporting statement should explain circumstances and benefits to inventors</li>
          <li>• If adding new inventors, NOC from existing inventors is required</li>
          <li>• Revised Forms 1 and 5 should update ONLY inventor details</li>
          <li>• Service address auto-fills from Form 1 if same agent is handling</li>
        </ul>
      </div>
    </div>
  )
}

export default Form8InventorMention
