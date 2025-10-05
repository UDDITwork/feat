import React, { useEffect, useState } from 'react'
import { useForm } from '../../contexts/FormContext'
import { PlusIcon, TrashIcon, UploadIcon } from '@heroicons/react/24/outline'

const Form5Declaration = ({
  formData,
  setFieldValue,
  setNestedFieldValue,
  setArrayFieldValue,
  addArrayItem,
  removeArrayItem
}) => {
  const { errors } = useForm()
  const [autoFetchedFields, setAutoFetchedFields] = useState({})
  const [inventorSource, setInventorSource] = useState('') // 'applicants', 'inventors', or 'none'

  // Auto-fetch data from Form 2 and Form 1 on component mount
  useEffect(() => {
    const autoFetchFromPreviousForms = () => {
      const fetched = {}

      // PRIORITY CHAIN: Form 2 → Form 1

      // Section 1: Applicant Name - AUTO-FETCH
      // Try Form 2 first, then Form 1
      if (!formData.form5_applicant_name) {
        if (formData.form2_applicant_name) {
          setFieldValue('form5_applicant_name', formData.form2_applicant_name)
          fetched.form5_applicant_name = 'form2'
        } else if (formData.applicants?.[0]?.name_full) {
          setFieldValue('form5_applicant_name', formData.applicants[0].name_full)
          fetched.form5_applicant_name = 'form1'
        }
      }

      // Section 1: Applicant Address - AUTO-FETCH
      if (!formData.form5_applicant_address) {
        if (formData.form2_applicant_address) {
          setFieldValue('form5_applicant_address', formData.form2_applicant_address)
          fetched.form5_applicant_address = 'form2'
        } else if (formData.applicants?.[0]?.address) {
          // Concatenate from Form 1
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
            setFieldValue('form5_applicant_address', addressParts.join('\n'))
            fetched.form5_applicant_address = 'form1'
          }
        }
      }

      // Application Number - AUTO-FETCH (System generated or from Form 1)
      if (!formData.form5_application_number) {
        const appNumber = formData.applicationNo || formData.application_number || ''
        if (appNumber) {
          setFieldValue('form5_application_number', appNumber)
          fetched.form5_application_number = 'form1'
        }
      }

      // Filing Date - AUTO-FETCH from Form 1
      if (!formData.form5_filing_date) {
        const filingDate = formData.filingDate || formData.submission_date || ''
        if (filingDate) {
          setFieldValue('form5_filing_date', filingDate)
          fetched.form5_filing_date = 'form1'
        }
      }

      // Inventors - CONDITIONAL AUTO-FETCH (3 Scenarios)
      if (!formData.form5_inventors || formData.form5_inventors.length === 0) {
        let inventorsList = []
        let source = 'none'

        // Scenario 1: Inventors same as applicants
        if (formData.inventors_same_as_applicants === 'yes') {
          inventorsList = (formData.applicants || []).map(applicant => ({
            name: applicant.name_full || '',
            nationality: applicant.nationality || '',
            address: applicant.address ? formatAddress(applicant.address) : ''
          }))
          source = 'applicants'
        }
        // Scenario 2: Separate inventors in Form 1
        else if (formData.inventors && formData.inventors.length > 0) {
          inventorsList = formData.inventors.map(inventor => ({
            name: inventor.name_full || '',
            nationality: inventor.nationality || '',
            address: inventor.address || ''
          }))
          source = 'inventors'
        }
        // Scenario 3: No data - load single blank row
        else {
          inventorsList = [{ name: '', nationality: '', address: '' }]
          source = 'none'
        }

        if (inventorsList.length > 0) {
          setFieldValue('form5_inventors', inventorsList)
          setInventorSource(source)
          fetched.form5_inventors = source
        }
      }

      // Signatory Details - CONDITIONAL AUTO-FETCH
      if (!formData.form5_signatory_name) {
        // Check if patent agent exists
        if (formData.patent_agent?.name) {
          setFieldValue('form5_signatory_name', formData.patent_agent.name)
          setFieldValue('form5_signatory_designation', 'Registered Patent Agent')
          if (formData.patent_agent.inpa_no) {
            setFieldValue('form5_patent_agent_inpa', `(IN/PA/${formData.patent_agent.inpa_no})`)
          }
          fetched.form5_signatory_name = 'agent'
        } else if (formData.applicants?.[0]?.name_full) {
          setFieldValue('form5_signatory_name', formData.applicants[0].name_full)
          setFieldValue('form5_signatory_designation', 'Applicant')
          fetched.form5_signatory_name = 'applicant'
        }
      }

      // Declaration Date - DEFAULT to current date
      if (!formData.form5_declaration_date) {
        const today = new Date().toISOString().split('T')[0]
        setFieldValue('form5_declaration_date', today)
        fetched.form5_declaration_date = 'default'
      }

      setAutoFetchedFields(fetched)
    }

    autoFetchFromPreviousForms()
  }, [])

  const formatAddress = (address) => {
    if (!address) return ''
    const parts = [
      address.house_no,
      address.village,
      address.post_office ? `P.O. ${address.post_office}` : '',
      address.street,
      [address.city, address.state, address.pin_code].filter(Boolean).join(', '),
      address.country
    ].filter(Boolean)
    return parts.join('\n')
  }

  const handleChange = (field, value) => {
    setFieldValue(field, value)
  }

  const handleInventorChange = (index, field, value) => {
    setArrayFieldValue('form5_inventors', index, field, value)
  }

  const addInventor = () => {
    addArrayItem('form5_inventors', { name: '', nationality: '', address: '' })
  }

  const removeInventor = (index) => {
    const inventors = formData.form5_inventors || []
    if (inventors.length > 1) {
      removeArrayItem('form5_inventors', index)
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB')
        return
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        alert('Only JPG, PNG, and PDF files are allowed')
        return
      }

      // Store file (in real app, would upload to server)
      setFieldValue('form5_signature_file', file)
      setFieldValue('form5_signature_filename', file.name)
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
      form2: { color: 'blue', text: '🔄 From Form 2' },
      form1: { color: 'green', text: '🔄 From Form 1' },
      applicants: { color: 'purple', text: '✅ From Applicants' },
      inventors: { color: 'indigo', text: '✅ From Inventors' },
      agent: { color: 'orange', text: '👤 Patent Agent' },
      applicant: { color: 'teal', text: '👤 Applicant' },
      default: { color: 'gray', text: '📅 Current Date' }
    }

    const config = badgeConfig[source] || { color: 'gray', text: '📥 Auto' }

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium text-${config.color}-700 bg-${config.color}-100 rounded-md ml-2`}>
        {config.text}
      </span>
    )
  }

  const isConventionApplication = () => {
    return formData.application_type === 'convention' ||
           formData.application_type?.includes('convention')
  }

  const inventors = formData.form5_inventors || [{ name: '', nationality: '', address: '' }]

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Form 5: Declaration as to Inventorship
        </h2>
        <p className="text-sm text-gray-600 mb-1">
          Section 10(6) and Rule 13(6) of The Patents Act, 1970 & The Patents Rules, 2003
        </p>
        <p className="text-xs text-purple-700 mt-2">
          🔄 Fields auto-populated from Form 2 (blue) and Form 1 (green). All fields are optional.
        </p>
      </div>

      {/* Section 1: Applicant Details */}
      <div className="form-section">
        <h3 className="form-section-title">Section 1: Name of Applicant</h3>

        <div className="grid grid-cols-1 gap-6">
          {/* Applicant Name */}
          <div>
            <label className="label">
              Applicant Name
              <AutoFetchBadge source={getAutoFetchSource('form5_applicant_name')} />
            </label>
            <input
              type="text"
              value={formData.form5_applicant_name || ''}
              onChange={(e) => handleChange('form5_applicant_name', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form5_applicant_name') === 'form2' ? 'bg-blue-50 border-blue-300' :
                getAutoFetchSource('form5_applicant_name') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="Enter applicant name"
              maxLength={200}
            />
            {isFieldAutoFetched('form5_applicant_name') && (
              <p className="text-xs text-gray-600 mt-1">
                {getAutoFetchSource('form5_applicant_name') === 'form2'
                  ? '✅ Auto-populated from Form 2'
                  : '✅ Auto-populated from Form 1 Section 3A'}
              </p>
            )}
          </div>

          {/* Applicant Address */}
          <div>
            <label className="label">
              Applicant Address
              <AutoFetchBadge source={getAutoFetchSource('form5_applicant_address')} />
            </label>
            <textarea
              value={formData.form5_applicant_address || ''}
              onChange={(e) => handleChange('form5_applicant_address', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form5_applicant_address') === 'form2' ? 'bg-blue-50 border-blue-300' :
                getAutoFetchSource('form5_applicant_address') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              rows={4}
              placeholder="Enter complete address"
              maxLength={500}
            />
            {isFieldAutoFetched('form5_applicant_address') && (
              <p className="text-xs text-gray-600 mt-1">
                {getAutoFetchSource('form5_applicant_address') === 'form2'
                  ? '✅ Auto-populated from Form 2'
                  : '✅ Auto-populated from Form 1 Section 3A (concatenated)'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Declaration Text with Auto-Filled Variables */}
      <div className="form-section bg-gray-50 border border-gray-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Declaration Statement</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          {/* Application Number - Read-only */}
          <div>
            <label className="label">
              Application Number
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-md ml-2">
                🔒 Read-only
              </span>
            </label>
            <input
              type="text"
              value={formData.form5_application_number || ''}
              className="input-field bg-gray-100 cursor-not-allowed"
              readOnly
              placeholder="Auto-generated"
            />
            <p className="text-xs text-gray-500 mt-1">
              Auto-fetched from Form 1 / System
            </p>
          </div>

          {/* Filing Date - Read-only */}
          <div>
            <label className="label">
              Application Filing Date
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-md ml-2">
                🔒 Read-only
              </span>
            </label>
            <input
              type="date"
              value={formData.form5_filing_date ? new Date(formData.form5_filing_date).toISOString().split('T')[0] : ''}
              className="input-field bg-gray-100 cursor-not-allowed"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">
              Auto-fetched from Form 1 submission date
            </p>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-700 leading-relaxed">
            I/We hereby declare that the true and first inventor(s) of the invention disclosed
            in the complete specification filed in pursuance of our application numbered{' '}
            <span className="font-semibold text-blue-600">
              {formData.form5_application_number || '[Application Number]'}
            </span>{' '}
            dated{' '}
            <span className="font-semibold text-blue-600">
              {formData.form5_filing_date
                ? new Date(formData.form5_filing_date).toLocaleDateString('en-IN')
                : '[Filing Date]'}
            </span>{' '}
            is/are as mentioned below:
          </p>
        </div>
      </div>

      {/* Section 2: Inventor(s) Table */}
      <div className="form-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="form-section-title">
            Section 2: Inventor(s) Details
            {inventorSource && <AutoFetchBadge source={inventorSource} />}
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

        {inventorSource === 'applicants' && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              ✅ Inventors auto-populated from applicant details (Form 1 indicated inventors same as applicants)
            </p>
          </div>
        )}

        {inventorSource === 'inventors' && (
          <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <p className="text-sm text-indigo-800">
              ✅ Inventors auto-populated from Form 1 Section 4 inventor details
            </p>
          </div>
        )}

        {/* Inventor Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  S.No.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name of Inventor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nationality
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventors.map((inventor, index) => (
                <tr key={index} className={inventorSource !== 'none' ? 'bg-green-50' : ''}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={inventor.name || ''}
                      onChange={(e) => handleInventorChange(index, 'name', e.target.value)}
                      className="input-field"
                      placeholder="Inventor name"
                      maxLength={200}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={inventor.nationality || ''}
                      onChange={(e) => handleInventorChange(index, 'nationality', e.target.value)}
                      className="input-field"
                      placeholder="Nationality"
                      maxLength={100}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <textarea
                      value={inventor.address || ''}
                      onChange={(e) => handleInventorChange(index, 'address', e.target.value)}
                      className="input-field"
                      rows={2}
                      placeholder="Complete address"
                      maxLength={500}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {inventors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInventor(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Convention Declaration (Conditional) */}
      {isConventionApplication() && (
        <div className="form-section bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="form-section-title">Section 3: Declaration for Convention Country Application</h3>

          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ This section is displayed because your application type is "Convention"
            </p>
          </div>

          <div>
            <label className="label">
              Convention Declaration Statement
            </label>
            <textarea
              value={formData.form5_convention_declaration || ''}
              onChange={(e) => handleChange('form5_convention_declaration', e.target.value)}
              className="input-field"
              rows={5}
              placeholder="Enter declaration text for convention country application..."
              maxLength={1000}
            />
          </div>
        </div>
      )}

      {!isConventionApplication() && (
        <div className="form-section bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="form-section-title">Section 3: Declaration for Convention Country Application</h3>
          <div className="text-center py-4">
            <p className="text-gray-500 font-medium">NA</p>
            <p className="text-xs text-gray-400 mt-1">
              Not applicable - Application type is not Convention
            </p>
          </div>
        </div>
      )}

      {/* Section 4: Additional Inventors (Conditional) */}
      <div className="form-section bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="form-section-title">Section 4: Statement by Additional Inventors</h3>
        <div className="text-center py-4">
          <p className="text-gray-500 font-medium">NA</p>
          <p className="text-xs text-gray-400 mt-1">
            No additional inventors beyond those mentioned above
          </p>
        </div>
      </div>

      {/* Section 5: Signature Section */}
      <div className="form-section">
        <h3 className="form-section-title">Section 5: Signature and Declaration</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Declaration Date */}
          <div>
            <label className="label">
              Declaration Date
              <AutoFetchBadge source={getAutoFetchSource('form5_declaration_date')} />
            </label>
            <input
              type="date"
              value={formData.form5_declaration_date || ''}
              onChange={(e) => handleChange('form5_declaration_date', e.target.value)}
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Default: Current date (can be modified)
            </p>
          </div>

          {/* Signatory Name */}
          <div>
            <label className="label">
              Signatory Name
              <AutoFetchBadge source={getAutoFetchSource('form5_signatory_name')} />
            </label>
            <input
              type="text"
              value={formData.form5_signatory_name || ''}
              onChange={(e) => handleChange('form5_signatory_name', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form5_signatory_name') === 'agent' ? 'bg-orange-50 border-orange-300' :
                getAutoFetchSource('form5_signatory_name') === 'applicant' ? 'bg-teal-50 border-teal-300' : ''
              }`}
              placeholder="Name of signatory"
              maxLength={200}
            />
            {isFieldAutoFetched('form5_signatory_name') && (
              <p className="text-xs text-gray-600 mt-1">
                {getAutoFetchSource('form5_signatory_name') === 'agent'
                  ? '✅ Auto-populated from Form 1 Patent Agent'
                  : '✅ Auto-populated from Form 1 Applicant'}
              </p>
            )}
          </div>

          {/* Signatory Designation */}
          <div>
            <label className="label">
              Designation
            </label>
            <input
              type="text"
              value={formData.form5_signatory_designation || ''}
              onChange={(e) => handleChange('form5_signatory_designation', e.target.value)}
              className="input-field"
              placeholder="e.g., Applicant, Registered Patent Agent"
              maxLength={100}
            />
          </div>

          {/* Patent Agent IN/PA Number (if applicable) */}
          {formData.form5_patent_agent_inpa && (
            <div>
              <label className="label">
                Patent Agent IN/PA Number
              </label>
              <input
                type="text"
                value={formData.form5_patent_agent_inpa || ''}
                className="input-field bg-gray-100"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">
                Auto-fetched from Form 1
              </p>
            </div>
          )}
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
                    onChange={handleFileUpload}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                JPG, PNG, PDF up to 2MB
              </p>
              {formData.form5_signature_filename && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-700">
                    ✅ Uploaded: {formData.form5_signature_filename}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Addressee Section */}
      <div className="form-section bg-gray-50 border border-gray-300 rounded-lg p-6">
        <h3 className="form-section-title">Addressee</h3>

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

          <div className="flex items-center">
            <label className="label w-40">Location:</label>
            <select
              value={formData.form5_patent_office_location || 'Delhi'}
              onChange={(e) => handleChange('form5_patent_office_location', e.target.value)}
              className="input-field"
            >
              <option value="Delhi">Delhi</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Kolkata">Kolkata</option>
              <option value="Chennai">Chennai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
        <h4 className="text-sm font-medium text-purple-800 mb-2">Form 5 Guidelines:</h4>
        <ul className="text-xs text-purple-700 space-y-1">
          <li>• All fields are optional - fill as much information as available</li>
          <li>• 🔄 Blue badges = Auto-fetched from Form 2</li>
          <li>• 🔄 Green badges = Auto-fetched from Form 1</li>
          <li>• 🔒 Read-only fields cannot be edited (Application Number, Filing Date)</li>
          <li>• Signature file must be uploaded (JPG, PNG, or PDF format)</li>
          <li>• Declaration date defaults to current date but can be modified</li>
        </ul>
      </div>
    </div>
  )
}

export default Form5Declaration
