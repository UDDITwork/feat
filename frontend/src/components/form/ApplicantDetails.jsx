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
    'India', 'United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'China', 'Canada', 'Australia', 'Others'
  ]

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
    'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Others'
  ]

  const categories = [
    'Natural Person',
    'Other than Natural Person',
    'Educational Institution',
    'Small Entity',
    'Startup',
    'Others'
  ]

  const genders = [
    'Male',
    'Female',
    'Others',
    'Prefer not to disclose'
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
      name: '',
      gender: '',
      nationality: '',
      countryOfResidence: '',
      age: '',
      address: {
        houseNo: '',
        street: '',
        city: '',
        state: '',
        country: '',
        pinCode: '',
        email: '',
        contactNumber: ''
      },
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
      <div className="form-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="form-section-title">Applicant Details</h3>
          {applicants.length < 5 && (
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

        {applicants.map((applicant, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">
                Applicant {index + 1}
              </h4>
              {applicants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeApplicant(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="label label-required">
                  Name in Full
                </label>
                <input
                  type="text"
                  value={applicant.name || ''}
                  onChange={(e) => handleChange(index, 'name', e.target.value)}
                  className="input-field"
                  placeholder="Enter full name"
                  maxLength={200}
                />
                {errors[`applicants.${index}.name`] && (
                  <p className="form-error">{errors[`applicants.${index}.name`]}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="label">
                  Gender
                </label>
                <select
                  value={applicant.gender || ''}
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
                <label className="label label-required">
                  Nationality
                </label>
                <select
                  value={applicant.nationality || ''}
                  onChange={(e) => handleChange(index, 'nationality', e.target.value)}
                  className="input-field"
                >
                  <option value="">Select Nationality</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                {errors[`applicants.${index}.nationality`] && (
                  <p className="form-error">{errors[`applicants.${index}.nationality`]}</p>
                )}
              </div>

              {/* Country of Residence */}
              <div>
                <label className="label label-required">
                  Country of Residence
                </label>
                <select
                  value={applicant.countryOfResidence || ''}
                  onChange={(e) => handleChange(index, 'countryOfResidence', e.target.value)}
                  className="input-field"
                >
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                {errors[`applicants.${index}.countryOfResidence`] && (
                  <p className="form-error">{errors[`applicants.${index}.countryOfResidence`]}</p>
                )}
              </div>

              {/* Age */}
              <div>
                <label className="label">
                  Age
                </label>
                <input
                  type="number"
                  value={applicant.age || ''}
                  onChange={(e) => handleChange(index, 'age', e.target.value)}
                  className="input-field"
                  placeholder="Age (optional)"
                  min="1"
                  max="99"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional for natural persons
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="label label-required">
                  Category of Applicant
                </label>
                <div className="space-y-2">
                  {categories.map(category => (
                    <label key={category} className="flex items-center">
                      <input
                        type="radio"
                        name={`category_${index}`}
                        value={category}
                        checked={applicant.category === category}
                        onChange={(e) => handleChange(index, 'category', e.target.value)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
                {errors[`applicants.${index}.category`] && (
                  <p className="form-error mt-2">{errors[`applicants.${index}.category`]}</p>
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
                    value={applicant.address?.houseNo || ''}
                    onChange={(e) => handleNestedChange(index, 'address', 'houseNo', e.target.value)}
                    className="input-field"
                    placeholder="House/Flat number"
                    maxLength={50}
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
                    placeholder="Street name"
                    maxLength={100}
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
                    placeholder="City name"
                    maxLength={50}
                  />
                </div>

                {/* State */}
                <div>
                  <label className="label">
                    State
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
                    Pin Code
                  </label>
                  <input
                    type="text"
                    value={applicant.address?.pinCode || ''}
                    onChange={(e) => handleNestedChange(index, 'address', 'pinCode', e.target.value)}
                    className="input-field"
                    placeholder="6-digit PIN code"
                    maxLength={6}
                    pattern="[0-9]{6}"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="label label-required">
                    Email
                  </label>
                  <input
                    type="email"
                    value={applicant.address?.email || ''}
                    onChange={(e) => handleNestedChange(index, 'address', 'email', e.target.value)}
                    className="input-field"
                    placeholder="email@example.com"
                  />
                  {errors[`applicants.${index}.address.email`] && (
                    <p className="form-error">{errors[`applicants.${index}.address.email`]}</p>
                  )}
                </div>

                {/* Contact Number */}
                <div>
                  <label className="label label-required">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={applicant.address?.contactNumber || ''}
                    onChange={(e) => handleNestedChange(index, 'address', 'contactNumber', e.target.value)}
                    className="input-field"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    pattern="[6-9][0-9]{9}"
                  />
                  {errors[`applicants.${index}.address.contactNumber`] && (
                    <p className="form-error">{errors[`applicants.${index}.address.contactNumber`]}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ApplicantDetails
