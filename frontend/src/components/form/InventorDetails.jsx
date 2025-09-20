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
    'India', 'United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'China', 'Canada', 'Australia', 'Others'
  ]

  const genders = [
    'Male',
    'Female',
    'Others',
    'Prefer not to disclose'
  ]

  const inventors = formData.inventors || [{}]

  const handleChange = (index, field, value) => {
    setArrayFieldValue('inventors', index, field, value)
  }

  const addInventor = () => {
    addArrayItem('inventors', {
      sameAsApplicant: false,
      name: '',
      gender: '',
      nationality: '',
      age: '',
      countryOfResidence: '',
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
      <div className="form-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="form-section-title">Inventor Details</h3>
          {inventors.length < 10 && (
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
          <div key={index} className="border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">
                Inventor {index + 1}
              </h4>
              {inventors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInventor(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Same as Applicant Checkbox */}
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={inventor.sameAsApplicant || false}
                  onChange={(e) => handleChange(index, 'sameAsApplicant', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">
                  Same as Applicant
                </span>
              </label>
            </div>

            {!inventor.sameAsApplicant && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="label label-required">
                    Inventor Name in Full
                  </label>
                  <input
                    type="text"
                    value={inventor.name || ''}
                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                    className="input-field"
                    placeholder="Enter full name"
                    maxLength={200}
                  />
                  {errors[`inventors.${index}.name`] && (
                    <p className="form-error">{errors[`inventors.${index}.name`]}</p>
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
                  <label className="label label-required">
                    Nationality
                  </label>
                  <select
                    value={inventor.nationality || ''}
                    onChange={(e) => handleChange(index, 'nationality', e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select Nationality</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  {errors[`inventors.${index}.nationality`] && (
                    <p className="form-error">{errors[`inventors.${index}.nationality`]}</p>
                  )}
                </div>

                {/* Age */}
                <div>
                  <label className="label">
                    Age
                  </label>
                  <input
                    type="number"
                    value={inventor.age || ''}
                    onChange={(e) => handleChange(index, 'age', e.target.value)}
                    className="input-field"
                    placeholder="Age (optional)"
                    min="1"
                    max="99"
                  />
                </div>

                {/* Country of Residence */}
                <div>
                  <label className="label label-required">
                    Country of Residence
                  </label>
                  <select
                    value={inventor.countryOfResidence || ''}
                    onChange={(e) => handleChange(index, 'countryOfResidence', e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  {errors[`inventors.${index}.countryOfResidence`] && (
                    <p className="form-error">{errors[`inventors.${index}.countryOfResidence`]}</p>
                  )}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="label">
                    Address
                  </label>
                  <textarea
                    value={inventor.address || ''}
                    onChange={(e) => handleChange(index, 'address', e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Enter complete address"
                    maxLength={500}
                  />
                </div>
              </div>
            )}

            {inventor.sameAsApplicant && (
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ This inventor will use the same details as the applicant
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default InventorDetails
