import React from 'react'
import { useForm } from '../../contexts/FormContext'

const PatentDetails = ({ 
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

  return (
    <div className="space-y-6">
      <div className="form-section">
        <h3 className="form-section-title">Patent Details</h3>
        
        <div>
          <label className="label label-required">
            Title of Invention
          </label>
          <textarea
            value={formData.titleOfInvention || ''}
            onChange={(e) => handleChange('titleOfInvention', e.target.value)}
            className="input-field"
            rows={3}
            placeholder="Enter a clear and concise title for your invention"
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              Maximum 500 characters. No special symbols allowed.
            </p>
            <span className="text-xs text-gray-400">
              {(formData.titleOfInvention || '').length}/500
            </span>
          </div>
          {errors.titleOfInvention && (
            <p className="form-error">{errors.titleOfInvention}</p>
          )}
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Technical Description</h3>
        
        <div className="space-y-6">
          <div>
            <label className="label">
              Field of Invention
            </label>
            <textarea
              value={formData.fieldOfInvention || ''}
              onChange={(e) => handleChange('fieldOfInvention', e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Describe the technical field of your invention"
              maxLength={500}
            />
          </div>

          <div>
            <label className="label">
              Background of Invention
            </label>
            <textarea
              value={formData.backgroundOfInvention || ''}
              onChange={(e) => handleChange('backgroundOfInvention', e.target.value)}
              className="input-field"
              rows={5}
              placeholder="Describe the background and prior art related to your invention"
            />
          </div>

          <div>
            <label className="label">
              Objects of Invention
            </label>
            <textarea
              value={formData.objectsOfInvention || ''}
              onChange={(e) => handleChange('objectsOfInvention', e.target.value)}
              className="input-field"
              rows={4}
              placeholder="List the main objects and advantages of your invention"
              maxLength={2000}
            />
          </div>

          <div>
            <label className="label">
              Summary of Invention
            </label>
            <textarea
              value={formData.summaryOfInvention || ''}
              onChange={(e) => handleChange('summaryOfInvention', e.target.value)}
              className="input-field"
              rows={5}
              placeholder="Provide a detailed summary of your invention"
              maxLength={3000}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatentDetails
