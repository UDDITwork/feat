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

  const handleChange = (field, value) => {
    setFieldValue(field, value)
  }

  const handleNestedChange = (section, field, value) => {
    const currentSection = formData[section] || {}
    setNestedFieldValue(section, field, value)
  }

  return (
    <div className="space-y-6">
      <div className="form-section">
        <h3 className="form-section-title">Patent Agent Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* IN/PA No */}
          <div>
            <label className="label">
              IN/PA No.
            </label>
            <input
              type="text"
              value={formData.patentAgent?.inPaNo || ''}
              onChange={(e) => handleNestedChange('patentAgent', 'inPaNo', e.target.value)}
              className="input-field"
              placeholder="IN/PA-XXXX"
            />
            <p className="text-xs text-gray-500 mt-1">
              Patent agent registration number
            </p>
          </div>

          {/* Agent Name */}
          <div>
            <label className="label">
              Agent Name
            </label>
            <input
              type="text"
              value={formData.patentAgent?.agentName || ''}
              onChange={(e) => handleNestedChange('patentAgent', 'agentName', e.target.value)}
              className="input-field"
              placeholder="Full name of patent agent"
              maxLength={100}
            />
          </div>

          {/* Mobile No */}
          <div>
            <label className="label">
              Mobile No.
            </label>
            <input
              type="tel"
              value={formData.patentAgent?.mobileNo || ''}
              onChange={(e) => handleNestedChange('patentAgent', 'mobileNo', e.target.value)}
              className="input-field"
              placeholder="10-digit mobile number"
              maxLength={10}
              pattern="[6-9][0-9]{9}"
            />
            <p className="text-xs text-gray-500 mt-1">
              OTP verification will be required
            </p>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Patent Agent Information:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Patent agent must be registered with the Indian Patent Office</li>
            <li>• IN/PA number format: IN/PA-XXXX (where XXXX is the registration number)</li>
            <li>• Mobile number will be verified via OTP</li>
            <li>• This information is required for official correspondence</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AgentInformation
