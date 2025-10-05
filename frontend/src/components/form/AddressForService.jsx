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
      {/* Section 7: Address for Service of Applicant in India */}
      <div className="form-section">
        <h3 className="form-section-title">Section 7: Address for Service of Applicant in India</h3>

        <p className="text-sm text-gray-600 mb-4">
          All fields are optional. This address will be used for official correspondence.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="md:col-span-2">
            <label className="label">
              Name
            </label>
            <input
              type="text"
              value={formData.service_address?.name || ''}
              onChange={(e) => handleNestedChange('service_address', 'name', e.target.value)}
              className="input-field"
              placeholder="Name of contact person or organization"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              Name to whom correspondence should be addressed
            </p>
          </div>

          {/* Postal Address */}
          <div className="md:col-span-2">
            <label className="label">
              Postal Address
            </label>
            <textarea
              value={formData.service_address?.postal_address || ''}
              onChange={(e) => handleNestedChange('service_address', 'postal_address', e.target.value)}
              className="input-field"
              rows={4}
              placeholder="Complete postal address for service of documents"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              Full address including building/house number, street, locality, city, state, and PIN code
            </p>
          </div>

          {/* Telephone Number */}
          <div>
            <label className="label">
              Telephone Number
            </label>
            <input
              type="tel"
              value={formData.service_address?.telephone_no || ''}
              onChange={(e) => handleNestedChange('service_address', 'telephone_no', e.target.value)}
              className="input-field"
              placeholder="11 digits with STD code"
              maxLength={15}
            />
            <p className="text-xs text-gray-500 mt-1">
              Landline number with STD code (optional)
            </p>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="label">
              Mobile Number
            </label>
            <input
              type="tel"
              value={formData.service_address?.mobile_no || ''}
              onChange={(e) => handleNestedChange('service_address', 'mobile_no', e.target.value)}
              className="input-field"
              placeholder="10-digit mobile number"
              maxLength={15}
            />
            <p className="text-xs text-gray-500 mt-1">
              Primary contact mobile number
            </p>
          </div>

          {/* Fax Number */}
          <div>
            <label className="label">
              Fax Number
            </label>
            <input
              type="tel"
              value={formData.service_address?.fax_no || ''}
              onChange={(e) => handleNestedChange('service_address', 'fax_no', e.target.value)}
              className="input-field"
              placeholder="Fax number (optional)"
              maxLength={15}
            />
          </div>

          {/* Email ID */}
          <div className="md:col-span-2">
            <label className="label">
              E-mail ID
            </label>
            <input
              type="email"
              value={formData.service_address?.email_id || ''}
              onChange={(e) => handleNestedChange('service_address', 'email_id', e.target.value)}
              className="input-field"
              placeholder="email@example.com (multiple emails can be comma-separated)"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              Primary email for official correspondence. You can provide multiple emails separated by commas.
            </p>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 -lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Address for Service Information:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• This address will be used for all official correspondence from the Patent Office</li>
            <li>• The address must be within India</li>
            <li>• All notices, objections, and communications will be sent to this address</li>
            <li>• Ensure the address is accurate and complete to avoid delays in correspondence</li>
            <li>• Email and mobile number may be verified via OTP if provided</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AddressForService
