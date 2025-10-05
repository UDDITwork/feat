import React, { useState, useEffect } from 'react'
import { useForm } from '../../contexts/FormContext'
import {
  DocumentTextIcon,
  UserIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  RocketLaunchIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const Form28EntityDeclaration = () => {
  const { formData, setFieldValue, setArrayFieldValue, addArrayItem, removeArrayItem } = useForm()
  const [autoFetched, setAutoFetched] = useState({})
  const [declarationStatement, setDeclarationStatement] = useState('')

  // Auto-fetch on component mount
  useEffect(() => {
    const fetched = {}

    // Section 1: Applicant Details - Priority: Form 2 → Form 1
    if (!formData.form28_applicant_name) {
      if (formData.form2_applicant_name) {
        setFieldValue('form28_applicant_name', formData.form2_applicant_name)
        fetched.form28_applicant_name = 'form2'
      } else if (formData.applicants?.[0]?.name_full) {
        setFieldValue('form28_applicant_name', formData.applicants[0].name_full)
        fetched.form28_applicant_name = 'form1'
      }
    }

    if (!formData.form28_applicant_address) {
      if (formData.form2_applicant_address) {
        setFieldValue('form28_applicant_address', formData.form2_applicant_address)
        fetched.form28_applicant_address = 'form2'
      } else if (formData.applicants?.[0]?.address) {
        const addr = formData.applicants[0].address
        const fullAddress = [addr.street, addr.city, addr.state, addr.pincode, addr.country]
          .filter(Boolean)
          .join(', ')
        setFieldValue('form28_applicant_address', fullAddress)
        fetched.form28_applicant_address = 'form1'
      }
    }

    // Section 2: Application Details - from Form 1
    if (!formData.form28_application_number && formData.application_number) {
      setFieldValue('form28_application_number', formData.application_number)
      fetched.form28_application_number = 'form1'
    }

    if (!formData.form28_filing_date && formData.filing_date) {
      setFieldValue('form28_filing_date', formData.filing_date)
      fetched.form28_filing_date = 'form1'
    }

    if (!formData.form28_invention_title && formData.invention_title) {
      setFieldValue('form28_invention_title', formData.invention_title)
      fetched.form28_invention_title = 'form1'
    }

    // Section 4: Date - Current date
    if (!formData.form28_date) {
      const today = new Date().toISOString().split('T')[0]
      setFieldValue('form28_date', today)
      fetched.form28_date = 'default'
    }

    // Section 5: Signatory Details - from Form 1 (agent)
    if (!formData.form28_signatory_name && formData.patent_agent?.name) {
      setFieldValue('form28_signatory_name', formData.patent_agent.name)
      fetched.form28_signatory_name = 'agent'
    }

    if (!formData.form28_signatory_address && formData.patent_agent?.address) {
      setFieldValue('form28_signatory_address', formData.patent_agent.address)
      fetched.form28_signatory_address = 'agent'
    }

    // Section 6: Addressee - from Form 1
    if (!formData.form28_office_location && formData.office_location) {
      setFieldValue('form28_office_location', formData.office_location)
      fetched.form28_office_location = 'form1'
    }

    setAutoFetched(fetched)
  }, [])

  // Auto-generate declaration statement based on entity type
  useEffect(() => {
    const generateDeclaration = () => {
      const applicantName = formData.form28_applicant_name || '[APPLICANT NAME]'
      const entityType = formData.form28_entity_type

      if (!entityType) {
        setDeclarationStatement('')
        return
      }

      let statement = ''

      if (entityType === 'small_entity') {
        statement = `I/We, ${applicantName}, hereby declare that I am/we are a "small entity" as defined under Rule 2(fa) of the Patents Rules, 2003. I/We undertake to file a declaration to the effect that I/we continue to be a "small entity" at the time of filing each document filed subsequent to the grant of the patent wherein a fee is to be paid.`
      } else if (entityType === 'startup') {
        statement = `I/We, ${applicantName}, hereby declare that I am/we are a "start-up" as defined under Rule 2(fb) of the Patents Rules, 2003 and certified by the Department for Promotion of Industry and Internal Trade (DPIIT). I/We undertake to file a declaration to the effect that I/we continue to be a "start-up" at the time of filing each document filed subsequent to the grant of the patent wherein a fee is to be paid.`
      } else if (entityType === 'educational') {
        statement = `I/We, ${applicantName}, hereby declare that I am/we are an "educational institution" as defined under Rule 2(ca) of the Patents Rules, 2003, which is established by an Act of Parliament or State Legislature, or such other institutions imparting technical and higher education which are recognized by law for the time being in force. I/We undertake to file a declaration to the effect that I/we continue to be an "educational institution" at the time of filing each document filed subsequent to the grant of the patent wherein a fee is to be paid.`
      }

      setDeclarationStatement(statement)
    }

    generateDeclaration()
  }, [formData.form28_entity_type, formData.form28_applicant_name])

  // Auto-fetch badge component
  const AutoFetchBadge = ({ source }) => {
    if (!source) return null

    const badgeConfig = {
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

  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (max 10MB for documents)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size should not exceed 10MB')
        e.target.value = ''
        return
      }

      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        alert('Only PDF, JPG, PNG, DOC, and DOCX files are allowed')
        e.target.value = ''
        return
      }

      setFieldValue(fieldName, file)
    }
  }

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (max 2MB for signature)
      if (file.size > 2 * 1024 * 1024) {
        alert('Signature file size should not exceed 2MB')
        e.target.value = ''
        return
      }

      // Check file type (images only for signature)
      const allowedTypes = ['image/jpeg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        alert('Only JPG and PNG files are allowed for signature')
        e.target.value = ''
        return
      }

      setFieldValue('form28_signature', file)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="mb-8 border-b pb-6">
        <div className="flex items-center gap-3 mb-4">
          <DocumentTextIcon className="h-10 w-10 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Form 28</h1>
            <p className="text-lg text-gray-600 mt-1">
              Declaration under Rule 2(ca)/2(fa)/2(fb)
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <div className="flex">
            <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">About This Form</h3>
              <p className="text-sm text-blue-700 mt-1">
                This form is used to declare the status as a small entity, start-up, or educational institution
                to avail reduced patent fees (80% reduction for start-ups, applicable reductions for others).
                All fields are <strong>OPTIONAL</strong> and can be edited.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Applicant/Declarant Details */}
      <div className="mb-8 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <UserIcon className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            1. Applicant/Declarant Details
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name of Applicant/Declarant
              <AutoFetchBadge source={autoFetched.form28_applicant_name} />
            </label>
            <input
              type="text"
              value={formData.form28_applicant_name || ''}
              onChange={(e) => setFieldValue('form28_applicant_name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter full name of applicant/entity"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complete Address
              <AutoFetchBadge source={autoFetched.form28_applicant_address} />
            </label>
            <textarea
              value={formData.form28_applicant_address || ''}
              onChange={(e) => setFieldValue('form28_applicant_address', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Street, City, State, PIN Code, Country"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Application Details */}
      <div className="mb-8 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            2. Application Details
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application Number
              <AutoFetchBadge source={autoFetched.form28_application_number} />
            </label>
            <input
              type="text"
              value={formData.form28_application_number || ''}
              onChange={(e) => setFieldValue('form28_application_number', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., 202311012345"
            />
            <p className="text-xs text-gray-500 mt-1">Leave blank if filing with Form 1</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filing Date
              <AutoFetchBadge source={autoFetched.form28_filing_date} />
            </label>
            <input
              type="date"
              value={formData.form28_filing_date || ''}
              onChange={(e) => setFieldValue('form28_filing_date', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title of Invention
            <AutoFetchBadge source={autoFetched.form28_invention_title} />
          </label>
          <input
            type="text"
            value={formData.form28_invention_title || ''}
            onChange={(e) => setFieldValue('form28_invention_title', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter the title of the invention"
          />
        </div>
      </div>

      {/* Section 3: Entity Type Selection */}
      <div className="mb-8 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <BuildingOfficeIcon className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            3. Entity Type Declaration
          </h2>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Select the entity type you wish to declare (this determines fee reduction benefits):
          </p>

          <div className="space-y-3">
            {/* Small Entity */}
            <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="form28_entity_type"
                value="small_entity"
                checked={formData.form28_entity_type === 'small_entity'}
                onChange={(e) => setFieldValue('form28_entity_type', e.target.value)}
                className="mt-1 mr-3 h-4 w-4 text-indigo-600"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900">Small Entity</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Rule 2(fa)</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Natural person(s), start-up(s) (other than those certified by DPIIT), or educational institution(s).
                  Applicable fee reductions apply.
                </p>
              </div>
            </label>

            {/* Start-up */}
            <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="form28_entity_type"
                value="startup"
                checked={formData.form28_entity_type === 'startup'}
                onChange={(e) => setFieldValue('form28_entity_type', e.target.value)}
                className="mt-1 mr-3 h-4 w-4 text-indigo-600"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <RocketLaunchIcon className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-gray-900">Start-up</span>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Rule 2(fb)</span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-semibold">80% Fee Reduction</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Start-up certified by the Department for Promotion of Industry and Internal Trade (DPIIT).
                  <strong> Requires DPIIT recognition certificate.</strong>
                </p>
              </div>
            </label>

            {/* Educational Institution */}
            <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="form28_entity_type"
                value="educational"
                checked={formData.form28_entity_type === 'educational'}
                onChange={(e) => setFieldValue('form28_entity_type', e.target.value)}
                className="mt-1 mr-3 h-4 w-4 text-indigo-600"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <AcademicCapIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Educational Institution</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Rule 2(ca)</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Institution established by Act of Parliament/State Legislature, or recognized technical/higher education institution.
                  Applicable fee reductions apply.
                </p>
              </div>
            </label>
          </div>

          {/* Auto-generated Declaration Statement */}
          {declarationStatement && (
            <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-indigo-600" />
                Generated Declaration Statement:
              </h4>
              <div className="bg-white p-4 rounded border border-indigo-100">
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {declarationStatement}
                </p>
              </div>
              <p className="text-xs text-indigo-700 mt-2">
                ✨ This statement is auto-generated based on your entity type selection
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Section 4: Supporting Documents */}
      <div className="mb-8 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            4. Supporting Documents
          </h2>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-2">
              <ExclamationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-yellow-900">Required Documents by Entity Type:</h4>
                <ul className="text-sm text-yellow-800 mt-2 space-y-1 ml-4 list-disc">
                  <li><strong>Start-up:</strong> DPIIT Recognition Certificate (mandatory)</li>
                  <li><strong>Educational Institution:</strong> Certificate of establishment/recognition</li>
                  <li><strong>Small Entity:</strong> Supporting evidence if applicable</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description of Supporting Documents
            </label>
            <textarea
              value={formData.form28_supporting_docs_description || ''}
              onChange={(e) => setFieldValue('form28_supporting_docs_description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Describe the supporting documents you are attaching (e.g., 'DPIIT Recognition Certificate dated 15/01/2023, Certificate No. DIPP12345')"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Supporting Document(s)
            </label>
            <input
              type="file"
              onChange={(e) => handleFileUpload(e, 'form28_supporting_documents')}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              PDF, JPG, PNG, DOC, DOCX (Max 10MB)
            </p>
            {formData.form28_supporting_documents && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <CheckCircleIcon className="h-4 w-4" />
                File selected: {formData.form28_supporting_documents.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 5: Declaration of Correctness */}
      <div className="mb-8 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <CheckCircleIcon className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            5. Declaration of Correctness
          </h2>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={formData.form28_declaration_correctness || false}
              onChange={(e) => setFieldValue('form28_declaration_correctness', e.target.checked)}
              className="mt-1 mr-3 h-4 w-4 text-indigo-600 rounded"
            />
            <span className="text-sm text-gray-800">
              I/We hereby declare that to the best of my/our knowledge and belief, the particulars given in
              this declaration and in the documents accompanying it are true and correct, and nothing has been
              concealed or misrepresented.
            </span>
          </label>
        </div>
      </div>

      {/* Section 6: Date and Signature */}
      <div className="mb-8 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            6. Date and Signature
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
              <AutoFetchBadge source={autoFetched.form28_date} />
            </label>
            <input
              type="date"
              value={formData.form28_date || ''}
              onChange={(e) => setFieldValue('form28_date', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name of Signatory
              <AutoFetchBadge source={autoFetched.form28_signatory_name} />
            </label>
            <input
              type="text"
              value={formData.form28_signatory_name || ''}
              onChange={(e) => setFieldValue('form28_signatory_name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Full name of the person signing"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Designation/Capacity
            </label>
            <input
              type="text"
              value={formData.form28_signatory_designation || ''}
              onChange={(e) => setFieldValue('form28_signatory_designation', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., Applicant / Patent Agent / Authorized Representative"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address of Signatory
              <AutoFetchBadge source={autoFetched.form28_signatory_address} />
            </label>
            <textarea
              value={formData.form28_signatory_address || ''}
              onChange={(e) => setFieldValue('form28_signatory_address', e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Complete address of signatory"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Signature
            </label>
            <input
              type="file"
              onChange={handleSignatureUpload}
              accept=".jpg,.jpeg,.png"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              JPG or PNG (Max 2MB)
            </p>
            {formData.form28_signature && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <CheckCircleIcon className="h-4 w-4" />
                Signature uploaded: {formData.form28_signature.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 7: To (Addressee) */}
      <div className="mb-8 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <BuildingOfficeIcon className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            7. To (Addressee)
          </h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            The Controller of Patents
            <AutoFetchBadge source={autoFetched.form28_office_location} />
          </label>
          <select
            value={formData.form28_office_location || ''}
            onChange={(e) => setFieldValue('form28_office_location', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Select Patent Office Location</option>
            <option value="kolkata">The Patent Office, Kolkata</option>
            <option value="delhi">The Patent Office, Delhi</option>
            <option value="mumbai">The Patent Office, Mumbai</option>
            <option value="chennai">The Patent Office, Chennai</option>
          </select>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex gap-3">
          <InformationCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Important Information:</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Fee Benefits:</strong> Start-ups get 80% fee reduction; small entities and educational institutions get applicable reductions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Renewal Declaration:</strong> You must file this declaration again at each renewal/fee payment to continue availing benefits</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>DPIIT for Start-ups:</strong> Start-up recognition can be obtained from <a href="https://www.startupindia.gov.in/" target="_blank" rel="noopener noreferrer" className="underline">startupindia.gov.in</a></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Supporting Evidence:</strong> Always attach proper certificates to avoid rejection of fee reduction benefits</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Timing:</strong> This form can be filed with Form 1 (at application filing) or later before fee payment</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Form28EntityDeclaration
