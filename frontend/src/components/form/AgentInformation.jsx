import React from 'react'
import { useForm } from '../../contexts/FormContext'

const AgentInformation = ({
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
      {/* Section 6: Authorized Registered Patent Agent(s) */}
      <div className="form-section">
        <h3 className="form-section-title">Section 6: Authorized Registered Patent Agent(s)</h3>

        <p className="text-sm text-gray-600 mb-4">
          All fields in this section are optional. Fill only if you are appointing a patent agent.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* IN/PA Number */}
          <div>
            <label className="label">
              IN/PA Number
            </label>
            <input
              type="text"
              value={formData.patent_agent?.inpa_no || ''}
              onChange={(e) => handleNestedChange('patent_agent', 'inpa_no', e.target.value)}
              className="input-field"
              placeholder="e.g., IN/PA 1714"
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">
              Patent agent registration number format: IN/PA XXXX
            </p>
          </div>

          {/* Patent Agent Name */}
          <div>
            <label className="label">
              Patent Agent Name
            </label>
            <input
              type="text"
              value={formData.patent_agent?.name || ''}
              onChange={(e) => handleNestedChange('patent_agent', 'name', e.target.value)}
              className="input-field"
              placeholder="Full name of patent agent"
              maxLength={200}
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="label">
              Mobile Number
            </label>
            <input
              type="tel"
              value={formData.patent_agent?.mobile_no || ''}
              onChange={(e) => handleNestedChange('patent_agent', 'mobile_no', e.target.value)}
              className="input-field"
              placeholder="10-digit mobile number"
              maxLength={15}
            />
            <p className="text-xs text-gray-500 mt-1">
              Agent's contact number for correspondence
            </p>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">About Patent Agents:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Patent agent must be registered with the Indian Patent Office</li>
            <li>• IN/PA number format: IN/PA XXXX (where XXXX is the registration number)</li>
            <li>• Authorized agent can file and prosecute patent applications on your behalf</li>
            <li>• This section is optional - fill only if you are appointing a patent agent</li>
            <li>• If appointed, a Power of Attorney (POA) document must be submitted</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AgentInformation
