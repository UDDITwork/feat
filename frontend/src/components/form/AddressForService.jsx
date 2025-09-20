import React from 'react'
import { useForm } from '../../contexts/FormContext'

const AddressForService = ({ 
  formData, 
  setFieldValue, 
  setNestedFieldValue, 
  setArrayFieldValue, 
  addArrayItem, 
  removeArrayItem 
}) => {
  const { errors } = useForm()

  const handleNestedChange = (section, field, value) => {
    setNestedFieldValue(section, field, value)
  }

  return (
    <div className="space-y-6">
      <div className="form-section">
        <h3 className="form-section-title">Address for Service</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="label">
              Name
            </label>
            <input
              type="text"
              value={formData.addressForService?.name || ''}
              onChange={(e) => handleNestedChange('addressForService', 'name', e.target.value)}
              className="input-field"
              placeholder="Name for service address"
              maxLength={100}
            />
          </div>

          {/* Telephone No */}
          <div>
            <label className="label">
              Telephone No.
            </label>
            <input
              type="tel"
              value={formData.addressForService?.telephoneNo || ''}
              onChange={(e) => handleNestedChange('addressForService', 'telephoneNo', e.target.value)}
              className="input-field"
              placeholder="11 digits with STD code"
              maxLength={11}
            />
          </div>

          {/* Mobile No */}
          <div>
            <label className="label">
              Mobile No.
            </label>
            <input
              type="tel"
              value={formData.addressForService?.mobileNo || ''}
              onChange={(e) => handleNestedChange('addressForService', 'mobileNo', e.target.value)}
              className="input-field"
              placeholder="10-digit mobile number"
              maxLength={10}
              pattern="[6-9][0-9]{9}"
            />
            <p className="text-xs text-gray-500 mt-1">
              OTP verification will be required
            </p>
          </div>

          {/* Fax No */}
          <div>
            <label className="label">
              Fax No.
            </label>
            <input
              type="tel"
              value={formData.addressForService?.faxNo || ''}
              onChange={(e) => handleNestedChange('addressForService', 'faxNo', e.target.value)}
              className="input-field"
              placeholder="Fax number (optional)"
            />
          </div>

          {/* Email ID */}
          <div className="md:col-span-2">
            <label className="label">
              E-mail ID
            </label>
            <input
              type="email"
              value={formData.addressForService?.emailId || ''}
              onChange={(e) => handleNestedChange('addressForService', 'emailId', e.target.value)}
              className="input-field"
              placeholder="email@example.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              OTP verification will be required
            </p>
          </div>

          {/* Postal Address */}
          <div className="md:col-span-2">
            <label className="label">
              Postal Address
            </label>
            <textarea
              value={formData.addressForService?.postalAddress || ''}
              onChange={(e) => handleNestedChange('addressForService', 'postalAddress', e.target.value)}
              className="input-field"
              rows={4}
              placeholder="Complete postal address for service"
              maxLength={300}
            />
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Address for Service Information:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• This address will be used for all official correspondence</li>
            <li>• Must be a valid address within India</li>
            <li>• Mobile number and email will be verified via OTP</li>
            <li>• All official notices will be sent to this address</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AddressForService
