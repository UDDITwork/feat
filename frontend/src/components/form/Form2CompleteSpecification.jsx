import React, { useState, useEffect } from 'react'
import { useForm } from '../../contexts/FormContext'
import {
  DocumentTextIcon,
  InformationCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

const Form2CompleteSpecification = ({ formData, setFieldValue, setNestedFieldValue }) => {
  const [autoFetched, setAutoFetched] = useState({})

  // Auto-fetch on component mount
  useEffect(() => {
    const fetched = {}

    // Section 1: Title of Invention - from Form 1
    if (!formData.form2_invention_title && formData.invention_title) {
      setFieldValue('form2_invention_title', formData.invention_title)
      fetched.form2_invention_title = 'form1'
    }

    // Section 2: Applicant Details - from Form 1
    if (!formData.form2_applicant_name && formData.applicants?.[0]?.name_full) {
      setFieldValue('form2_applicant_name', formData.applicants[0].name_full)
      fetched.form2_applicant_name = 'form1'
    }

    if (!formData.form2_applicant_nationality && formData.applicants?.[0]?.nationality) {
      setFieldValue('form2_applicant_nationality', formData.applicants[0].nationality)
      fetched.form2_applicant_nationality = 'form1'
    }

    // Concatenate address from Form 1
    if (!formData.form2_applicant_address && formData.applicants?.[0]?.address) {
      const addr = formData.applicants[0].address
      const addressParts = [
        addr.house_no && addr.village ? `${addr.house_no} ${addr.village}` : addr.house_no || addr.village,
        addr.post_office ? `P.O. ${addr.post_office}` : null,
        addr.street,
        addr.city && addr.state && addr.pincode ? `${addr.city}, ${addr.state} ${addr.pincode}` : null,
        addr.country
      ].filter(Boolean)

      if (addressParts.length > 0) {
        setFieldValue('form2_applicant_address', addressParts.join('\n'))
        fetched.form2_applicant_address = 'form1'
      }
    }

    // Section 3: Specification Type - infer from Form 1
    if (!formData.form2_specification_type) {
      // Check if claims exist in Form 1
      const hasClaimsInForm1 = formData.specification_number_of_claims &&
                                formData.specification_number_of_claims !== 'NIL' &&
                                formData.specification_number_of_claims > 0

      if (hasClaimsInForm1) {
        setFieldValue('form2_specification_type', 'complete')
        fetched.form2_specification_type = 'form1'
      } else {
        // Default to complete (user can change)
        setFieldValue('form2_specification_type', 'complete')
        fetched.form2_specification_type = 'default'
      }
    }

    setAutoFetched(fetched)
  }, [])

  // Auto-fetch badge component
  const AutoFetchBadge = ({ source }) => {
    if (!source) return null

    const badgeConfig = {
      form1: { color: 'green', text: '🔄 From Form 1' },
      default: { color: 'gray', text: '📅 Default' }
    }

    const config = badgeConfig[source] || { color: 'gray', text: '📥 Auto' }

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium text-${config.color}-700 bg-${config.color}-100 rounded-md ml-2`}>
        {config.text}
      </span>
    )
  }

  // Helper text for reference fields
  const getClaimsHelperText = () => {
    const claimCount = formData.specification_number_of_claims
    if (claimCount && claimCount !== 'NIL' && claimCount > 0) {
      return `📌 Form 1 indicates ${claimCount} claims. Please enter the claim text below.`
    }
    return null
  }

  const getDrawingsHelperText = () => {
    const drawingCount = formData.specification_number_of_drawings
    const drawingPages = formData.specification_drawing_pages
    if (drawingCount && drawingCount > 0) {
      return `📌 Form 1 indicates ${drawingCount} drawing(s) across ${drawingPages || 'N/A'} pages.`
    }
    return null
  }

  const getAbstractHelperText = () => {
    const abstractPages = formData.specification_abstract_pages
    if (abstractPages) {
      return `📌 Form 1 indicates abstract is ${abstractPages} page(s).`
    }
    return null
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="mb-8 border-b pb-6">
        <div className="flex items-center gap-3 mb-4">
          <DocumentTextIcon className="h-10 w-10 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Form 2</h1>
            <p className="text-lg text-gray-600 mt-1">
              Complete Specification (Description, Claims, Abstract)
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <div className="flex">
            <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">About This Form</h3>
              <p className="text-sm text-blue-700 mt-1">
                This form is for filing the complete specification of your patent application.
                All fields are <strong>OPTIONAL</strong> and auto-filled from Form 1 where possible.
                You can skip any field if not applicable.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Title of Invention */}
      <div className="mb-8 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            1. Title of the Invention
          </h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title of Invention (Max 500 characters)
            <AutoFetchBadge source={autoFetched.form2_invention_title} />
          </label>
          <input
            type="text"
            value={formData.form2_invention_title || ''}
            onChange={(e) => setFieldValue('form2_invention_title', e.target.value)}
            maxLength={500}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter the title of your invention"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.form2_invention_title?.length || 0} / 500 characters
          </p>
        </div>
      </div>

      {/* Section 2: Applicant Details */}
      <div className="mb-8 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            2. Applicant(s) Details
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Applicant Name (Max 200 characters)
              <AutoFetchBadge source={autoFetched.form2_applicant_name} />
            </label>
            <input
              type="text"
              value={formData.form2_applicant_name || ''}
              onChange={(e) => setFieldValue('form2_applicant_name', e.target.value)}
              maxLength={200}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter applicant full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Applicant Nationality (Max 100 characters)
              <AutoFetchBadge source={autoFetched.form2_applicant_nationality} />
            </label>
            <input
              type="text"
              value={formData.form2_applicant_nationality || ''}
              onChange={(e) => setFieldValue('form2_applicant_nationality', e.target.value)}
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter nationality (e.g., Indian, USA, etc.)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Applicant Complete Address (Max 500 characters)
              <AutoFetchBadge source={autoFetched.form2_applicant_address} />
            </label>
            <textarea
              value={formData.form2_applicant_address || ''}
              onChange={(e) => setFieldValue('form2_applicant_address', e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter complete address including house no., street, city, state, PIN, country"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.form2_applicant_address?.length || 0} / 500 characters
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Specification Type */}
      <div className="mb-8 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            3. Preamble to the Description
          </h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Specification Type
            <AutoFetchBadge source={autoFetched.form2_specification_type} />
          </label>
          <div className="space-y-3">
            <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="form2_specification_type"
                value="complete"
                checked={formData.form2_specification_type === 'complete'}
                onChange={(e) => setFieldValue('form2_specification_type', e.target.value)}
                className="mt-1 mr-3 h-4 w-4 text-indigo-600"
              />
              <div className="flex-1">
                <span className="font-medium text-gray-900">COMPLETE SPECIFICATION</span>
                <p className="text-sm text-gray-600 mt-1">
                  Includes full description, claims, abstract, and drawings (if applicable)
                </p>
              </div>
            </label>

            <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="form2_specification_type"
                value="provisional"
                checked={formData.form2_specification_type === 'provisional'}
                onChange={(e) => setFieldValue('form2_specification_type', e.target.value)}
                className="mt-1 mr-3 h-4 w-4 text-indigo-600"
              />
              <div className="flex-1">
                <span className="font-medium text-gray-900">PROVISIONAL SPECIFICATION</span>
                <p className="text-sm text-gray-600 mt-1">
                  Contains only description (claims are optional)
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Section 4: Description/Specification Content */}
      <div className="mb-8 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            4. Description/Specification Content
          </h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Complete Technical Description
          </label>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This field should include:
              <br />• Field of invention
              <br />• Background art
              <br />• Summary of invention
              <br />• Brief description of drawings (if any)
              <br />• Detailed description with examples
            </p>
          </div>
          <textarea
            value={formData.form2_specification_description || ''}
            onChange={(e) => setFieldValue('form2_specification_description', e.target.value)}
            rows={15}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
            placeholder="Enter the complete technical description of your invention..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.form2_specification_description?.length || 0} characters
          </p>
        </div>
      </div>

      {/* Section 5: Claims (Conditional - only if Complete Specification) */}
      {formData.form2_specification_type === 'complete' && (
        <div className="mb-8 border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              5. Claims
            </h2>
          </div>

          {getClaimsHelperText() && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">{getClaimsHelperText()}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patent Claims (Numbered List)
            </label>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-yellow-800">
                <strong>Format:</strong> Each claim should start with a number.
                <br />Example:
                <br />1. A method for...
                <br />2. The method of claim 1, wherein...
              </p>
            </div>
            <textarea
              value={formData.form2_specification_claims || ''}
              onChange={(e) => setFieldValue('form2_specification_claims', e.target.value)}
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
              placeholder="1. A [method/apparatus/composition] for [purpose], comprising...&#10;2. The [method/apparatus/composition] of claim 1, wherein...&#10;..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.form2_specification_claims?.length || 0} characters
            </p>
          </div>
        </div>
      )}

      {/* Section 6: Abstract */}
      <div className="mb-8 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            6. Abstract
          </h2>
        </div>

        {getAbstractHelperText() && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">{getAbstractHelperText()}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Abstract (Max 150 words / ~1000 characters)
          </label>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
            <p className="text-sm text-yellow-800">
              <strong>Abstract should:</strong> Briefly summarize the invention in 150 words or less.
              Include the technical field, problem solved, and key features.
            </p>
          </div>
          <textarea
            value={formData.form2_specification_abstract || ''}
            onChange={(e) => setFieldValue('form2_specification_abstract', e.target.value)}
            maxLength={1000}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter a concise abstract summarizing your invention..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.form2_specification_abstract?.length || 0} / 1000 characters
          </p>
        </div>
      </div>

      {/* Section 7: Drawings Reference (Info Only) */}
      {getDrawingsHelperText() && (
        <div className="mb-8 border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              7. Drawings (Reference from Form 1)
            </h2>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              {getDrawingsHelperText()}
              <br /><strong>Note:</strong> Drawing files should be uploaded separately as per Form 1 specifications.
            </p>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex gap-3">
          <InformationCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-green-900 mb-2">Important Information:</h3>
            <ul className="text-sm text-green-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span><strong>All fields are OPTIONAL:</strong> You can skip any field and complete later</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span><strong>Auto-filled data:</strong> Fields marked with badges are auto-filled from Form 1</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span><strong>Editable:</strong> You can modify any auto-filled data if needed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span><strong>Auto-save:</strong> Your progress is automatically saved every 30 seconds</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Form2CompleteSpecification
