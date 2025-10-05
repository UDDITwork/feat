import React from 'react'
import { useForm } from '../contexts/FormContext'
import BasicInformation from './form/BasicInformation'
import ApplicantDetails from './form/ApplicantDetails'
import InventorDetails from './form/InventorDetails'
import PatentDetails from './form/PatentDetails'
import PriorityClaims from './form/PriorityClaims'
import AgentInformation from './form/AgentInformation'
import AddressForService from './form/AddressForService'
import Form2CompleteSpecification from './form/Form2CompleteSpecification'
import Form3Statement from './form/Form3Statement'
import Form5Declaration from './form/Form5Declaration'
import Form6ChangeApplicant from './form/Form6ChangeApplicant'
import Form7AOpposition from './form/Form7AOpposition'
import Form8InventorMention from './form/Form8InventorMention'
import Form13Amendment from './form/Form13Amendment'
import Form16RegistrationTitle from './form/Form16RegistrationTitle'
import Form26Authorization from './form/Form26Authorization'
import Form28EntityDeclaration from './form/Form28EntityDeclaration'
import ReviewAndSubmitComplete from './form/ReviewAndSubmitComplete'

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
      // Form 1 - Basic Patent Application (Steps 1-7)
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

      // Form 2 - Complete Specification (Step 8)
      case 8:
        return <Form2CompleteSpecification {...formProps} />

      // Additional Forms (Steps 9-17)
      case 9:
        return <Form3Statement {...formProps} />
      case 10:
        return <Form5Declaration {...formProps} />
      case 11:
        return <Form6ChangeApplicant {...formProps} />
      case 12:
        return <Form7AOpposition {...formProps} />
      case 13:
        return <Form8InventorMention {...formProps} />
      case 14:
        return <Form13Amendment {...formProps} />
      case 15:
        return <Form16RegistrationTitle {...formProps} />
      case 16:
        return <Form26Authorization {...formProps} />
      case 17:
        return <Form28EntityDeclaration {...formProps} />

      // Review and Submit (Step 18)
      case 18:
        return <ReviewAndSubmitComplete formData={formData} />

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
      8: 'Form 2 - Complete Specification',
      9: 'Form 3 - Statement & Undertaking',
      10: 'Form 5 - Inventorship Declaration',
      11: 'Form 6 - Change in Applicant',
      12: 'Form 7A - Opposition',
      13: 'Form 8 - Inventor Mention',
      14: 'Form 13 - Amendment Request',
      15: 'Form 16 - Title Registration',
      16: 'Form 26 - Agent Authorization',
      17: 'Form 28 - Entity Declaration',
      18: 'Review & Submit'
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
      8: 'Complete specification with description, claims, and abstract',
      9: 'Statement and undertaking under Section 8 of the Patents Act',
      10: 'Declaration as to inventorship for patent grant certificate',
      11: 'Request for recording change/transfer of applicant rights',
      12: 'Opposition to grant of patent (pre-grant or post-grant)',
      13: 'Request for mention of inventor names in patent certificate',
      14: 'Request for amendment of application or specification',
      15: 'Application for registration of assignment or transmission',
      16: 'Power of Attorney for authorizing patent agent(s)',
      17: 'Declaration of small entity/start-up/educational institution status',
      18: 'Review all information before final submission'
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
          className={`px-6 py-2 text-sm font-medium -lg transition-colors ${
            step === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Previous
        </button>

        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>Step {step} of 18</span>
        </div>

        {step < 18 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 -lg transition-colors"
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
