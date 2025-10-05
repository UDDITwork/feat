import React, { useEffect, useState } from 'react'
import { useForm } from '../../contexts/FormContext'
import { UploadIcon } from '@heroicons/react/24/outline'

const Form7AOpposition = ({
  formData,
  setFieldValue,
  setNestedFieldValue,
  setArrayFieldValue,
  addArrayItem,
  removeArrayItem
}) => {
  const { errors } = useForm()
  const [autoFetchedFields, setAutoFetchedFields] = useState({})

  // Grounds of opposition under Section 25(1)
  const oppositionGrounds = [
    { id: 'a', label: '(a) Wrongful obtaining - The invention was wrongfully obtained from the opponent or from a person from whom the opponent derives title' },
    { id: 'b', label: '(b) Prior publication - The invention was published before the priority date in any document' },
    { id: 'c', label: '(c) Prior public knowledge/use - The invention was publicly known or publicly used in India before the priority date' },
    { id: 'd', label: '(d) Prior claiming - The invention was claimed in any claim of any other complete specification published on or after the priority date' },
    { id: 'e', label: '(e) Obvious and lacks inventive step - The invention is obvious and clearly does not involve any inventive step' },
    { id: 'f', label: '(f) Not an invention - The subject matter is not an invention within the meaning of the Act' },
    { id: 'g', label: '(g) Not useful - The invention is not useful' },
    { id: 'h', label: '(h) Insufficient disclosure - The complete specification does not sufficiently and clearly describe the invention' },
    { id: 'i', label: '(i) Non-disclosure of information - The applicant has failed to disclose information required under Section 8' },
    { id: 'j', label: '(j) Undertaking non-compliance - The applicant has not complied with the requirement under Section 8(1)' },
    { id: 'k', label: '(k) Non-patentable subject matter - The complete specification does not disclose or wrongly mentions the source or geographical origin of biological material' }
  ]

  // Patent Office locations
  const patentOfficeLocations = [
    { value: 'delhi', label: 'Delhi - Intellectual Property Office Building, Boudhik Sampada Bhawan, Plot No. 32, Sector 14, Dwarka, New Delhi - 110078' },
    { value: 'mumbai', label: 'Mumbai - Intellectual Property Office, Baudhik Sampada Bhavan, S. M. Road, Antop Hill, Mumbai - 400037' },
    { value: 'kolkata', label: 'Kolkata - Intellectual Property Office Building, CP-2 Sector V, Salt Lake City, Kolkata - 700091' },
    { value: 'chennai', label: 'Chennai - Intellectual Property Office Building, G.S.T. Road, Guindy, Chennai - 600032' }
  ]

  // Auto-fetch from previous forms (opportunistic - if same entity)
  useEffect(() => {
    const autoFetchFromPreviousForms = () => {
      const fetched = {}

      // TRY to auto-fetch opponent details from applicant details
      // (In case the same party is filing - unusual but possible)
      if (!formData.form7a_opponent_name) {
        if (formData.form2_applicant_name) {
          setFieldValue('form7a_opponent_name', formData.form2_applicant_name)
          fetched.form7a_opponent_name = 'form2'
        } else if (formData.applicants?.[0]?.name_full) {
          setFieldValue('form7a_opponent_name', formData.applicants[0].name_full)
          fetched.form7a_opponent_name = 'form1'
        }
      }

      if (!formData.form7a_opponent_address) {
        if (formData.form2_applicant_address) {
          setFieldValue('form7a_opponent_address', formData.form2_applicant_address)
          fetched.form7a_opponent_address = 'form2'
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
            setFieldValue('form7a_opponent_address', addressParts.join('\n'))
            fetched.form7a_opponent_address = 'form1'
          }
        }
      }

      // TRY to auto-fetch service address from Form 1
      if (!formData.form7a_service_address_name) {
        if (formData.patent_agent?.name) {
          setFieldValue('form7a_service_address_name', formData.patent_agent.name)
          fetched.form7a_service_address_name = 'agent'
        } else if (formData.service_address?.name) {
          setFieldValue('form7a_service_address_name', formData.service_address.name)
          fetched.form7a_service_address_name = 'form1'
        }
      }

      if (!formData.form7a_service_postal_address && formData.service_address?.postal_address) {
        setFieldValue('form7a_service_postal_address', formData.service_address.postal_address)
        fetched.form7a_service_postal_address = 'form1'
      }

      if (!formData.form7a_service_email && formData.service_address?.email_id) {
        setFieldValue('form7a_service_email', formData.service_address.email_id)
        fetched.form7a_service_email = 'form1'
      }

      if (!formData.form7a_service_telephone && formData.service_address?.telephone_no) {
        setFieldValue('form7a_service_telephone', formData.service_address.telephone_no)
        fetched.form7a_service_telephone = 'form1'
      }

      if (!formData.form7a_service_fax && formData.service_address?.fax_no) {
        setFieldValue('form7a_service_fax', formData.service_address.fax_no)
        fetched.form7a_service_fax = 'form1'
      }

      // TRY to auto-fetch signatory from Form 5
      if (!formData.form7a_signatory_name) {
        if (formData.form5_signatory_name) {
          setFieldValue('form7a_signatory_name', formData.form5_signatory_name)
          fetched.form7a_signatory_name = 'form5'
        }
      }

      if (!formData.form7a_signatory_capacity && formData.form5_signatory_designation) {
        setFieldValue('form7a_signatory_capacity', formData.form5_signatory_designation)
        fetched.form7a_signatory_capacity = 'form5'
      }

      if (!formData.form7a_patent_agent_registration && formData.patent_agent?.inpa_no) {
        setFieldValue('form7a_patent_agent_registration', `(IN/PA/${formData.patent_agent.inpa_no})`)
        fetched.form7a_patent_agent_registration = 'form1'
      }

      // Default filing date to today
      if (!formData.form7a_opposition_filing_date) {
        const today = new Date().toISOString().split('T')[0]
        setFieldValue('form7a_opposition_filing_date', today)
        fetched.form7a_opposition_filing_date = 'default'
      }

      setAutoFetchedFields(fetched)
    }

    autoFetchFromPreviousForms()
  }, [])

  const handleChange = (field, value) => {
    setFieldValue(field, value)
  }

  const handleGroundToggle = (groundId) => {
    const currentGrounds = formData.form7a_grounds_of_opposition || []
    const newGrounds = currentGrounds.includes(groundId)
      ? currentGrounds.filter(id => id !== groundId)
      : [...currentGrounds, groundId]
    setFieldValue('form7a_grounds_of_opposition', newGrounds)
  }

  const handleFileUpload = (field, event) => {
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

  const selectedGrounds = formData.form7a_grounds_of_opposition || []

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Form 7A: Representation for Opposition to Grant of Patent
        </h2>
        <p className="text-sm text-gray-600 mb-1">
          Rule 55 of The Patents Act, 1970 & The Patents Rules, 2003
        </p>
        <p className="text-xs text-red-700 mt-2">
          ⚠️ Pre-Grant Opposition Form - Filed by third party to oppose grant of patent
        </p>
        <p className="text-xs text-gray-600 mt-1">
          All fields are optional. Some fields may auto-populate if you're using the same party details.
        </p>
      </div>

      {/* Section 1: Opponent Details */}
      <div className="form-section">
        <h3 className="form-section-title">Section 1: Opponent Details</h3>

        <p className="text-sm text-gray-600 mb-4">
          Enter details of the person or organization filing this opposition. All fields are optional.
        </p>

        <div className="grid grid-cols-1 gap-6">
          {/* Opponent Name */}
          <div>
            <label className="label">
              Name of Opponent (Individual/Company/Organization)
              <AutoFetchBadge source={getAutoFetchSource('form7a_opponent_name')} />
            </label>
            <input
              type="text"
              value={formData.form7a_opponent_name || ''}
              onChange={(e) => handleChange('form7a_opponent_name', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form7a_opponent_name') === 'form2' ? 'bg-blue-50 border-blue-300' :
                getAutoFetchSource('form7a_opponent_name') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="Enter full legal name of opponent"
              maxLength={300}
            />
            {isFieldAutoFetched('form7a_opponent_name') && (
              <p className="text-xs text-gray-600 mt-1">
                ℹ️ Auto-populated from previous forms. Edit if this is a different party.
              </p>
            )}
          </div>

          {/* Opponent Address */}
          <div>
            <label className="label">
              Complete Address of Opponent
              <AutoFetchBadge source={getAutoFetchSource('form7a_opponent_address')} />
            </label>
            <textarea
              value={formData.form7a_opponent_address || ''}
              onChange={(e) => handleChange('form7a_opponent_address', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form7a_opponent_address') === 'form2' ? 'bg-blue-50 border-blue-300' :
                getAutoFetchSource('form7a_opponent_address') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              rows={4}
              placeholder="Enter complete postal address including building, street, city, state, country, PIN code"
              maxLength={500}
            />
            {isFieldAutoFetched('form7a_opponent_address') && (
              <p className="text-xs text-gray-600 mt-1">
                ℹ️ Auto-populated from previous forms. Edit if this is a different address.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Patent Application Being Opposed */}
      <div className="form-section">
        <h3 className="form-section-title">Section 2: Details of Patent Application Being Opposed</h3>

        <p className="text-sm text-gray-600 mb-4">
          Enter details of the patent application you wish to oppose. All fields are optional.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patent Application Number */}
          <div>
            <label className="label">
              Patent Application Number
            </label>
            <input
              type="text"
              value={formData.form7a_opposed_application_number || ''}
              onChange={(e) => handleChange('form7a_opposed_application_number', e.target.value)}
              className="input-field"
              placeholder="e.g., 201731033800"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              Find this in the published patent application or Patent Office journal
            </p>
          </div>

          {/* Application Filing Date */}
          <div>
            <label className="label">
              Application Filing Date
            </label>
            <input
              type="date"
              value={formData.form7a_opposed_filing_date || ''}
              onChange={(e) => handleChange('form7a_opposed_filing_date', e.target.value)}
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Date when the opposed application was originally filed
            </p>
          </div>

          {/* Publication Date */}
          <div>
            <label className="label">
              Publication Date
            </label>
            <input
              type="date"
              value={formData.form7a_opposed_publication_date || ''}
              onChange={(e) => handleChange('form7a_opposed_publication_date', e.target.value)}
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Date when the application was published in the Patent Office Journal
            </p>
          </div>

          {/* Applicant Name (being opposed) */}
          <div>
            <label className="label">
              Name of Original Applicant
            </label>
            <input
              type="text"
              value={formData.form7a_opposed_applicant_name || ''}
              onChange={(e) => handleChange('form7a_opposed_applicant_name', e.target.value)}
              className="input-field"
              placeholder="Name as shown in published application"
              maxLength={300}
            />
            <p className="text-xs text-gray-500 mt-1">
              Name of the person/entity who filed the patent being opposed
            </p>
          </div>

          {/* Title of Invention */}
          <div className="md:col-span-2">
            <label className="label">
              Title of the Invention
            </label>
            <textarea
              value={formData.form7a_opposed_invention_title || ''}
              onChange={(e) => handleChange('form7a_opposed_invention_title', e.target.value)}
              className="input-field"
              rows={2}
              placeholder="Enter exact title as it appears in the published patent application"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              Copy the title word-for-word from the published application
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Grounds of Opposition */}
      <div className="form-section">
        <h3 className="form-section-title">Section 3: Grounds of Opposition (Section 25(1))</h3>

        <p className="text-sm text-gray-600 mb-4">
          Select all applicable grounds for opposition. All selections are optional - select as many as apply.
        </p>

        <div className="space-y-3">
          {oppositionGrounds.map(ground => (
            <label key={ground.id} className="flex items-start p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedGrounds.includes(ground.id)}
                onChange={() => handleGroundToggle(ground.id)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <span className="ml-3 text-sm text-gray-700">{ground.label}</span>
            </label>
          ))}
        </div>

        {selectedGrounds.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ✅ You have selected {selectedGrounds.length} ground(s): {selectedGrounds.map(g => g.toUpperCase()).join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Section 4: Address for Service in India */}
      <div className="form-section">
        <h3 className="form-section-title">Section 4: Address for Service in India</h3>

        <p className="text-sm text-gray-600 mb-4">
          Provide contact details for official communications. All fields are optional.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Person/Agent Name */}
          <div className="md:col-span-2">
            <label className="label">
              Name of Contact Person / Patent Agent
              <AutoFetchBadge source={getAutoFetchSource('form7a_service_address_name')} />
            </label>
            <input
              type="text"
              value={formData.form7a_service_address_name || ''}
              onChange={(e) => handleChange('form7a_service_address_name', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form7a_service_address_name') === 'agent' ? 'bg-orange-50 border-orange-300' :
                getAutoFetchSource('form7a_service_address_name') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="Name of person receiving communications"
              maxLength={200}
            />
          </div>

          {/* Designation */}
          <div>
            <label className="label">
              Designation / Title
            </label>
            <input
              type="text"
              value={formData.form7a_service_address_designation || ''}
              onChange={(e) => handleChange('form7a_service_address_designation', e.target.value)}
              className="input-field"
              placeholder="e.g., Advocate & Regd. Patent Agent"
              maxLength={100}
            />
          </div>

          {/* Firm Name */}
          <div>
            <label className="label">
              Firm / Organization Name
            </label>
            <input
              type="text"
              value={formData.form7a_service_address_firm || ''}
              onChange={(e) => handleChange('form7a_service_address_firm', e.target.value)}
              className="input-field"
              placeholder="Law firm or patent attorney firm"
              maxLength={200}
            />
          </div>

          {/* Postal Address */}
          <div className="md:col-span-2">
            <label className="label">
              Complete Postal Address
              <AutoFetchBadge source={getAutoFetchSource('form7a_service_postal_address')} />
            </label>
            <textarea
              value={formData.form7a_service_postal_address || ''}
              onChange={(e) => handleChange('form7a_service_postal_address', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form7a_service_postal_address') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              rows={4}
              placeholder="Complete address for service of documents"
              maxLength={500}
            />
          </div>

          {/* Telephone */}
          <div>
            <label className="label">
              Telephone Number(s)
              <AutoFetchBadge source={getAutoFetchSource('form7a_service_telephone')} />
            </label>
            <input
              type="tel"
              value={formData.form7a_service_telephone || ''}
              onChange={(e) => handleChange('form7a_service_telephone', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form7a_service_telephone') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="With country/area codes"
              maxLength={200}
            />
          </div>

          {/* Fax */}
          <div>
            <label className="label">
              Fax Number(s)
              <AutoFetchBadge source={getAutoFetchSource('form7a_service_fax')} />
            </label>
            <input
              type="tel"
              value={formData.form7a_service_fax || ''}
              onChange={(e) => handleChange('form7a_service_fax', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form7a_service_fax') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="Fax numbers (optional)"
              maxLength={100}
            />
          </div>

          {/* Email */}
          <div className="md:col-span-2">
            <label className="label">
              Email Address(es)
              <AutoFetchBadge source={getAutoFetchSource('form7a_service_email')} />
            </label>
            <input
              type="email"
              value={formData.form7a_service_email || ''}
              onChange={(e) => handleChange('form7a_service_email', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form7a_service_email') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="Email addresses (separate multiple with commas)"
              maxLength={200}
            />
          </div>
        </div>
      </div>

      {/* Section 5: Signature and Authorization */}
      <div className="form-section">
        <h3 className="form-section-title">Section 5: Signature and Authorization</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Signatory Name */}
          <div>
            <label className="label">
              Name of Signatory
              <AutoFetchBadge source={getAutoFetchSource('form7a_signatory_name')} />
            </label>
            <input
              type="text"
              value={formData.form7a_signatory_name || ''}
              onChange={(e) => handleChange('form7a_signatory_name', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form7a_signatory_name') === 'form5' ? 'bg-purple-50 border-purple-300' : ''
              }`}
              placeholder="Full name of person signing"
              maxLength={200}
            />
          </div>

          {/* Capacity */}
          <div>
            <label className="label">
              Capacity / Authorization
              <AutoFetchBadge source={getAutoFetchSource('form7a_signatory_capacity')} />
            </label>
            <input
              type="text"
              value={formData.form7a_signatory_capacity || ''}
              onChange={(e) => handleChange('form7a_signatory_capacity', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form7a_signatory_capacity') === 'form5' ? 'bg-purple-50 border-purple-300' : ''
              }`}
              placeholder="e.g., Agent for the Opponent, On behalf of..."
              maxLength={100}
            />
          </div>

          {/* Patent Agent Registration Number */}
          <div>
            <label className="label">
              Patent Agent Registration Number (if applicable)
              <AutoFetchBadge source={getAutoFetchSource('form7a_patent_agent_registration')} />
            </label>
            <input
              type="text"
              value={formData.form7a_patent_agent_registration || ''}
              onChange={(e) => handleChange('form7a_patent_agent_registration', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form7a_patent_agent_registration') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="(IN/PA/XXXX)"
              maxLength={20}
            />
          </div>

          {/* Filing Date */}
          <div>
            <label className="label">
              Date of Filing Opposition
              <AutoFetchBadge source={getAutoFetchSource('form7a_opposition_filing_date')} />
            </label>
            <input
              type="date"
              value={formData.form7a_opposition_filing_date || ''}
              onChange={(e) => handleChange('form7a_opposition_filing_date', e.target.value)}
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Default: Current date (can be modified)
            </p>
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
                    onChange={(e) => handleFileUpload('form7a_signature', e)}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                JPG, PNG, PDF up to 2MB
              </p>
              {formData.form7a_signature_filename && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-700">
                    ✅ Uploaded: {formData.form7a_signature_filename}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 6: Addressee */}
      <div className="form-section bg-gray-50 border border-gray-300 rounded-lg p-6">
        <h3 className="form-section-title">Section 6: Addressee</h3>

        <div className="space-y-3">
          <div className="flex items-center">
            <label className="label w-40">To:</label>
            <input
              type="text"
              value="The Controller of Patent"
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
            <label className="label">Patent Office Location & Address:</label>
            <select
              value={formData.form7a_patent_office_location || 'delhi'}
              onChange={(e) => handleChange('form7a_patent_office_location', e.target.value)}
              className="input-field mt-2"
            >
              {patentOfficeLocations.map(location => (
                <option key={location.value} value={location.value}>
                  {location.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select the Patent Office where the opposed application is being processed
            </p>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <h4 className="text-sm font-medium text-red-800 mb-2">Form 7A Important Notes:</h4>
        <ul className="text-xs text-red-700 space-y-1">
          <li>• All fields are optional - fill only the information you have available</li>
          <li>• Pre-grant opposition can be filed AFTER publication and BEFORE grant</li>
          <li>• You must verify the opposed application details from Patent Office records</li>
          <li>• Supporting documents (prior art, evidence) are highly recommended</li>
          <li>• Multiple grounds of opposition can be selected</li>
          <li>• Some fields auto-populate from previous forms if you're using same party details</li>
        </ul>
      </div>
    </div>
  )
}

export default Form7AOpposition
