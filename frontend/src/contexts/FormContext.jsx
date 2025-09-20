import React, { createContext, useContext, useReducer } from 'react'
import toast from 'react-hot-toast'

const FormContext = createContext()

const initialState = {
  formData: {},
  currentStep: 1,
  totalSteps: 8,
  isDirty: false,
  isSubmitting: false,
  isSavingDraft: false,
  errors: {},
  validationErrors: {}
}

const formReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FORM_DATA':
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
        isDirty: true
      }
    case 'SET_FIELD_VALUE':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.field]: action.payload.value
        },
        isDirty: true,
        errors: {
          ...state.errors,
          [action.payload.field]: null
        }
      }
    case 'SET_NESTED_FIELD_VALUE':
      const { section, field, value } = action.payload
      return {
        ...state,
        formData: {
          ...state.formData,
          [section]: {
            ...state.formData[section],
            [field]: value
          }
        },
        isDirty: true,
        errors: {
          ...state.errors,
          [`${section}.${field}`]: null
        }
      }
    case 'SET_ARRAY_FIELD_VALUE':
      const { arrayField, index, field: arrayFieldName, value: arrayValue } = action.payload
      const newArray = [...(state.formData[arrayField] || [])]
      if (newArray[index]) {
        newArray[index] = { ...newArray[index], [arrayFieldName]: arrayValue }
      } else {
        newArray[index] = { [arrayFieldName]: arrayValue }
      }
      return {
        ...state,
        formData: {
          ...state.formData,
          [arrayField]: newArray
        },
        isDirty: true
      }
    case 'ADD_ARRAY_ITEM':
      const { arrayName, item } = action.payload
      return {
        ...state,
        formData: {
          ...state.formData,
          [arrayName]: [...(state.formData[arrayName] || []), item]
        },
        isDirty: true
      }
    case 'REMOVE_ARRAY_ITEM':
      const { arrayField: removeArrayField, index: removeIndex } = action.payload
      const filteredArray = state.formData[removeArrayField]?.filter((_, i) => i !== removeIndex) || []
      return {
        ...state,
        formData: {
          ...state.formData,
          [removeArrayField]: filteredArray
        },
        isDirty: true
      }
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload
      }
    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.totalSteps)
      }
    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1)
      }
    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.payload
      }
    case 'SET_FIELD_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.field]: action.payload.error
        }
      }
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: {},
        validationErrors: {}
      }
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload
      }
    case 'SET_SAVING_DRAFT':
      return {
        ...state,
        isSavingDraft: action.payload
      }
    case 'LOAD_FORM_DATA':
      return {
        ...state,
        formData: action.payload,
        isDirty: false
      }
    case 'RESET_FORM':
      return {
        ...initialState,
        formData: action.payload || {}
      }
    default:
      return state
  }
}

export const FormProvider = ({ children }) => {
  const [state, dispatch] = useReducer(formReducer, initialState)

  const setFormData = (data) => {
    dispatch({ type: 'SET_FORM_DATA', payload: data })
  }

  const setFieldValue = (field, value) => {
    dispatch({ type: 'SET_FIELD_VALUE', payload: { field, value } })
  }

  const setNestedFieldValue = (section, field, value) => {
    dispatch({ type: 'SET_NESTED_FIELD_VALUE', payload: { section, field, value } })
  }

  const setArrayFieldValue = (arrayField, index, field, value) => {
    dispatch({ type: 'SET_ARRAY_FIELD_VALUE', payload: { arrayField, index, field, value } })
  }

  const addArrayItem = (arrayName, item = {}) => {
    dispatch({ type: 'ADD_ARRAY_ITEM', payload: { arrayName, item } })
  }

  const removeArrayItem = (arrayField, index) => {
    dispatch({ type: 'REMOVE_ARRAY_ITEM', payload: { arrayField, index } })
  }

  const setStep = (step) => {
    dispatch({ type: 'SET_STEP', payload: step })
  }

  const nextStep = () => {
    dispatch({ type: 'NEXT_STEP' })
  }

  const prevStep = () => {
    dispatch({ type: 'PREV_STEP' })
  }

  const setErrors = (errors) => {
    dispatch({ type: 'SET_ERRORS', payload: errors })
  }

  const setFieldError = (field, error) => {
    dispatch({ type: 'SET_FIELD_ERROR', payload: { field, error } })
  }

  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' })
  }

  const setSubmitting = (isSubmitting) => {
    dispatch({ type: 'SET_SUBMITTING', payload: isSubmitting })
  }

  const setSavingDraft = (isSavingDraft) => {
    dispatch({ type: 'SET_SAVING_DRAFT', payload: isSavingDraft })
  }

  const loadFormData = (data) => {
    dispatch({ type: 'LOAD_FORM_DATA', payload: data })
  }

  const resetForm = (initialData = {}) => {
    dispatch({ type: 'RESET_FORM', payload: initialData })
  }

  const validateField = (field, value, rules = {}) => {
    const errors = []

    if (rules.required && (!value || value.toString().trim() === '')) {
      errors.push(`${field} is required`)
    }

    if (rules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.push('Please enter a valid email address')
    }

    if (rules.mobile && value && !/^[6-9]\d{9}$/.test(value)) {
      errors.push('Please enter a valid 10-digit mobile number starting with 6-9')
    }

    if (rules.pinCode && value && !/^\d{6}$/.test(value)) {
      errors.push('Please enter a valid 6-digit PIN code')
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      errors.push(`${field} must be at least ${rules.minLength} characters long`)
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      errors.push(`${field} must not exceed ${rules.maxLength} characters`)
    }

    if (rules.date && value) {
      const date = new Date(value)
      const today = new Date()
      if (date > today) {
        errors.push('Date cannot be in the future')
      }
    }

    return errors
  }

  const validateForm = () => {
    const errors = {}
    let isValid = true

    // Basic validation rules
    const validationRules = {
      'titleOfInvention': { required: true, maxLength: 500 },
      'applicants.0.name': { required: true, maxLength: 200 },
      'applicants.0.address.email': { required: true, email: true },
      'applicants.0.address.contactNumber': { required: true, mobile: true }
    }

    Object.entries(validationRules).forEach(([field, rules]) => {
      const fieldErrors = validateField(field, getNestedValue(state.formData, field), rules)
      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors[0]
        isValid = false
      }
    })

    dispatch({ type: 'SET_ERRORS', payload: errors })
    return isValid
  }

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  const getFormProgress = () => {
    const totalFields = 50 // Approximate total fields
    const filledFields = countFilledFields(state.formData)
    return Math.round((filledFields / totalFields) * 100)
  }

  const countFilledFields = (obj) => {
    let count = 0
    for (const key in obj) {
      if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          count += countFilledFields(obj[key])
        } else if (Array.isArray(obj[key])) {
          obj[key].forEach(item => {
            if (typeof item === 'object') {
              count += countFilledFields(item)
            } else if (item !== null && item !== undefined && item !== '') {
              count++
            }
          })
        } else {
          count++
        }
      }
    }
    return count
  }

  const value = {
    ...state,
    setFormData,
    setFieldValue,
    setNestedFieldValue,
    setArrayFieldValue,
    addArrayItem,
    removeArrayItem,
    setStep,
    nextStep,
    prevStep,
    setErrors,
    setFieldError,
    clearErrors,
    setSubmitting,
    setSavingDraft,
    loadFormData,
    resetForm,
    validateField,
    validateForm,
    getFormProgress
  }

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  )
}

export const useForm = () => {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error('useForm must be used within a FormProvider')
  }
  return context
}

export default FormContext
