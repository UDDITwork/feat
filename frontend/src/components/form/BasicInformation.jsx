import React from 'react'
import { useForm } from '../../contexts/FormContext'

const BasicInformation = ({
  formData,
  setFieldValue,
  setNestedFieldValue,
  setArrayFieldValue,
  addArrayItem,
  removeArrayItem
}) => {
  const { setFieldError, errors } = useForm()

  const applicationTypes = [
    { value: 'ordinary', label: 'Ordinary' },
    { value: 'convention', label: 'Convention' },
    { value: 'pct_national_phase', label: 'PCT-NP' },
    { value: 'pph', label: 'PPH (Patent Prosecution Highway)' },
    { value: 'divisional_ordinary', label: 'Divisional (under Ordinary)' },
    { value: 'patent_of_addition_ordinary', label: 'Patent of Addition (under Ordinary)' },
    { value: 'divisional_convention', label: 'Divisional (under Convention)' },
    { value: 'patent_of_addition_convention', label: 'Patent of Addition (under Convention)' },
    { value: 'divisional_pct', label: 'Divisional (under PCT)' },
    { value: 'patent_of_addition_pct', label: 'Patent of Addition (under PCT)' }
  ]

  const handleChange = (field, value) => {
    setFieldValue(field, value)
    if (errors[field]) {
      setFieldError(field, null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Section 1: Applicant's Reference/Identification No */}
      <div className="form-section">
        <h3 className="form-section-title">Section 1: Applicant's Reference/Identification No.</h3>

        <div>
          <label className="label">
            Applicant's Reference/Identification No.
          </label>
          <input
            type="text"
            value={formData.applicant_reference_no || ''}
            onChange={(e) => handleChange('applicant_reference_no', e.target.value)}
            className="input-field"
            placeholder="Enter your internal reference number (optional)"
            maxLength={50}
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional - For your internal tracking purposes
          </p>
          {errors.applicant_reference_no && (
            <p className="form-error">{errors.applicant_reference_no}</p>
          )}
        </div>
      </div>

      {/* Section 2: Type of Application */}
      <div className="form-section">
        <h3 className="form-section-title">Section 2: Type of Application</h3>

        <div className="space-y-3">
          {applicationTypes.map((type) => (
            <label key={type.value} className="flex items-start">
              <input
                type="radio"
                name="application_type"
                value={type.value}
                checked={formData.application_type === type.value}
                onChange={(e) => handleChange('application_type', e.target.value)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 mt-1"
              />
              <span className="ml-3 text-sm text-gray-700">{type.label}</span>
            </label>
          ))}
        </div>

        {errors.application_type && (
          <p className="form-error mt-2">{errors.application_type}</p>
        )}

        {/* Help text for application types */}
        <div className="mt-4 p-4 bg-blue-50 -lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Application Types Guide:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li><strong>Ordinary:</strong> Standard patent application with no priority claim</li>
            <li><strong>Convention:</strong> Application claiming priority from a foreign application filed in a convention country</li>
            <li><strong>PCT-NP:</strong> National phase entry of an international PCT application</li>
            <li><strong>PPH:</strong> Patent Prosecution Highway - expedited examination based on foreign office work</li>
            <li><strong>Divisional:</strong> Application divided from a parent application</li>
            <li><strong>Patent of Addition:</strong> Patent for improvement/modification of an existing invention</li>
          </ul>
        </div>
      </div>

      {/* Section 5: Title of the Invention */}
      <div className="form-section">
        <h3 className="form-section-title">Section 5: Title of the Invention</h3>

        <div>
          <label className="label">
            Title of Invention
          </label>
          <textarea
            value={formData.invention_title || ''}
            onChange={(e) => handleChange('invention_title', e.target.value)}
            className="input-field"
            rows={3}
            placeholder="Enter a clear and concise title for your invention"
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              Maximum 500 characters. Should be descriptive and clear.
            </p>
            <span className="text-xs text-gray-400">
              {(formData.invention_title || '').length}/500
            </span>
          </div>
          {errors.invention_title && (
            <p className="form-error">{errors.invention_title}</p>
          )}
        </div>
      </div>

      {/* Conditional: Section 10 - Divisional Application */}
      {formData.application_type && (formData.application_type.includes('divisional')) && (
        <div className="form-section bg-yellow-50 border border-yellow-200 -lg p-6">
          <h3 className="form-section-title">Section 10: Divisional Application Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                Original Application Number
              </label>
              <input
                type="text"
                value={formData.divisional_original_application_number || ''}
                onChange={(e) => handleChange('divisional_original_application_number', e.target.value)}
                className="input-field"
                placeholder="Enter original application number"
                maxLength={50}
              />
            </div>

            <div>
              <label className="label">
                Original Filing Date
              </label>
              <input
                type="date"
                value={formData.divisional_original_filing_date || ''}
                onChange={(e) => handleChange('divisional_original_filing_date', e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>
      )}

      {/* Conditional: Section 11 - Patent of Addition */}
      {formData.application_type && (formData.application_type.includes('patent_of_addition')) && (
        <div className="form-section bg-purple-50 border border-purple-200 -lg p-6">
          <h3 className="form-section-title">Section 11: Patent of Addition Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                Main Application/Patent Number
              </label>
              <input
                type="text"
                value={formData.patent_of_addition_main_application_number || ''}
                onChange={(e) => handleChange('patent_of_addition_main_application_number', e.target.value)}
                className="input-field"
                placeholder="Enter main application/patent number"
                maxLength={50}
              />
            </div>

            <div>
              <label className="label">
                Main Application Filing Date
              </label>
              <input
                type="date"
                value={formData.patent_of_addition_main_filing_date || ''}
                onChange={(e) => handleChange('patent_of_addition_main_filing_date', e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>
      )}

      {/* Conditional: Section 9 - PCT National Phase Application */}
      {formData.application_type === 'pct_national_phase' && (
        <div className="form-section bg-green-50 border border-green-200 -lg p-6">
          <h3 className="form-section-title">Section 9: PCT National Phase Application</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                PCT International Application Number
              </label>
              <input
                type="text"
                value={formData.pct_international_application_number || ''}
                onChange={(e) => handleChange('pct_international_application_number', e.target.value)}
                className="input-field"
                placeholder="PCT/CC/YYYY/NNNNNN"
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: PCT/CC/YYYY/NNNNNN
              </p>
            </div>

            <div>
              <label className="label">
                PCT International Filing Date
              </label>
              <input
                type="date"
                value={formData.pct_international_filing_date || ''}
                onChange={(e) => handleChange('pct_international_filing_date', e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BasicInformation
