import React from 'react'
import { useForm } from '../../contexts/FormContext'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

const InventorDetails = ({
  formData,
  setFieldValue,
  setNestedFieldValue,
  setArrayFieldValue,
  addArrayItem,
  removeArrayItem
}) => {
  const { errors } = useForm()

  const countries = [
    'India', 'United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'China', 'Canada', 'Australia',
    'Brazil', 'South Africa', 'Russia', 'South Korea', 'Singapore', 'Malaysia', 'Others'
  ]

  const genders = ['Male', 'Female', 'Other']

  const inventors = formData.inventors || [{}]
  const inventorsSameAsApplicants = formData.inventors_same_as_applicants

  const handleChange = (index, field, value) => {
    setArrayFieldValue('inventors', index, field, value)
  }

  const handleSameAsApplicantsChange = (value) => {
    setFieldValue('inventors_same_as_applicants', value)
  }

  const addInventor = () => {
    addArrayItem('inventors', {
      name_full: '',
      gender: '',
      nationality: '',
      country_of_residence: '',
      address: ''
    })
  }

  const removeInventor = (index) => {
    if (inventors.length > 1) {
      removeArrayItem('inventors', index)
    }
  }

  return (
    <div className="space-y-6">
      {/* Section 4: Inventor(s) Details */}
      <div className="form-section">
        <h3 className="form-section-title">Section 4: Inventor(s) Details</h3>

        {/* Are inventors same as applicants? */}
        <div className="mb-6 p-4 bg-gray-50 -lg">
          <label className="label mb-3">
            Are the inventors the same as the applicants?
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="inventors_same_as_applicants"
                value="yes"
                checked={inventorsSameAsApplicants === 'yes'}
                onChange={(e) => handleSameAsApplicantsChange(e.target.value)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-3 text-sm text-gray-700">Yes - Inventors are same as applicants</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="inventors_same_as_applicants"
                value="no"
                checked={inventorsSameAsApplicants === 'no'}
                onChange={(e) => handleSameAsApplicantsChange(e.target.value)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-3 text-sm text-gray-700">No - Inventors are different from applicants</span>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            If you select "Yes", inventor details will be copied from applicant details automatically.
          </p>
        </div>

        {/* Show inventor details form if "No" is selected */}
        {inventorsSameAsApplicants === 'no' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                All fields are optional. Provide inventor information as available.
              </p>
              {inventors.length < 15 && (
                <button
                  type="button"
                  onClick={addInventor}
                  className="btn-primary flex items-center text-sm"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Inventor
                </button>
              )}
            </div>

            {inventors.map((inventor, index) => (
              <div key={index} className="border border-gray-200 -lg p-6 mb-6 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    Inventor {index + 1}
                  </h4>
                  {inventors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInventor(index)}
                      className="text-red-600 hover:text-red-800 flex items-center"
                    >
                      <TrashIcon className="h-5 w-5 mr-1" />
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name in Full */}
                  <div className="md:col-span-2">
                    <label className="label">
                      Inventor Name in Full
                    </label>
                    <input
                      type="text"
                      value={inventor.name_full || ''}
                      onChange={(e) => handleChange(index, 'name_full', e.target.value)}
                      className="input-field"
                      placeholder="Enter inventor's full name"
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Full legal name of the inventor
                    </p>
                    {errors[`inventors.${index}.name_full`] && (
                      <p className="form-error">{errors[`inventors.${index}.name_full`]}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="label">
                      Gender
                    </label>
                    <select
                      value={inventor.gender || ''}
                      onChange={(e) => handleChange(index, 'gender', e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select Gender</option>
                      {genders.map(gender => (
                        <option key={gender} value={gender}>{gender}</option>
                      ))}
                    </select>
                  </div>

                  {/* Nationality */}
                  <div>
                    <label className="label">
                      Nationality
                    </label>
                    <input
                      type="text"
                      value={inventor.nationality || ''}
                      onChange={(e) => handleChange(index, 'nationality', e.target.value)}
                      className="input-field"
                      placeholder="e.g., Indian, American"
                      maxLength={100}
                    />
                    {errors[`inventors.${index}.nationality`] && (
                      <p className="form-error">{errors[`inventors.${index}.nationality`]}</p>
                    )}
                  </div>

                  {/* Country of Residence */}
                  <div>
                    <label className="label">
                      Country of Residence
                    </label>
                    <select
                      value={inventor.country_of_residence || ''}
                      onChange={(e) => handleChange(index, 'country_of_residence', e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select Country</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                    {errors[`inventors.${index}.country_of_residence`] && (
                      <p className="form-error">{errors[`inventors.${index}.country_of_residence`]}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="label">
                      Complete Address
                    </label>
                    <textarea
                      value={inventor.address || ''}
                      onChange={(e) => handleChange(index, 'address', e.target.value)}
                      className="input-field"
                      rows={4}
                      placeholder="Enter complete residential address"
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Full address including house number, street, city, state, country, and postal code
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {inventors.length === 0 && (
              <div className="text-center py-8 bg-gray-50 -lg">
                <p className="text-gray-500 mb-4">No inventors added yet</p>
                <button
                  type="button"
                  onClick={addInventor}
                  className="btn-primary flex items-center mx-auto"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add First Inventor
                </button>
              </div>
            )}
          </>
        )}

        {inventorsSameAsApplicants === 'yes' && (
          <div className="p-6 bg-green-50 border border-green-200 -lg">
            <div className="flex items-start">
              <svg className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Inventors are same as applicants
                </p>
                <p className="text-xs text-green-700 mt-1">
                  The inventor details will be automatically derived from the applicant information you provided in Section 3A.
                </p>
              </div>
            </div>
          </div>
        )}

        {!inventorsSameAsApplicants && (
          <div className="p-4 bg-blue-50 -lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Please specify whether inventors are the same as applicants, or provide separate inventor details if they are different.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default InventorDetails
