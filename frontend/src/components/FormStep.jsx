import React from 'react'
import { useForm } from '../contexts/FormContext'
import BasicInformation from './form/BasicInformation'
import ApplicantDetails from './form/ApplicantDetails'
import InventorDetails from './form/InventorDetails'
import PatentDetails from './form/PatentDetails'
import PriorityClaims from './form/PriorityClaims'
import AgentInformation from './form/AgentInformation'
import AddressForService from './form/AddressForService'
import ReviewAndSubmit from './form/ReviewAndSubmit'

const FormStep = ({ 
  step, 
  formData, 
  setFieldValue, 
  setNestedFieldValue, 
  setArrayFieldValue, 
  addArrayItem, 
  removeArrayItem 
}) => {
  const { nextStep, prevStep, validateForm } = useForm()

  const handleNext = () => {
    if (validateForm()) {
      nextStep()
    }
  }

  const handlePrev = () => {
    prevStep()
  }

  const renderStep = () => {
    const formProps = {
      formData,
      setFieldValue,
      setNestedFieldValue,
      setArrayFieldValue,
      addArrayItem,
      removeArrayItem
    }
    
    switch (step) {
      case 1:
        return <BasicInformation {...formProps} />
      case 2:
        return <ApplicantDetails {...formProps} />
      case 3:
        return <InventorDetails {...formProps} />
      case 4:
        return <PatentDetails {...formProps} />
      case 5:
        return <PriorityClaims {...formProps} />
      case 6:
        return <AgentInformation {...formProps} />
      case 7:
        return <AddressForService {...formProps} />
      case 8:
        return <ReviewAndSubmit {...formProps} />
      default:
        return <BasicInformation {...formProps} />
    }
  }

  const getStepTitle = () => {
    const titles = {
      1: 'Basic Information',
      2: 'Applicant Details',
      3: 'Inventor Details',
      4: 'Patent Details',
      5: 'Priority Claims',
      6: 'Agent Information',
      7: 'Address for Service',
      8: 'Review & Submit'
    }
    return titles[step] || 'Form Step'
  }

  const getStepDescription = () => {
    const descriptions = {
      1: 'Provide basic application information and type',
      2: 'Enter applicant details and contact information',
      3: 'Specify inventor information and relationships',
      4: 'Describe the invention and its technical details',
      5: 'Add priority claims if applicable',
      6: 'Provide patent agent information',
      7: 'Specify address for service',
      8: 'Review all information before submission'
    }
    return descriptions[step] || 'Complete this step to continue'
  }

  return (
    <div className="p-6">
      {/* Step Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {getStepTitle()}
        </h2>
        <p className="text-gray-600">
          {getStepDescription()}
        </p>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handlePrev}
          disabled={step === 1}
          className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
            step === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Previous
        </button>

        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>Step {step} of 8</span>
        </div>

        {step < 8 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            Next
          </button>
        ) : (
          <div className="text-sm text-gray-500">
            Ready to submit
          </div>
        )}
      </div>
    </div>
  )
}

export default FormStep
