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
    'United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'China', 'Canada', 'Australia',
    'South Korea', 'Brazil', 'Russia', 'Switzerland', 'Netherlands', 'Sweden', 'Israel', 'Others'
  ]

  const conventionApplications = formData.convention_applications || []
  const applicationType = formData.application_type

  const handleChange = (index, field, value) => {
    setArrayFieldValue('convention_applications', index, field, value)
  }

  const addConventionApplication = () => {
    addArrayItem('convention_applications', {
      country: '',
      application_number: '',
      filing_date: '',
      applicant_name: '',
      invention_title: '',
      ipc_classification: ''
    })
  }

  const removeConventionApplication = (index) => {
    removeArrayItem('convention_applications', index)
  }

  const handleDateChange = (index, field, value) => {
    setArrayFieldValue('convention_applications', index, field, value)
  }

  // Only show this section if Convention application type is selected
  if (applicationType !== 'convention' && !applicationType?.includes('convention')) {
    return (
      <div className="space-y-6">
        <div className="form-section">
          <h3 className="form-section-title">Section 8: Convention Application Details</h3>
          <div className="p-6 bg-gray-50 border border-gray-200 -lg text-center">
            <p className="text-gray-600">
              This section is only applicable if you selected "Convention" as the application type.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Please go back to Section 2 if you need to select Convention application type.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section 8: Convention Application Details */}
      <div className="form-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="form-section-title">Section 8: Convention Application Details</h3>
          <button
            type="button"
            onClick={addConventionApplication}
            className="btn-primary flex items-center text-sm"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Convention Application
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          All fields are optional. Provide details of convention applications for which priority is being claimed.
        </p>

        {conventionApplications.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 -lg border border-gray-200">
            <p className="text-gray-500 mb-4">No convention applications added yet</p>
            <p className="text-sm text-gray-400 mb-4">
              Convention applications allow you to claim priority from earlier applications filed in other countries.
            </p>
            <button
              type="button"
              onClick={addConventionApplication}
              className="btn-primary flex items-center mx-auto"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add First Convention Application
            </button>
          </div>
        ) : (
          conventionApplications.map((application, index) => (
            <div key={index} className="border border-gray-200 -lg p-6 mb-6 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Convention Application {index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeConventionApplication(index)}
                  className="text-red-600 hover:text-red-800 flex items-center"
                >
                  <TrashIcon className="h-5 w-5 mr-1" />
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Country */}
                <div>
                  <label className="label">
                    Convention Country
                  </label>
                  <select
                    value={application.country || ''}
                    onChange={(e) => handleChange(index, 'country', e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Country where the earlier application was filed
                  </p>
                  {errors[`convention_applications.${index}.country`] && (
                    <p className="form-error">{errors[`convention_applications.${index}.country`]}</p>
                  )}
                </div>

                {/* Application Number */}
                <div>
                  <label className="label">
                    Application Number
                  </label>
                  <input
                    type="text"
                    value={application.application_number || ''}
                    onChange={(e) => handleChange(index, 'application_number', e.target.value)}
                    className="input-field"
                    placeholder="Foreign application number"
                    maxLength={50}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Application number in the convention country
                  </p>
                  {errors[`convention_applications.${index}.application_number`] && (
                    <p className="form-error">{errors[`convention_applications.${index}.application_number`]}</p>
                  )}
                </div>

                {/* Filing Date */}
                <div>
                  <label className="label">
                    Filing Date
                  </label>
                  <input
                    type="date"
                    value={application.filing_date || ''}
                    onChange={(e) => handleDateChange(index, 'filing_date', e.target.value)}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Date when the application was filed in convention country
                  </p>
                  {errors[`convention_applications.${index}.filing_date`] && (
                    <p className="form-error">{errors[`convention_applications.${index}.filing_date`]}</p>
                  )}
                </div>

                {/* IPC Classification */}
                <div>
                  <label className="label">
                    IPC Classification
                  </label>
                  <input
                    type="text"
                    value={application.ipc_classification || ''}
                    onChange={(e) => handleChange(index, 'ipc_classification', e.target.value)}
                    className="input-field"
                    placeholder="e.g., A61K 35/78"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    International Patent Classification (optional)
                  </p>
                </div>

                {/* Applicant Name */}
                <div className="md:col-span-2">
                  <label className="label">
                    Name of Applicant in Convention Application
                  </label>
                  <input
                    type="text"
                    value={application.applicant_name || ''}
                    onChange={(e) => handleChange(index, 'applicant_name', e.target.value)}
                    className="input-field"
                    placeholder="Applicant name as it appears in the foreign application"
                    maxLength={200}
                  />
                  {errors[`convention_applications.${index}.applicant_name`] && (
                    <p className="form-error">{errors[`convention_applications.${index}.applicant_name`]}</p>
                  )}
                </div>

                {/* Title of Invention */}
                <div className="md:col-span-2">
                  <label className="label">
                    Title of Invention in Convention Application
                  </label>
                  <input
                    type="text"
                    value={application.invention_title || ''}
                    onChange={(e) => handleChange(index, 'invention_title', e.target.value)}
                    className="input-field"
                    placeholder="Title as it appears in the foreign application"
                    maxLength={500}
                  />
                  {errors[`convention_applications.${index}.invention_title`] && (
                    <p className="form-error">{errors[`convention_applications.${index}.invention_title`]}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 -lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Convention Application Information:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Required only for Convention applications claiming priority from foreign applications</li>
            <li>• Priority must be claimed within 12 months from the earliest filing date</li>
            <li>• All details must match exactly with the foreign application</li>
            <li>• IPC classification helps in examination process but is optional</li>
            <li>• You can add multiple convention applications if claiming priority from more than one</li>
            <li>• Supporting documents (certified copies) must be filed within prescribed time limits</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default PriorityClaims
