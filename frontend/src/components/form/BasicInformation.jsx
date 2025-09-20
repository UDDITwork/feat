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
    'Ordinary',
    'Convention',
    'PCT-NP',
    'PPH',
    'Divisional',
    'Patent of Addition'
  ]

  const handleChange = (field, value) => {
    setFieldValue(field, value)
    if (errors[field]) {
      setFieldError(field, null)
    }
  }

  const handleDateChange = (field, value) => {
    // Convert date to proper format
    const date = new Date(value)
    if (!isNaN(date.getTime())) {
      setFieldValue(field, date)
    } else {
      setFieldValue(field, value)
    }
  }

  return (
    <div className="space-y-6">
      {/* Application Number */}
      <div className="form-section">
        <h3 className="form-section-title">Application Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">
              Application No.
            </label>
            <input
              type="text"
              value={formData.applicationNo || ''}
              onChange={(e) => handleChange('applicationNo', e.target.value)}
              className="input-field bg-gray-50"
              placeholder="Auto-generated"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be auto-generated upon submission
            </p>
          </div>

          <div>
            <label className="label">
              Filing Date
            </label>
            <input
              type="date"
              value={formData.filingDate ? new Date(formData.filingDate).toISOString().split('T')[0] : ''}
              onChange={(e) => handleDateChange('filingDate', e.target.value)}
              className="input-field bg-gray-50"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">
              Current date (auto-populated)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="label">
              CBR No.
            </label>
            <input
              type="text"
              value={formData.cbrNo || ''}
              onChange={(e) => handleChange('cbrNo', e.target.value)}
              className="input-field"
              placeholder="Payment receipt number"
            />
            {errors.cbrNo && (
              <p className="form-error">{errors.cbrNo}</p>
            )}
          </div>

          <div>
            <label className="label">
              Applicant's Reference/Identification No.
            </label>
            <input
              type="text"
              value={formData.applicantReference || ''}
              onChange={(e) => handleChange('applicantReference', e.target.value)}
              className="input-field"
              placeholder="Your reference number (optional)"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional - Your internal reference number
            </p>
          </div>
        </div>
      </div>

      {/* Type of Application */}
      <div className="form-section">
        <h3 className="form-section-title">Type of Application</h3>
        
        <div className="space-y-3">
          {applicationTypes.map((type) => (
            <label key={type} className="flex items-center">
              <input
                type="radio"
                name="typeOfApplication"
                value={type}
                checked={formData.typeOfApplication === type}
                onChange={(e) => handleChange('typeOfApplication', e.target.value)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-3 text-sm text-gray-700">{type}</span>
            </label>
          ))}
        </div>
        
        {errors.typeOfApplication && (
          <p className="form-error mt-2">{errors.typeOfApplication}</p>
        )}

        {/* Help text for application types */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Application Types:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li><strong>Ordinary:</strong> Standard patent application</li>
            <li><strong>Convention:</strong> Based on foreign priority claim</li>
            <li><strong>PCT-NP:</strong> National phase of PCT application</li>
            <li><strong>PPH:</strong> Patent Prosecution Highway</li>
            <li><strong>Divisional:</strong> Division of parent application</li>
            <li><strong>Patent of Addition:</strong> Improvement to existing patent</li>
          </ul>
        </div>
      </div>

      {/* Title of Invention */}
      <div className="form-section">
        <h3 className="form-section-title">Title of Invention</h3>
        
        <div>
          <label className="label label-required">
            Title of Invention
          </label>
          <textarea
            value={formData.titleOfInvention || ''}
            onChange={(e) => handleChange('titleOfInvention', e.target.value)}
            className="input-field"
            rows={3}
            placeholder="Enter a clear and concise title for your invention"
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              Maximum 500 characters. No special symbols allowed.
            </p>
            <span className="text-xs text-gray-400">
              {(formData.titleOfInvention || '').length}/500
            </span>
          </div>
          {errors.titleOfInvention && (
            <p className="form-error">{errors.titleOfInvention}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default BasicInformation
