import React, { useEffect, useState } from 'react'
import { useForm } from '../../contexts/FormContext'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

const Form26Authorization = ({
  formData,
  setFieldValue,
  setNestedFieldValue,
  setArrayFieldValue,
  addArrayItem,
  removeArrayItem
}) => {
  const { errors } = useForm()
  const [autoFetchedFields, setAutoFetchedFields] = useState({})

  const patentOfficeLocations = [
    { value: 'delhi', label: 'Delhi' },
    { value: 'mumbai', label: 'Mumbai' },
    { value: 'kolkata', label: 'Kolkata' },
    { value: 'chennai', label: 'Chennai' }
  ]

  // Auto-fetch from Forms 1, 2, 6
  useEffect(() => {
    const autoFetchFromPreviousForms = () => {
      const fetched = {}

      // Section 1: Principal Details - Priority: Form 6 → Form 2 → Form 1
      if (!formData.form26_principal_name) {
        if (formData.form6_new_applicant_name) {
          setFieldValue('form26_principal_name', formData.form6_new_applicant_name)
          fetched.form26_principal_name = 'form6'
        } else if (formData.form2_applicant_name) {
          setFieldValue('form26_principal_name', formData.form2_applicant_name)
          fetched.form26_principal_name = 'form2'
        } else if (formData.applicants?.[0]?.name_full) {
          setFieldValue('form26_principal_name', formData.applicants[0].name_full)
          fetched.form26_principal_name = 'form1'
        }
      }

      if (!formData.form26_principal_address) {
        if (formData.form6_new_applicant_address) {
          setFieldValue('form26_principal_address', formData.form6_new_applicant_address)
          fetched.form26_principal_address = 'form6'
        } else if (formData.form2_applicant_address) {
          setFieldValue('form26_principal_address', formData.form2_applicant_address)
          fetched.form26_principal_address = 'form2'
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
            setFieldValue('form26_principal_address', addressParts.join('\n'))
            fetched.form26_principal_address = 'form1'
          }
        }
      }

      // Section 2: Agent Details (conditional - from Form 1 if available)
      if (!formData.form26_agents || formData.form26_agents.length === 0) {
        if (formData.patent_agent?.name) {
          setFieldValue('form26_agents', [{
            name: formData.patent_agent.name,
            inpa_number: formData.patent_agent.inpa_no || ''
          }])
          fetched.form26_agents = 'form1'
        }
      }

      if (!formData.form26_agent_firm && formData.service_address?.name) {
        setFieldValue('form26_agent_firm', formData.service_address.name)
        fetched.form26_agent_firm = 'form1'
      }

      if (!formData.form26_agent_address && formData.service_address?.postal_address) {
        setFieldValue('form26_agent_address', formData.service_address.postal_address)
        fetched.form26_agent_address = 'form1'
      }

      // Section 3: Application Details
      if (!formData.form26_application_number && formData.application_number) {
        setFieldValue('form26_application_number', formData.application_number)
        fetched.form26_application_number = 'form1'
      }

      if (!formData.form26_invention_title && formData.invention_title) {
        setFieldValue('form26_invention_title', formData.invention_title)
        fetched.form26_invention_title = 'form1'
      }

      // Addressee
      if (!formData.form26_office_location && formData.patent_office_location) {
        setFieldValue('form26_office_location', formData.patent_office_location)
        fetched.form26_office_location = 'form1'
      }

      // Default current date
      if (!formData.form26_authorization_date) {
        const today = new Date().toISOString().split('T')[0]
        setFieldValue('form26_authorization_date', today)
        fetched.form26_authorization_date = 'default'
      }

      setAutoFetchedFields(fetched)
    }

    autoFetchFromPreviousForms()
  }, [])

  const handleChange = (field, value) => {
    setFieldValue(field, value)
  }

  const handleAgentChange = (index, field, value) => {
    setArrayFieldValue('form26_agents', index, field, value)
  }

  const addAgent = () => {
    addArrayItem('form26_agents', {
      name: '',
      inpa_number: ''
    })
  }

  const removeAgent = (index) => {
    removeArrayItem('form26_agents', index)
  }

  const handleFileUpload = (field, event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB')
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
      default: { color: 'gray', text: '📅 Current Date' }
    }

    const config = badgeConfig[source] || { color: 'gray', text: '📥 Auto' }

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium text-${config.color}-700 bg-${config.color}-100 rounded-md ml-2`}>
        {config.text}
      </span>
    )
  }

  const agents = formData.form26_agents || []

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Form 26: Authorization of Patent Agent
        </h2>
        <p className="text-sm text-gray-600 mb-1">
          Sections 127 and 132; Rule 135 of The Patents Act, 1970 & The Patents Rules, 2003
        </p>
        <p className="text-xs text-violet-700 mt-2">
          📋 Power of Attorney (POA) to authorize patent agent to represent in patent matters
        </p>
        <p className="text-xs text-gray-600 mt-1">
          All fields are optional. Principal and agent details will auto-populate from Form 1.
        </p>
      </div>

      {/* Section 1: PRINCIPAL DETAILS */}
      <div className="form-section">
        <h3 className="form-section-title">Section 1: Principal Details (Applicant/Patentee)</h3>

        <p className="text-sm text-gray-600 mb-4">
          Person/entity granting the authorization. Auto-populated from Form 6 → Form 2 → Form 1. All fields are optional.
        </p>

        <div className="grid grid-cols-1 gap-6">
          {/* Principal Name */}
          <div>
            <label className="label">
              Principal's Name
              <AutoFetchBadge source={getAutoFetchSource('form26_principal_name')} />
            </label>
            <input
              type="text"
              value={formData.form26_principal_name || ''}
              onChange={(e) => handleChange('form26_principal_name', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form26_principal_name') === 'form6' ? 'bg-purple-50 border-purple-300' :
                getAutoFetchSource('form26_principal_name') === 'form2' ? 'bg-blue-50 border-blue-300' :
                getAutoFetchSource('form26_principal_name') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="e.g., UJJAL NATH"
              maxLength={300}
            />
            {isFieldAutoFetched('form26_principal_name') && (
              <p className="text-xs text-gray-600 mt-1">
                ✅ Auto-populated (current applicant/patentee on record)
              </p>
            )}
          </div>

          {/* Principal Address */}
          <div>
            <label className="label">
              Principal's Address
              <AutoFetchBadge source={getAutoFetchSource('form26_principal_address')} />
            </label>
            <textarea
              value={formData.form26_principal_address || ''}
              onChange={(e) => handleChange('form26_principal_address', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form26_principal_address') === 'form6' ? 'bg-purple-50 border-purple-300' :
                getAutoFetchSource('form26_principal_address') === 'form2' ? 'bg-blue-50 border-blue-300' :
                getAutoFetchSource('form26_principal_address') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              rows={4}
              placeholder="S/O- Kulen Chandra Nath, vill- Joypur, P.O. Kharghuli, Guwahati, Assam, India -781004"
              maxLength={500}
            />
          </div>
        </div>
      </div>

      {/* Section 2: AUTHORIZED AGENT(S) DETAILS */}
      <div className="form-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="form-section-title">
            Section 2: Authorized Agent(s) Details
            {isFieldAutoFetched('form26_agents') && (
              <AutoFetchBadge source={getAutoFetchSource('form26_agents')} />
            )}
          </h3>
          <button
            type="button"
            onClick={addAgent}
            className="btn-primary flex items-center text-sm"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Agent
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Patent agent(s) being authorized. Auto-populated from Form 1 if available. All fields are optional.
        </p>

        {/* Authorization Mode */}
        <div className="mb-6">
          <label className="label">
            Authorization Mode
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="form26_authorization_mode"
                value="single"
                checked={formData.form26_authorization_mode === 'single'}
                onChange={(e) => handleChange('form26_authorization_mode', e.target.value)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Single Agent</span>
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                name="form26_authorization_mode"
                value="jointly"
                checked={formData.form26_authorization_mode === 'jointly'}
                onChange={(e) => handleChange('form26_authorization_mode', e.target.value)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Multiple Agents - Jointly (all must act together)</span>
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                name="form26_authorization_mode"
                value="severally"
                checked={formData.form26_authorization_mode === 'severally'}
                onChange={(e) => handleChange('form26_authorization_mode', e.target.value)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Multiple Agents - Severally (each can act independently)</span>
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                name="form26_authorization_mode"
                value="jointly_and_severally"
                checked={formData.form26_authorization_mode === 'jointly_and_severally'}
                onChange={(e) => handleChange('form26_authorization_mode', e.target.value)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">
                <strong>Multiple Agents - Jointly and Severally</strong> (can act together OR independently - Recommended)
              </span>
            </label>
          </div>
        </div>

        {/* Agent List */}
        {agents.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500 mb-4">No agents added yet</p>
            <button
              type="button"
              onClick={addAgent}
              className="btn-primary flex items-center mx-auto"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add First Agent
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {agents.map((agent, index) => (
              <div key={index} className={`border border-gray-200 rounded-lg p-4 ${isFieldAutoFetched('form26_agents') ? 'bg-green-50' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">Agent {index + 1}</h4>
                  {agents.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAgent(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label text-xs">Agent Name</label>
                    <input
                      type="text"
                      value={agent.name || ''}
                      onChange={(e) => handleAgentChange(index, 'name', e.target.value)}
                      className="input-field text-sm"
                      placeholder="e.g., Bikash Kumar Lohia"
                      maxLength={200}
                    />
                  </div>

                  <div>
                    <label className="label text-xs">IN/PA Registration Number</label>
                    <input
                      type="text"
                      value={agent.inpa_number || ''}
                      onChange={(e) => handleAgentChange(index, 'inpa_number', e.target.value)}
                      className="input-field text-sm"
                      placeholder="e.g., IN/PA-4445"
                      maxLength={20}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isFieldAutoFetched('form26_agents') && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-700">
              ✅ Agent details auto-populated from Form 1. You can edit or add more agents.
            </p>
          </div>
        )}

        {/* Firm Details */}
        <div className="grid grid-cols-1 gap-4 mt-6">
          <div>
            <label className="label">
              Firm / Organization Name
              <AutoFetchBadge source={getAutoFetchSource('form26_agent_firm')} />
            </label>
            <input
              type="text"
              value={formData.form26_agent_firm || ''}
              onChange={(e) => handleChange('form26_agent_firm', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form26_agent_firm') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="e.g., SITABIENCE IP PVT LTD."
              maxLength={200}
            />
          </div>

          <div>
            <label className="label">
              Agent/Firm Address
              <AutoFetchBadge source={getAutoFetchSource('form26_agent_address')} />
            </label>
            <textarea
              value={formData.form26_agent_address || ''}
              onChange={(e) => handleChange('form26_agent_address', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form26_agent_address') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              rows={3}
              placeholder="A Block, Sector 58, Noida, Uttar Pradesh 201307"
              maxLength={500}
            />
          </div>
        </div>
      </div>

      {/* Section 3: SCOPE OF AUTHORIZATION */}
      <div className="form-section">
        <h3 className="form-section-title">Section 3: Scope of Authorization</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Application Number */}
          <div>
            <label className="label">
              Patent Application/Patent Number
              <AutoFetchBadge source={getAutoFetchSource('form26_application_number')} />
            </label>
            <input
              type="text"
              value={formData.form26_application_number || ''}
              onChange={(e) => handleChange('form26_application_number', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form26_application_number') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="Leave blank for general authorization"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank for authorization covering all current and future applications
            </p>
          </div>

          {/* Invention Title */}
          <div>
            <label className="label">
              Title of Invention
              <AutoFetchBadge source={getAutoFetchSource('form26_invention_title')} />
            </label>
            <input
              type="text"
              value={formData.form26_invention_title || ''}
              onChange={(e) => handleChange('form26_invention_title', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form26_invention_title') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="Title from Form 1"
              maxLength={500}
            />
          </div>
        </div>

        {/* Comprehensive Powers */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-3">Comprehensive Authorization Powers:</h4>
          <div className="text-xs text-blue-800 space-y-1">
            <p>✅ Securing Letters Patent from Government of India</p>
            <p>✅ All matters and proceedings before Controller of Patents</p>
            <p>✅ Post-grant matters (renewal, working statements)</p>
            <p>✅ Amendments to patent/application/specification</p>
            <p>✅ Restoration of lapsed patent or abandoned application</p>
            <p>✅ Registration of license, mortgage, assignment, transfer</p>
            <p>✅ Change in applicant/patentee name, address, service address</p>
            <p>✅ Opposition proceedings (pre-grant and post-grant)</p>
            <p>✅ Appointment of substitute agent(s) if needed</p>
            <p>✅ All acts deemed necessary or expedient by agent(s)</p>
          </div>
        </div>

        {/* Communication Request */}
        <div className="mt-4 p-3 bg-gray-50 border border-gray-300 rounded-lg">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.form26_communication_to_agent || false}
              onChange={(e) => setFieldValue('form26_communication_to_agent', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Request that all notices, requisitions and communications be sent to the agent(s) at the above address
            </span>
          </label>
        </div>
      </div>

      {/* Section 4: DATE AND SIGNATURE */}
      <div className="form-section">
        <h3 className="form-section-title">Section 4: Date and Principal's Signature</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Authorization Date */}
          <div>
            <label className="label">
              Date of Authorization
              <AutoFetchBadge source={getAutoFetchSource('form26_authorization_date')} />
            </label>
            <input
              type="date"
              value={formData.form26_authorization_date || ''}
              onChange={(e) => handleChange('form26_authorization_date', e.target.value)}
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: "Dated this [day] Day of [Month], [Year]"
            </p>
          </div>

          {/* Principal Name (for signature) */}
          <div>
            <label className="label">
              Principal's Name (for signature)
              <AutoFetchBadge source={getAutoFetchSource('form26_principal_name')} />
            </label>
            <input
              type="text"
              value={formData.form26_principal_name || ''}
              onChange={(e) => handleChange('form26_principal_name', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form26_principal_name') ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="Name as it appears above"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              Should match the principal name entered above
            </p>
          </div>
        </div>

        {/* Principal Signature Upload */}
        <div className="mt-6">
          <label className="label">
            Principal's Signature Upload
          </label>
          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
            <div className="space-y-2 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                  <span>Upload signature</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileUpload('form26_principal_signature', e)}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                JPG, PNG, PDF up to 2MB
              </p>
              <p className="text-xs text-red-600 font-medium">
                ⚠️ PRINCIPAL must sign (not the agent being authorized)
              </p>
              {formData.form26_principal_signature_filename && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-700">
                    ✅ Uploaded: {formData.form26_principal_signature_filename}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Company Signatory Details (if applicable) */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800 mb-2">
            <strong>For Companies/Organizations:</strong>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label text-xs">Authorized Signatory Name</label>
              <input
                type="text"
                value={formData.form26_company_signatory_name || ''}
                onChange={(e) => handleChange('form26_company_signatory_name', e.target.value)}
                className="input-field text-sm"
                placeholder="e.g., John Smith"
                maxLength={200}
              />
            </div>
            <div>
              <label className="label text-xs">Designation</label>
              <input
                type="text"
                value={formData.form26_company_signatory_designation || ''}
                onChange={(e) => handleChange('form26_company_signatory_designation', e.target.value)}
                className="input-field text-sm"
                placeholder="e.g., Director, CEO"
                maxLength={100}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: ADDRESSEE */}
      <div className="form-section bg-gray-50 border border-gray-300 rounded-lg p-6">
        <h3 className="form-section-title">Section 5: Addressee</h3>

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
              <AutoFetchBadge source={getAutoFetchSource('form26_office_location')} />
            </label>
            <select
              value={formData.form26_office_location || 'delhi'}
              onChange={(e) => handleChange('form26_office_location', e.target.value)}
              className={`input-field mt-2 ${
                getAutoFetchSource('form26_office_location') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
            >
              {patentOfficeLocations.map(location => (
                <option key={location.value} value={location.value}>
                  {location.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="p-4 bg-violet-50 rounded-lg border border-violet-200">
        <h4 className="text-sm font-medium text-violet-800 mb-2">Form 26 Important Guidelines:</h4>
        <ul className="text-xs text-violet-700 space-y-1">
          <li>• All fields are optional - fill only the information you have available</li>
          <li>• Power of Attorney (POA) authorizes patent agent to represent in all patent matters</li>
          <li>• Principal details auto-populate from Form 6 → Form 2 → Form 1</li>
          <li>• Agent details auto-populate from Form 1 if available</li>
          <li>• <strong>Jointly and Severally</strong> is most flexible - any agent can act alone OR together</li>
          <li>• Leave application number blank for general authorization (all current & future applications)</li>
          <li>• <strong>PRINCIPAL must sign</strong> (not the agent being authorized)</li>
          <li>• For companies: authorized signatory must sign with board resolution</li>
        </ul>
      </div>
    </div>
  )
}

export default Form26Authorization
