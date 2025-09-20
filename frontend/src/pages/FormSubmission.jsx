import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from '../contexts/FormContext'
import { formAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import FormStep from '../components/FormStep'
import ProgressBar from '../components/ProgressBar'
import toast from 'react-hot-toast'

const FormSubmission = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const {
    formData,
    currentStep,
    totalSteps,
    isDirty,
    isSubmitting,
    isSavingDraft,
    setFieldValue,
    setNestedFieldValue,
    setArrayFieldValue,
    addArrayItem,
    removeArrayItem,
    loadFormData,
    setSubmitting,
    setSavingDraft,
    getFormProgress
  } = useForm()

  const [formInfo, setFormInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadForm()
  }, [token])

  useEffect(() => {
    // Auto-save draft every 30 seconds
    if (isDirty && formData && Object.keys(formData).length > 0) {
      const interval = setInterval(() => {
        saveDraft()
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [isDirty, formData])

  const loadForm = async () => {
    try {
      setIsLoading(true)
      const response = await formAPI.getForm(token)
      
      if (response.success) {
        setFormInfo(response.data)
        loadFormData(response.data.formData || {})
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('Error loading form:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const saveDraft = async () => {
    try {
      setSavingDraft(true)
      const response = await formAPI.saveDraft(token, formData)
      
      if (response.success) {
        console.log('Draft saved automatically')
      }
    } catch (error) {
      console.error('Error saving draft:', error)
    } finally {
      setSavingDraft(false)
    }
  }

  const handleSaveDraft = async () => {
    try {
      setSavingDraft(true)
      const response = await formAPI.saveDraft(token, formData)
      
      if (response.success) {
        toast.success('Draft saved successfully!')
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('Error saving draft:', error)
      toast.error('Failed to save draft')
    } finally {
      setSavingDraft(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      const response = await formAPI.submitForm(token, formData)
      
      if (response.success) {
        toast.success('Form submitted successfully!')
        navigate('/success', { 
          state: { 
            submissionId: response.data.submissionId,
            email: formInfo.email 
          } 
        })
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Failed to submit form')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your form...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Form Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const progress = getFormProgress()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Patent Application Form
              </h1>
              <p className="text-gray-600 mt-1">
                Complete your patent application details
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Client Email</p>
              <p className="font-medium text-gray-900">{formInfo?.email}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <ProgressBar 
              current={currentStep} 
              total={totalSteps} 
              progress={progress}
            />
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <FormStep 
            step={currentStep}
            formData={formData}
            setFieldValue={setFieldValue}
            setNestedFieldValue={setNestedFieldValue}
            setArrayFieldValue={setArrayFieldValue}
            addArrayItem={addArrayItem}
            removeArrayItem={removeArrayItem}
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isSavingDraft && (
              <div className="flex items-center text-sm text-gray-500">
                <LoadingSpinner size="sm" className="mr-2" />
                Saving draft...
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSavingDraft || isSubmitting}
              className="btn-secondary"
            >
              Save Draft
            </button>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || isSavingDraft}
              className="btn-primary flex items-center"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Form'
              )}
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Need Help?</h3>
          <p className="text-sm text-blue-700">
            If you have any questions while filling out this form, please contact us at{' '}
            <a href="mailto:udditkantsinha@gmail.com" className="underline">
              udditkantsinha@gmail.com
            </a>
            . All information provided will be kept confidential and secure.
          </p>
        </div>
      </div>
    </div>
  )
}

export default FormSubmission
