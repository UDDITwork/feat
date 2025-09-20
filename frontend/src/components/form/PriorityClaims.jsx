import React from 'react'
import { useForm } from '../../contexts/FormContext'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

const PriorityClaims = ({ 
  formData, 
  setFieldValue, 
  setNestedFieldValue, 
  setArrayFieldValue, 
  addArrayItem, 
  removeArrayItem 
}) => {
  const { errors } = useForm()

  const countries = [
    'United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'China', 'Canada', 'Australia', 'Others'
  ]

  const priorityClaims = formData.priorityClaims || []

  const handleChange = (index, field, value) => {
    setArrayFieldValue('priorityClaims', index, field, value)
  }

  const addPriorityClaim = () => {
    addArrayItem('priorityClaims', {
      country: '',
      applicationNumber: '',
      filingDate: '',
      applicantName: '',
      titleOfInvention: '',
      ipcClassification: ''
    })
  }

  const removePriorityClaim = (index) => {
    removeArrayItem('priorityClaims', index)
  }

  const handleDateChange = (index, field, value) => {
    const date = new Date(value)
    if (!isNaN(date.getTime())) {
      setArrayFieldValue('priorityClaims', index, field, date)
    } else {
      setArrayFieldValue('priorityClaims', index, field, value)
    }
  }

  return (
    <div className="space-y-6">
      <div className="form-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="form-section-title">Priority Claims</h3>
          <button
            type="button"
            onClick={addPriorityClaim}
            className="btn-primary flex items-center text-sm"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Priority Claim
          </button>
        </div>

        {priorityClaims.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No priority claims added yet</p>
            <p className="text-sm text-gray-400">
              Priority claims are required for Convention applications. Click "Add Priority Claim" to add one.
            </p>
          </div>
        ) : (
          priorityClaims.map((claim, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Priority Claim {index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removePriorityClaim(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Country */}
                <div>
                  <label className="label label-required">
                    Country
                  </label>
                  <select
                    value={claim.country || ''}
                    onChange={(e) => handleChange(index, 'country', e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  {errors[`priorityClaims.${index}.country`] && (
                    <p className="form-error">{errors[`priorityClaims.${index}.country`]}</p>
                  )}
                </div>

                {/* Application Number */}
                <div>
                  <label className="label label-required">
                    Application Number
                  </label>
                  <input
                    type="text"
                    value={claim.applicationNumber || ''}
                    onChange={(e) => handleChange(index, 'applicationNumber', e.target.value)}
                    className="input-field"
                    placeholder="Foreign application number"
                    maxLength={30}
                  />
                  {errors[`priorityClaims.${index}.applicationNumber`] && (
                    <p className="form-error">{errors[`priorityClaims.${index}.applicationNumber`]}</p>
                  )}
                </div>

                {/* Filing Date */}
                <div>
                  <label className="label label-required">
                    Filing Date
                  </label>
                  <input
                    type="date"
                    value={claim.filingDate ? new Date(claim.filingDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleDateChange(index, 'filingDate', e.target.value)}
                    className="input-field"
                  />
                  {errors[`priorityClaims.${index}.filingDate`] && (
                    <p className="form-error">{errors[`priorityClaims.${index}.filingDate`]}</p>
                  )}
                </div>

                {/* IPC Classification */}
                <div>
                  <label className="label">
                    IPC Classification
                  </label>
                  <input
                    type="text"
                    value={claim.ipcClassification || ''}
                    onChange={(e) => handleChange(index, 'ipcClassification', e.target.value)}
                    className="input-field"
                    placeholder="e.g., A61K 35/78"
                  />
                </div>

                {/* Applicant Name */}
                <div>
                  <label className="label label-required">
                    Name of Applicant
                  </label>
                  <input
                    type="text"
                    value={claim.applicantName || ''}
                    onChange={(e) => handleChange(index, 'applicantName', e.target.value)}
                    className="input-field"
                    placeholder="Applicant name in foreign application"
                    maxLength={200}
                  />
                  {errors[`priorityClaims.${index}.applicantName`] && (
                    <p className="form-error">{errors[`priorityClaims.${index}.applicantName`]}</p>
                  )}
                </div>

                {/* Title of Invention */}
                <div>
                  <label className="label label-required">
                    Title of Invention
                  </label>
                  <input
                    type="text"
                    value={claim.titleOfInvention || ''}
                    onChange={(e) => handleChange(index, 'titleOfInvention', e.target.value)}
                    className="input-field"
                    placeholder="Title in foreign application"
                    maxLength={500}
                  />
                  {errors[`priorityClaims.${index}.titleOfInvention`] && (
                    <p className="form-error">{errors[`priorityClaims.${index}.titleOfInvention`]}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Priority Claims Information:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Required for Convention applications</li>
            <li>• Must be filed within 12 months of the priority date</li>
            <li>• All details must match the foreign application exactly</li>
            <li>• IPC classification helps in examination process</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default PriorityClaims
