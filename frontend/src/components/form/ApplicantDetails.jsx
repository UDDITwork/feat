import React from 'react'
import { useForm } from '../../contexts/FormContext'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

const ApplicantDetails = ({
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

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
    'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry',
    'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Lakshadweep',
    'Andaman and Nicobar Islands', 'Others'
  ]

  const applicantCategories = [
    { value: 'natural_person', label: 'Natural Person' },
    { value: 'small_entity', label: 'Small Entity (Other than Natural Person)' },
    { value: 'startup', label: 'Startup (Other than Natural Person)' },
    { value: 'educational_institute', label: 'Educational Institute (Other than Natural Person)' },
    { value: 'others', label: 'Others (Other than Natural Person)' }
  ]

  const applicants = formData.applicants || [{}]

  const handleChange = (index, field, value) => {
    setArrayFieldValue('applicants', index, field, value)
  }

  const handleNestedChange = (index, section, field, value) => {
    const currentApplicant = applicants[index] || {}
    const currentSection = currentApplicant[section] || {}

    setArrayFieldValue('applicants', index, section, {
      ...currentSection,
      [field]: value
    })
  }

  const addApplicant = () => {
    addArrayItem('applicants', {
      name_full: '',
      nationality: '',
      country_of_residence: '',
      address: {
        house_no: '',
        village: '',
        post_office: '',
        street: '',
        city: '',
        state: '',
        country: '',
        pin_code: ''
      },
      email: '',
      contact_no: '',
      category: ''
    })
  }

  const removeApplicant = (index) => {
    if (applicants.length > 1) {
      removeArrayItem('applicants', index)
    }
  }

  return (
    <div className="space-y-6">
      {/* Section 3A: Applicant(s) Details */}
      <div className="form-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="form-section-title">Section 3A: Applicant(s) Details</h3>
          {applicants.length < 10 && (
            <button
              type="button"
              onClick={addApplicant}
              className="btn-primary flex items-center text-sm"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Applicant
            </button>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-4">
          All fields are optional. Fill in the information you have available.
        </p>

        {applicants.map((applicant, index) => (
          <div key={index} className="border border-gray-200 -lg p-6 mb-6 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">
                Applicant {index + 1}
              </h4>
              {applicants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeApplicant(index)}
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
                  Name in Full
                </label>
                <input
                  type="text"
                  value={applicant.name_full || ''}
                  onChange={(e) => handleChange(index, 'name_full', e.target.value)}
                  className="input-field"
                  placeholder="Enter full name as it should appear on the patent"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Full legal name of the applicant
                </p>
                {errors[`applicants.${index}.name_full`] && (
                  <p className="form-error">{errors[`applicants.${index}.name_full`]}</p>
                )}
              </div>

              {/* Nationality */}
              <div>
                <label className="label">
                  Nationality
                </label>
                <input
                  type="text"
                  value={applicant.nationality || ''}
                  onChange={(e) => handleChange(index, 'nationality', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Indian, American"
                  maxLength={100}
                />
                {errors[`applicants.${index}.nationality`] && (
                  <p className="form-error">{errors[`applicants.${index}.nationality`]}</p>
                )}
              </div>

              {/* Country of Residence */}
              <div>
                <label className="label">
                  Country of Residence
                </label>
                <select
                  value={applicant.country_of_residence || ''}
                  onChange={(e) => handleChange(index, 'country_of_residence', e.target.value)}
                  className="input-field"
                >
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                {errors[`applicants.${index}.country_of_residence`] && (
                  <p className="form-error">{errors[`applicants.${index}.country_of_residence`]}</p>
                )}
              </div>
            </div>

            {/* Address Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h5 className="text-md font-medium text-gray-900 mb-4">Address Details</h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* House No */}
                <div>
                  <label className="label">
                    House No.
                  </label>
                  <input
                    type="text"
                    value={applicant.address?.house_no || ''}
                    onChange={(e) => handleNestedChange(index, 'address', 'house_no', e.target.value)}
                    className="input-field"
                    placeholder="House/Flat/Building number"
                    maxLength={100}
                  />
                </div>

                {/* Village */}
                <div>
                  <label className="label">
                    Village
                  </label>
                  <input
                    type="text"
                    value={applicant.address?.village || ''}
                    onChange={(e) => handleNestedChange(index, 'address', 'village', e.target.value)}
                    className="input-field"
                    placeholder="Village name (if applicable)"
                    maxLength={100}
                  />
                </div>

                {/* Post Office */}
                <div>
                  <label className="label">
                    Post Office
                  </label>
                  <input
                    type="text"
                    value={applicant.address?.post_office || ''}
                    onChange={(e) => handleNestedChange(index, 'address', 'post_office', e.target.value)}
                    className="input-field"
                    placeholder="Post office name"
                    maxLength={100}
                  />
                </div>

                {/* Street */}
                <div>
                  <label className="label">
                    Street
                  </label>
                  <input
                    type="text"
                    value={applicant.address?.street || ''}
                    onChange={(e) => handleNestedChange(index, 'address', 'street', e.target.value)}
                    className="input-field"
                    placeholder="Street name/Road"
                    maxLength={200}
                  />
                </div>

                {/* City */}
                <div>
                  <label className="label">
                    City
                  </label>
                  <input
                    type="text"
                    value={applicant.address?.city || ''}
                    onChange={(e) => handleNestedChange(index, 'address', 'city', e.target.value)}
                    className="input-field"
                    placeholder="City/Town name"
                    maxLength={100}
                  />
                </div>

                {/* State */}
                <div>
                  <label className="label">
                    State/Province
                  </label>
                  <select
                    value={applicant.address?.state || ''}
                    onChange={(e) => handleNestedChange(index, 'address', 'state', e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select State</option>
                    {indianStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                {/* Country */}
                <div>
                  <label className="label">
                    Country
                  </label>
                  <select
                    value={applicant.address?.country || ''}
                    onChange={(e) => handleNestedChange(index, 'address', 'country', e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                {/* Pin Code */}
                <div>
                  <label className="label">
                    Pin Code / Postal Code
                  </label>
                  <input
                    type="text"
                    value={applicant.address?.pin_code || ''}
                    onChange={(e) => handleNestedChange(index, 'address', 'pin_code', e.target.value)}
                    className="input-field"
                    placeholder="e.g., 110001"
                    maxLength={10}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    6 digits for India, varies for other countries
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="label">
                    Email
                  </label>
                  <input
                    type="email"
                    value={applicant.email || ''}
                    onChange={(e) => handleChange(index, 'email', e.target.value)}
                    className="input-field"
                    placeholder="email@example.com"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    OTP verification will be required if provided
                  </p>
                  {errors[`applicants.${index}.email`] && (
                    <p className="form-error">{errors[`applicants.${index}.email`]}</p>
                  )}
                </div>

                {/* Contact Number */}
                <div>
                  <label className="label">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={applicant.contact_no || ''}
                    onChange={(e) => handleChange(index, 'contact_no', e.target.value)}
                    className="input-field"
                    placeholder="10-digit mobile number"
                    maxLength={15}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    OTP verification will be required if provided
                  </p>
                  {errors[`applicants.${index}.contact_no`] && (
                    <p className="form-error">{errors[`applicants.${index}.contact_no`]}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3B: Category of Applicant */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h5 className="text-md font-medium text-gray-900 mb-4">Section 3B: Category of Applicant</h5>

              <div className="space-y-2">
                {applicantCategories.map(category => (
                  <label key={category.value} className="flex items-start">
                    <input
                      type="radio"
                      name={`applicant_category_${index}`}
                      value={category.value}
                      checked={applicant.category === category.value}
                      onChange={(e) => handleChange(index, 'category', e.target.value)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 mt-1"
                    />
                    <span className="ml-3 text-sm text-gray-700">{category.label}</span>
                  </label>
                ))}
              </div>

              {errors[`applicants.${index}.category`] && (
                <p className="form-error mt-2">{errors[`applicants.${index}.category`]}</p>
              )}

              <div className="mt-4 p-3 bg-blue-50 -lg">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> Category selection helps determine applicable fees and benefits. Select the most appropriate category.
                </p>
              </div>
            </div>
          </div>
        ))}

        {applicants.length === 0 && (
          <div className="text-center py-8 bg-gray-50 -lg">
            <p className="text-gray-500 mb-4">No applicants added yet</p>
            <button
              type="button"
              onClick={addApplicant}
              className="btn-primary flex items-center mx-auto"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add First Applicant
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ApplicantDetails
