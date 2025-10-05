import React, { createContext, useContext, useReducer } from 'react'
import toast from 'react-hot-toast'

const FormContext = createContext()

const initialState = {
  formData: {},
  currentStep: 1,
  totalSteps: 18,  // Updated: Form 1 (7 steps) + Form 2 (1 step) + Forms 3,5,6,7A,8,13,16,26,28 (9 steps) + Review (1 step) = 18 total
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
    // NO VALIDATION - All fields are completely optional
    // Client can leave any field blank and proceed
    return []  // Always return empty errors array
  }

  const validateForm = () => {
    // NO VALIDATION - All fields are completely optional
    // Client can skip any field and proceed to next step
    dispatch({ type: 'SET_ERRORS', payload: {} })
    return true  // Always return true - no validation blocking
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
