import React, { useEffect, useState } from 'react'
import { useForm } from '../../contexts/FormContext'

const PatentDetails = ({
  formData,
  setFieldValue,
  setNestedFieldValue,
  setArrayFieldValue,
  addArrayItem,
  removeArrayItem
}) => {
  const { errors } = useForm()
  const [autoFetchedFields, setAutoFetchedFields] = useState({})

  // Auto-fetch data from Form 1 on component mount
  useEffect(() => {
    const autoFetchFromForm1 = () => {
      const fetched = {}

      // Section 1: Title of Invention - AUTO-FETCH from Form 1 Section 5
      if (formData.invention_title && !formData.form2_invention_title) {
        setFieldValue('form2_invention_title', formData.invention_title)
        fetched.form2_invention_title = true
      }

      // Section 2: Applicant Details - AUTO-FETCH from Form 1 Section 3A
      if (formData.applicants && formData.applicants.length > 0) {
        const primaryApplicant = formData.applicants[0]

        // Applicant Name
        if (primaryApplicant.name_full && !formData.form2_applicant_name) {
          setFieldValue('form2_applicant_name', primaryApplicant.name_full)
          fetched.form2_applicant_name = true
        }

        // Applicant Nationality
        if (primaryApplicant.nationality && !formData.form2_applicant_nationality) {
          setFieldValue('form2_applicant_nationality', primaryApplicant.nationality)
          fetched.form2_applicant_nationality = true
        }

        // Applicant Address - CONCATENATE from multiple fields
        if (primaryApplicant.address && !formData.form2_applicant_address) {
          const addr = primaryApplicant.address
          const addressParts = [
            addr.house_no,
            addr.village ? `${addr.village},` : '',
            addr.post_office ? `P.O. ${addr.post_office}` : '',
            addr.street,
            [addr.city, addr.state, addr.pin_code].filter(Boolean).join(', '),
            addr.country
          ].filter(Boolean)

          if (addressParts.length > 0) {
            setFieldValue('form2_applicant_address', addressParts.join('\n'))
            fetched.form2_applicant_address = true
          }
        }
      }

      // Section 3: Specification Type - INFER from Form 1 Section 13
      if (!formData.form2_specification_type) {
        // Check if claims exist in Form 1
        const claimsCount = formData.specification_number_of_claims
        if (claimsCount === 'NIL' || claimsCount === 0 || claimsCount === '0') {
          setFieldValue('form2_specification_type', 'provisional')
          fetched.form2_specification_type = true
        } else if (claimsCount && parseInt(claimsCount) > 0) {
          setFieldValue('form2_specification_type', 'complete')
          fetched.form2_specification_type = true
        }
      }

      setAutoFetchedFields(fetched)
    }

    autoFetchFromForm1()
  }, []) // Run only once on mount

  const handleChange = (field, value) => {
    setFieldValue(field, value)
  }

  const getHelperTextForClaims = () => {
    const claimsCount = formData.specification_number_of_claims
    if (claimsCount && claimsCount !== 'NIL' && parseInt(claimsCount) > 0) {
      return `📋 Form 1 indicates ${claimsCount} claims. Please enter the claim text below.`
    }
    return null
  }

  const getHelperTextForAbstract = () => {
    const abstractPages = formData.specification_abstract_pages
    if (abstractPages && parseInt(abstractPages) > 0) {
      return `📋 Form 1 indicates ${abstractPages} page(s) for abstract.`
    }
    return null
  }

  const getHelperTextForDrawings = () => {
    const drawingsCount = formData.specification_number_of_drawings
    const drawingPages = formData.specification_drawing_pages
    if (drawingsCount && parseInt(drawingsCount) > 0) {
      return `📋 Form 1 indicates ${drawingsCount} drawing(s) across ${drawingPages || '?'} page(s).`
    }
    return null
  }

  const isFieldAutoFetched = (fieldName) => {
    return autoFetchedFields[fieldName] === true
  }

  const AutoFetchBadge = ({ show }) => {
    if (!show) return null
    return (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 -md ml-2">
        📥 From Form 1
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Form 2 Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 -lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Form 2: Complete Specification
        </h2>
        <p className="text-sm text-gray-600">
          Fields marked with 📥 have been auto-populated from Form 1. You can edit them if needed.
        </p>
      </div>

      {/* Section 1: Title of the Invention */}
      <div className="form-section">
        <h3 className="form-section-title">
          Section 1: Title of the Invention
          <AutoFetchBadge show={isFieldAutoFetched('form2_invention_title')} />
        </h3>

        <div>
          <label className="label">
            Title of Invention
          </label>
          <textarea
            value={formData.form2_invention_title || ''}
            onChange={(e) => handleChange('form2_invention_title', e.target.value)}
            className={`input-field ${isFieldAutoFetched('form2_invention_title') ? 'bg-green-50 border-green-300' : ''}`}
            rows={3}
            placeholder="Enter the title of your invention"
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              {isFieldAutoFetched('form2_invention_title')
                ? '✅ Auto-populated from Form 1. You can edit if needed.'
                : 'Maximum 500 characters. Should match Form 1 title if possible.'}
            </p>
            <span className="text-xs text-gray-400">
              {(formData.form2_invention_title || '').length}/500
            </span>
          </div>
          {errors.form2_invention_title && (
            <p className="form-error">{errors.form2_invention_title}</p>
          )}
        </div>
      </div>

      {/* Section 2: Applicant(s) Details */}
      <div className="form-section">
        <h3 className="form-section-title">Section 2: Applicant(s) Details</h3>

        <p className="text-sm text-gray-600 mb-4">
          Primary applicant information auto-populated from Form 1. All fields are optional.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Applicant Name */}
          <div className="md:col-span-2">
            <label className="label">
              Applicant Name
              <AutoFetchBadge show={isFieldAutoFetched('form2_applicant_name')} />
            </label>
            <input
              type="text"
              value={formData.form2_applicant_name || ''}
              onChange={(e) => handleChange('form2_applicant_name', e.target.value)}
              className={`input-field ${isFieldAutoFetched('form2_applicant_name') ? 'bg-green-50 border-green-300' : ''}`}
              placeholder="Enter applicant name"
              maxLength={200}
            />
            {isFieldAutoFetched('form2_applicant_name') && (
              <p className="text-xs text-green-600 mt-1">
                ✅ Auto-populated from Form 1 Section 3A
              </p>
            )}
          </div>

          {/* Applicant Nationality */}
          <div>
            <label className="label">
              Applicant Nationality
              <AutoFetchBadge show={isFieldAutoFetched('form2_applicant_nationality')} />
            </label>
            <input
              type="text"
              value={formData.form2_applicant_nationality || ''}
              onChange={(e) => handleChange('form2_applicant_nationality', e.target.value)}
              className={`input-field ${isFieldAutoFetched('form2_applicant_nationality') ? 'bg-green-50 border-green-300' : ''}`}
              placeholder="Enter nationality"
              maxLength={100}
            />
            {isFieldAutoFetched('form2_applicant_nationality') && (
              <p className="text-xs text-green-600 mt-1">
                ✅ Auto-populated from Form 1 Section 3A
              </p>
            )}
          </div>

          {/* Applicant Address */}
          <div className="md:col-span-2">
            <label className="label">
              Applicant Complete Address
              <AutoFetchBadge show={isFieldAutoFetched('form2_applicant_address')} />
            </label>
            <textarea
              value={formData.form2_applicant_address || ''}
              onChange={(e) => handleChange('form2_applicant_address', e.target.value)}
              className={`input-field ${isFieldAutoFetched('form2_applicant_address') ? 'bg-green-50 border-green-300' : ''}`}
              rows={4}
              placeholder="Enter complete address"
              maxLength={500}
            />
            {isFieldAutoFetched('form2_applicant_address') && (
              <p className="text-xs text-green-600 mt-1">
                ✅ Auto-populated from Form 1 Section 3A (concatenated address fields)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Preamble to the Description */}
      <div className="form-section">
        <h3 className="form-section-title">
          Section 3: Type of Specification
          <AutoFetchBadge show={isFieldAutoFetched('form2_specification_type')} />
        </h3>

        <div className="space-y-3">
          <label className="flex items-start">
            <input
              type="radio"
              name="form2_specification_type"
              value="complete"
              checked={formData.form2_specification_type === 'complete'}
              onChange={(e) => handleChange('form2_specification_type', e.target.value)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 mt-1"
            />
            <span className="ml-3 text-sm text-gray-700">
              <strong>COMPLETE SPECIFICATION</strong> - Includes description, claims, abstract, and drawings
            </span>
          </label>

          <label className="flex items-start">
            <input
              type="radio"
              name="form2_specification_type"
              value="provisional"
              checked={formData.form2_specification_type === 'provisional'}
              onChange={(e) => handleChange('form2_specification_type', e.target.value)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 mt-1"
            />
            <span className="ml-3 text-sm text-gray-700">
              <strong>PROVISIONAL SPECIFICATION</strong> - Includes description only (no claims required)
            </span>
          </label>
        </div>

        {isFieldAutoFetched('form2_specification_type') && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 -lg">
            <p className="text-xs text-green-700">
              ✅ Auto-selected based on Form 1 Section 13 (claim count indicator)
            </p>
          </div>
        )}
      </div>

      {/* Section 4: Description/Specification Content */}
      <div className="form-section">
        <h3 className="form-section-title">Section 4: Description of Invention</h3>

        <p className="text-sm text-gray-600 mb-4">
          Provide a detailed technical description of your invention. All fields are optional.
        </p>

        <div>
          <label className="label">
            Complete Specification Description
          </label>
          <textarea
            value={formData.form2_specification_description || ''}
            onChange={(e) => handleChange('form2_specification_description', e.target.value)}
            className="input-field font-mono text-sm"
            rows={15}
            placeholder="Enter the complete technical description including:
- Field of Invention
- Background Art
- Summary of Invention
- Brief Description of Drawings (if any)
- Detailed Description of the Invention
- Examples and Embodiments"
          />
          <p className="text-xs text-gray-500 mt-1">
            Detailed technical description of the invention. Can span multiple pages.
          </p>
        </div>
      </div>

      {/* Section 5: Claims (Only if Complete Specification) */}
      {formData.form2_specification_type === 'complete' && (
        <div className="form-section bg-blue-50 border border-blue-200 -lg p-6">
          <h3 className="form-section-title">Section 5: Claims</h3>

          {getHelperTextForClaims() && (
            <div className="mb-4 p-3 bg-blue-100 border border-blue-300 -lg">
              <p className="text-sm text-blue-800">{getHelperTextForClaims()}</p>
            </div>
          )}

          <div>
            <label className="label">
              Patent Claims
            </label>
            <textarea
              value={formData.form2_specification_claims || ''}
              onChange={(e) => handleChange('form2_specification_claims', e.target.value)}
              className="input-field font-mono text-sm"
              rows={12}
              placeholder="Enter patent claims in numbered format:

1. A [device/method/composition] comprising...

2. The [device/method/composition] of claim 1, wherein...

3. The [device/method/composition] of claim 1 or 2, further comprising..."
            />
            <p className="text-xs text-gray-500 mt-1">
              List all patent claims in sequential order. Each claim should clearly define the scope of protection sought.
            </p>
          </div>
        </div>
      )}

      {/* Section 6: Abstract */}
      <div className="form-section">
        <h3 className="form-section-title">Section 6: Abstract</h3>

        {getHelperTextForAbstract() && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 -lg">
            <p className="text-sm text-blue-700">{getHelperTextForAbstract()}</p>
          </div>
        )}

        <div>
          <label className="label">
            Abstract of the Invention
          </label>
          <textarea
            value={formData.form2_specification_abstract || ''}
            onChange={(e) => handleChange('form2_specification_abstract', e.target.value)}
            className="input-field"
            rows={6}
            placeholder="Provide a concise summary of the invention (typically 150 words or less)"
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              Brief summary of the technical disclosure. Maximum 150 words recommended.
            </p>
            <span className="text-xs text-gray-400">
              {(formData.form2_specification_abstract || '').length}/1000
            </span>
          </div>
        </div>
      </div>

      {/* Section 7: Drawings Reference (If Applicable) */}
      {formData.specification_number_of_drawings && parseInt(formData.specification_number_of_drawings) > 0 && (
        <div className="form-section bg-purple-50 border border-purple-200 -lg p-6">
          <h3 className="form-section-title">Section 7: Drawings Information</h3>

          {getHelperTextForDrawings() && (
            <div className="mb-4 p-3 bg-purple-100 border border-purple-300 -lg">
              <p className="text-sm text-purple-800">{getHelperTextForDrawings()}</p>
            </div>
          )}

          <div>
            <label className="label">
              Description of Drawings
            </label>
            <textarea
              value={formData.form2_drawings_description || ''}
              onChange={(e) => handleChange('form2_drawings_description', e.target.value)}
              className="input-field"
              rows={5}
              placeholder="Provide a brief description of each drawing:

Figure 1: Shows...
Figure 2: Illustrates...
Figure 3: Depicts..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Brief description of what each drawing/figure illustrates.
            </p>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="p-4 bg-blue-50 -lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Form 2 Guidelines:</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• All fields are optional - you can fill as much or as little as needed</li>
          <li>• Fields marked with 📥 are auto-populated from Form 1 and can be edited</li>
          <li>• If you selected "Complete Specification", claims section will appear</li>
          <li>• Abstract should concisely summarize the technical aspects of your invention</li>
          <li>• Description should provide enough detail for a person skilled in the art to implement the invention</li>
        </ul>
      </div>
    </div>
  )
}

export default PatentDetails
