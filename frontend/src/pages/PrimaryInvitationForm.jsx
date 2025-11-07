import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { primaryInvitationAPI, uploadPrimaryInvitationFile } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

const defaultInventor = () => ({
  name: '',
  address: '',
  pinCode: '',
  nationality: ''
})

const PrimaryInvitationForm = () => {
  const { token } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [uploadingField, setUploadingField] = useState(null)
  const [viewingField, setViewingField] = useState(null)
  const [error, setError] = useState(null)
  const [invitation, setInvitation] = useState(null)
  const [formData, setFormData] = useState({
    companyInfo: {
      name: '',
      address: '',
      pinCode: '',
      gstNumber: '',
      entityType: '',
      gstCertificate: null,
      entityCertificate: null
    },
    applicantInfo: {
      name: '',
      address: '',
      pinCode: '',
      sameAsCompany: false
    },
    inventors: [defaultInventor()],
    comments: ''
  })
  const createInventorErrors = (count) => Array.from({ length: Math.max(count, 1) }, () => ({}))
  const [validationErrors, setValidationErrors] = useState({
    companyInfo: {},
    applicantInfo: {},
    inventors: createInventorErrors(1)
  })

  const isCompanyInfoLocked = useMemo(
    () => Boolean(invitation?.data?.isCompanyInfoLocked || invitation?.data?.autoPrefill?.lockedFields?.includes('companyInfo')),
    [invitation?.data]
  )

  const isCompleted = invitation?.data?.status === 'completed'

  const resetValidationErrors = (inventorCount = formData.inventors.length) => {
    setValidationErrors({
      companyInfo: {},
      applicantInfo: {},
      inventors: createInventorErrors(inventorCount)
    })
  }

  const clearFieldError = (section, field, index = 0) => {
    setValidationErrors((prev) => {
      const next = {
        companyInfo: { ...prev.companyInfo },
        applicantInfo: { ...prev.applicantInfo },
        inventors: prev.inventors.map((item) => ({ ...item })),
      }

      if (section === 'inventors') {
        if (!next.inventors[index]) {
          next.inventors[index] = {}
        }
        delete next.inventors[index][field]
      } else {
        delete next[section][field]
      }

      return next
    })
  }

  const validateForm = () => {
    const inventorCount = Math.max(formData.inventors.length, 1)
    const errors = {
      companyInfo: {},
      applicantInfo: {},
      inventors: createInventorErrors(inventorCount),
    }

    let isValid = true

    const assignError = (section, field, message, index = 0) => {
      if (section === 'inventors') {
        if (!errors.inventors[index]) {
          errors.inventors[index] = {}
        }
        errors.inventors[index][field] = message
      } else {
        errors[section][field] = message
      }
    }

    const requireField = (condition, section, field, message, index = 0) => {
      if (!condition) {
        isValid = false
        assignError(section, field, message, index)
      }
    }

    const trim = (value) => (typeof value === 'string' ? value.trim() : value)

    const companyInfo = formData.companyInfo || {}

    requireField(Boolean(trim(companyInfo.name)), 'companyInfo', 'name', 'Company name is required.')
    requireField(Boolean(trim(companyInfo.address)), 'companyInfo', 'address', 'Company address is required.')
    requireField(Boolean(trim(companyInfo.pinCode)), 'companyInfo', 'pinCode', 'Company pin code is required.')
    requireField(Boolean(trim(companyInfo.gstNumber)), 'companyInfo', 'gstNumber', 'GST number is required.')
    requireField(Boolean(trim(companyInfo.entityType)), 'companyInfo', 'entityType', 'Entity type is required.')
    requireField(Boolean(companyInfo.gstCertificate?.secureUrl), 'companyInfo', 'gstCertificate', 'GST certificate upload is required.')
    requireField(Boolean(companyInfo.entityCertificate?.secureUrl), 'companyInfo', 'entityCertificate', 'Entity certificate upload is required.')

    const inventors = Array.isArray(formData.inventors) ? formData.inventors : []

    if (inventors.length === 0) {
      isValid = false
      assignError('inventors', 'name', 'At least one inventor is required.', 0)
    } else {
      inventors.forEach((inventor, index) => {
        requireField(Boolean(trim(inventor?.name)), 'inventors', 'name', `Inventor ${index + 1} name is required.`, index)
        requireField(Boolean(trim(inventor?.address)), 'inventors', 'address', `Inventor ${index + 1} address is required.`, index)
        requireField(Boolean(trim(inventor?.pinCode)), 'inventors', 'pinCode', `Inventor ${index + 1} pin code is required.`, index)
        requireField(Boolean(trim(inventor?.nationality)), 'inventors', 'nationality', `Inventor ${index + 1} nationality is required.`, index)
      })
    }

    setValidationErrors(errors)
    return { isValid, errors }
  }

  const applyBackendValidationError = (message) => {
    if (!message) {
      return
    }

    const normalized = message.toLowerCase()

    const addError = (section, field, index = 0) => {
      setValidationErrors((prev) => {
        const next = {
          companyInfo: { ...prev.companyInfo },
          applicantInfo: { ...prev.applicantInfo },
          inventors: prev.inventors.map((item) => ({ ...item })),
        }

        if (section === 'inventors') {
          if (!next.inventors[index]) {
            next.inventors[index] = {}
          }
          next.inventors[index][field] = message
        } else {
          next[section][field] = message
        }

        return next
      })
    }

    if (normalized.includes('company name')) {
      addError('companyInfo', 'name')
    } else if (normalized.includes('company address')) {
      addError('companyInfo', 'address')
    } else if (normalized.includes('company pin code')) {
      addError('companyInfo', 'pinCode')
    } else if (normalized.includes('gst number')) {
      addError('companyInfo', 'gstNumber')
    } else if (normalized.includes('gst certificate')) {
      addError('companyInfo', 'gstCertificate')
    } else if (normalized.includes('entity type')) {
      addError('companyInfo', 'entityType')
    } else if (normalized.includes('entity certificate')) {
      addError('companyInfo', 'entityCertificate')
    } else if (normalized.includes('at least one inventor')) {
      addError('inventors', 'name', 0)
    } else if (normalized.includes('inventor')) {
      const numberMatch = normalized.match(/#(\d+)/)
      const inventorIndex = numberMatch ? Number(numberMatch[1]) - 1 : 0

      if (normalized.includes('name is required')) {
        addError('inventors', 'name', inventorIndex)
      }
      if (normalized.includes('address is required')) {
        addError('inventors', 'address', inventorIndex)
      }
      if (normalized.includes('pin code is required')) {
        addError('inventors', 'pinCode', inventorIndex)
      }
      if (normalized.includes('nationality is required')) {
        addError('inventors', 'nationality', inventorIndex)
      }
    }
  }

  const buildInputClasses = (hasError) =>
    `w-full px-3 py-2 -md focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
      hasError
        ? 'border border-red-500 focus:ring-red-500 focus:border-red-500'
        : 'border border-gray-300 focus:ring-primary-500 focus:border-transparent'
    }`

  const extractFirstErrorMessage = (errors) => {
    if (!errors) {
      return 'Please fill all mandatory fields before submitting'
    }

    const companyMessages = Object.values(errors.companyInfo || {}).filter(Boolean)
    if (companyMessages.length > 0) {
      return companyMessages[0]
    }

    if (Array.isArray(errors.inventors)) {
      for (const inventorError of errors.inventors) {
        const messages = Object.values(inventorError || {}).filter(Boolean)
        if (messages.length > 0) {
          return messages[0]
        }
      }
    }

    return 'Please fill all mandatory fields before submitting'
  }
  const loadInvitation = async () => {
    try {
      setIsLoading(true)
      console.time('[PrimaryInvitationForm] loadInvitation')
      console.log('[PrimaryInvitationForm] Loading invitation', { token })
      const response = await primaryInvitationAPI.getByToken(token)
      if (!response.success) {
        throw new Error(response.message || 'Failed to load invitation')
      }

      setInvitation(response)
      console.log('[PrimaryInvitationForm] Invitation payload', response)

      const serverData = response.data || {}
      const normalizedInventors = (serverData.inventors && serverData.inventors.length > 0
        ? serverData.inventors
        : [defaultInventor()]
      ).map((inventor) => ({
        name: inventor.name || '',
        address: inventor.address || '',
        pinCode: inventor.pinCode || '',
        nationality: inventor.nationality || ''
      }))

      setFormData({
        companyInfo: {
          name: serverData.companyInfo?.name || '',
          address: serverData.companyInfo?.address || '',
          pinCode: serverData.companyInfo?.pinCode || '',
          gstNumber: serverData.companyInfo?.gstNumber || '',
          entityType: serverData.companyInfo?.entityType || '',
          gstCertificate: serverData.companyInfo?.gstCertificate || null,
          entityCertificate: serverData.companyInfo?.entityCertificate || null
        },
        applicantInfo: {
          name: serverData.applicantInfo?.name || '',
          address: serverData.applicantInfo?.address || '',
          pinCode: serverData.applicantInfo?.pinCode || '',
          sameAsCompany: Boolean(serverData.applicantInfo?.sameAsCompany)
        },
        inventors: normalizedInventors,
        comments: serverData.comments || ''
      })

      setValidationErrors({
        companyInfo: {},
        applicantInfo: {},
        inventors: createInventorErrors(normalizedInventors.length)
      })
    } catch (loadError) {
      console.error('Error loading primary invitation form:', loadError)
      setError(loadError.message)
    } finally {
      console.timeEnd('[PrimaryInvitationForm] loadInvitation')
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadInvitation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const handleCompanyChange = (field, value) => {
    console.debug('[PrimaryInvitationForm] company change', { field, value })
    clearFieldError('companyInfo', field)
    setFormData((prev) => ({
      ...prev,
      companyInfo: {
        ...prev.companyInfo,
        [field]: value
      }
    }))
  }

  const handleApplicantChange = (field, value) => {
    console.debug('[PrimaryInvitationForm] applicant change', { field, value })
    setFormData((prev) => ({
      ...prev,
      applicantInfo: {
        ...prev.applicantInfo,
        [field]: value
      }
    }))
  }

  const syncApplicantWithCompany = (checked) => {
    console.debug('[PrimaryInvitationForm] sync applicant with company', { checked })
    setFormData((prev) => ({
      ...prev,
      applicantInfo: {
        ...prev.applicantInfo,
        sameAsCompany: checked,
        address: checked ? prev.companyInfo.address : prev.applicantInfo.address,
        pinCode: checked ? prev.companyInfo.pinCode : prev.applicantInfo.pinCode
      }
    }))
  }

  const handleInventorChange = (index, field, value) => {
    console.debug('[PrimaryInvitationForm] inventor change', { index, field, value })
    clearFieldError('inventors', field, index)
    setFormData((prev) => {
      const updated = [...prev.inventors]
      updated[index] = { ...updated[index], [field]: value }
      return {
        ...prev,
        inventors: updated
      }
    })
  }

  const addInventor = () => {
    console.info('[PrimaryInvitationForm] add inventor clicked')
    setFormData((prev) => ({
      ...prev,
      inventors: [...prev.inventors, defaultInventor()]
    }))
    setValidationErrors((prev) => ({
      companyInfo: { ...prev.companyInfo },
      applicantInfo: { ...prev.applicantInfo },
      inventors: [...prev.inventors.map((item) => ({ ...item })), {}],
    }))
  }

  const removeInventor = (index) => {
    console.warn('[PrimaryInvitationForm] remove inventor clicked', { index })
    setFormData((prev) => {
      if (prev.inventors.length === 1) return prev
      const updated = prev.inventors.filter((_, idx) => idx !== index)
      return { ...prev, inventors: updated }
    })
    setValidationErrors((prev) => {
      if (prev.inventors.length === 1) {
        return prev
      }

      return {
        companyInfo: { ...prev.companyInfo },
        applicantInfo: { ...prev.applicantInfo },
        inventors: prev.inventors.filter((_, idx) => idx !== index).map((item) => ({ ...item })),
      }
    })
  }

  const handleDocumentUpload = async (fieldName, file) => {
    if (!file) return

    setUploadingField(fieldName)
    try {
      console.group('[PrimaryInvitationForm] handleDocumentUpload')
      console.info('Uploading document', { fieldName, fileName: file.name, size: file.size })
      const response = await uploadPrimaryInvitationFile(token, fieldName, file)
      if (response.success) {
        toast.success(`${fieldName === 'gstCertificate' ? 'GST Certificate' : 'Entity Certificate'} uploaded`)
        setFormData((prev) => ({
          ...prev,
          companyInfo: {
            ...prev.companyInfo,
            [fieldName]: response.data.document
          }
        }))
        clearFieldError('companyInfo', fieldName)
        console.info('Document upload success', response.data.document)
      } else {
        console.warn('Document upload responded with success=false', response)
        toast.error(response.message || 'Upload failed')
      }
    } catch (uploadError) {
      console.error('Error uploading document:', uploadError)
      toast.error(uploadError.message || 'Upload failed')
    } finally {
      console.groupEnd()
      setUploadingField(null)
    }
  }

  const handleViewDocument = async (fieldName) => {
    const documentRecord = formData.companyInfo?.[fieldName]

    if (!documentRecord?.publicId) {
      toast.error('Document not uploaded yet')
      return
    }

    console.group('[PrimaryInvitationForm] handleViewDocument')
    console.info('Generating document link', { token, fieldName })
    setViewingField(fieldName)

    try {
      const response = await primaryInvitationAPI.getDocumentForToken(token, fieldName)

      if (!response.success || !response.data?.url) {
        throw new Error(response.message || 'Unable to generate document link')
      }

      window.open(response.data.url, '_blank', 'noopener')
      console.info('Document opened with signed URL', response.data)
    } catch (viewError) {
      console.error('Error opening document:', viewError)
      toast.error(viewError.message || 'Failed to open document')
    } finally {
      console.groupEnd()
      setViewingField(null)
    }
  }

  const buildPayload = () => ({
    companyInfo: formData.companyInfo,
    applicantInfo: formData.applicantInfo,
    inventors: formData.inventors,
    comments: formData.comments
  })

  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true)
      const payload = buildPayload()
      console.group('[PrimaryInvitationForm] handleSaveDraft')
      console.info('Saving draft with payload', payload)
      const response = await primaryInvitationAPI.saveDraft(token, payload)
      if (response.success) {
        toast.success('Draft saved successfully')
        console.info('Draft save response', response)
      } else {
        console.warn('Save draft success=false', response)
        toast.error(response.message || 'Failed to save draft')
      }
    } catch (saveError) {
      console.error('Error saving primary invitation draft:', saveError)
      toast.error(saveError.message || 'Failed to save draft')
    } finally {
      console.groupEnd()
      setIsSavingDraft(false)
    }
  }

  const handleSubmit = async () => {
    const validationResult = validateForm()

    if (!validationResult.isValid) {
      const firstErrorMessage = extractFirstErrorMessage(validationResult.errors)
      console.warn('[PrimaryInvitationForm] Client-side validation failed', validationResult.errors)
      toast.error(firstErrorMessage)
      return
    }

    console.group('[PrimaryInvitationForm] handleSubmit')
    try {
      setIsSubmitting(true)
      const payload = buildPayload()
      console.info('Submitting payload', payload)
      const response = await primaryInvitationAPI.submit(token, payload)
      if (response.success) {
        toast.success('Form submitted successfully')
        setInvitation((prev) => ({
          ...prev,
          data: {
            ...prev?.data,
            status: 'completed',
            submittedAt: response.data.submittedAt
          }
        }))
        resetValidationErrors(payload.inventors?.length || formData.inventors.length)
        console.info('Submit success response', response)
      } else {
        console.warn('Submit success=false', response)
        toast.error(response.message || 'Failed to submit form')
        if (response.error) {
          applyBackendValidationError(response.error)
        }
      }
    } catch (submitError) {
      console.error('Error submitting primary invitation form:', submitError)
      toast.error(submitError.message || 'Failed to submit form')
      applyBackendValidationError(submitError.message)
    } finally {
      console.groupEnd()
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white -lg shadow-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to access invitation</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">Please contact SITABIENCE IP support to request a new invitation link.</p>
        </div>
      </div>
    )
  }

  const submittedAtDisplay = invitation?.data?.submittedAt
    ? new Date(invitation.data.submittedAt).toLocaleString()
    : null

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-white -lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Primary Invitation Form</h1>
              <p className="text-gray-600 mt-1">Provide your company and inventor details to begin the patent engagement</p>
            </div>
            <div className="mt-4 sm:mt-0 text-sm text-gray-600">
              <p><span className="font-medium text-gray-900">Invitation for:</span> {invitation?.data?.email}</p>
              <p><span className="font-medium text-gray-900">Expires:</span> {new Date(invitation?.data?.expiresAt).toLocaleString()}</p>
              {submittedAtDisplay && (
                <p className="text-green-600 font-medium">Submitted on {submittedAtDisplay}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Company Details */}
          <section className="bg-white -lg shadow-sm border border-gray-200 p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">1. Company Details</h2>
              {isCompanyInfoLocked && (
                <p className="text-sm text-primary-600 mt-1">These details are already on file and cannot be changed.</p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  1 (i) Company Name / Organisation Name
                </label>
                <input
                  type="text"
                  value={formData.companyInfo.name}
                  onChange={(event) => handleCompanyChange('name', event.target.value)}
                  disabled={isCompanyInfoLocked || isCompleted}
                  className={buildInputClasses(Boolean(validationErrors.companyInfo?.name))}
                />
                {validationErrors.companyInfo?.name && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.companyInfo.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  1 (iii) Pin Code
                </label>
                <input
                  type="text"
                  value={formData.companyInfo.pinCode}
                  onChange={(event) => handleCompanyChange('pinCode', event.target.value)}
                  disabled={isCompanyInfoLocked || isCompleted}
                  className={buildInputClasses(Boolean(validationErrors.companyInfo?.pinCode))}
                />
                {validationErrors.companyInfo?.pinCode && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.companyInfo.pinCode}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                1 (ii) Company Address
              </label>
              <textarea
                rows={3}
                value={formData.companyInfo.address}
                onChange={(event) => handleCompanyChange('address', event.target.value)}
                disabled={isCompanyInfoLocked || isCompleted}
                className={buildInputClasses(Boolean(validationErrors.companyInfo?.address))}
              />
              {validationErrors.companyInfo?.address && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.companyInfo.address}</p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  1 (iv) GST Number
                </label>
                <input
                  type="text"
                  value={formData.companyInfo.gstNumber}
                  onChange={(event) => handleCompanyChange('gstNumber', event.target.value)}
                  disabled={isCompanyInfoLocked || isCompleted}
                  className={buildInputClasses(Boolean(validationErrors.companyInfo?.gstNumber))}
                />
                {validationErrors.companyInfo?.gstNumber && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.companyInfo.gstNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entity Type
                </label>
                <select
                  value={formData.companyInfo.entityType}
                  onChange={(event) => handleCompanyChange('entityType', event.target.value)}
                  disabled={isCompanyInfoLocked || isCompleted}
                  className={buildInputClasses(Boolean(validationErrors.companyInfo?.entityType))}
                >
                  <option value="">Select entity type</option>
                  <option value="LLP">LLP</option>
                  <option value="LLC">LLC</option>
                  <option value="Startup">Startup</option>
                  <option value="Pvt Ltd">Pvt Ltd</option>
                  <option value="Other">Other</option>
                </select>
                {validationErrors.companyInfo?.entityType && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.companyInfo.entityType}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <DocumentUploadField
                label="1 (v) GST Certificate"
                fieldName="gstCertificate"
                value={formData.companyInfo.gstCertificate}
                disabled={isCompleted || isCompanyInfoLocked}
                uploadingField={uploadingField}
                onUpload={handleDocumentUpload}
                onView={handleViewDocument}
                viewingField={viewingField}
                error={validationErrors.companyInfo?.gstCertificate}
              />
              <DocumentUploadField
                label="1 (vi) Entity Proof (LLP/LLC/Startup/Pvt Ltd)"
                fieldName="entityCertificate"
                value={formData.companyInfo.entityCertificate}
                disabled={isCompleted || isCompanyInfoLocked}
                uploadingField={uploadingField}
                onUpload={handleDocumentUpload}
                onView={handleViewDocument}
                viewingField={viewingField}
                error={validationErrors.companyInfo?.entityCertificate}
              />
            </div>
          </section>

          {/* Applicant Details */}
          <section className="bg-white -lg shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">2. Applicant Details</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">2 (i) Applicant Name</label>
                <input
                  type="text"
                  value={formData.applicantInfo.name}
                  onChange={(event) => handleApplicantChange('name', event.target.value)}
                  disabled={isCompleted}
                  className="w-full px-3 py-2 border border-gray-300 -md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div className="flex items-center space-x-2 mt-1">
                <input
                  id="sameAsCompany"
                  type="checkbox"
                  checked={formData.applicantInfo.sameAsCompany}
                  disabled={isCompleted}
                  onChange={(event) => {
                    syncApplicantWithCompany(event.target.checked)
                  }}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                />
                <label htmlFor="sameAsCompany" className="text-sm text-gray-700">
                  Applicant address same as company address
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">2 (ii) Applicant Address</label>
              <textarea
                rows={3}
                value={formData.applicantInfo.address}
                onChange={(event) => handleApplicantChange('address', event.target.value)}
                disabled={isCompleted}
                className="w-full px-3 py-2 border border-gray-300 -md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Applicant Pin Code</label>
              <input
                type="text"
                value={formData.applicantInfo.pinCode}
                onChange={(event) => handleApplicantChange('pinCode', event.target.value)}
                disabled={isCompleted}
                className="w-full px-3 py-2 border border-gray-300 -md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
          </section>

          {/* Inventor Details */}
          <section className="bg-white -lg shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">3. Inventor Details</h2>
              {!isCompleted && (
                <button
                  type="button"
                  onClick={addInventor}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  + Add Inventor
                </button>
              )}
            </div>

            <div className="space-y-4">
              {formData.inventors.map((inventor, index) => {
                const inventorErrors = validationErrors.inventors[index] || {}

                return (
                <div key={index} className="border border-gray-200 bg-gray-50 -md p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">Inventor {index + 1}</p>
                    {!isCompleted && formData.inventors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInventor(index)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">3 (i) Name</label>
                      <input
                        type="text"
                        value={inventor.name}
                        onChange={(event) => handleInventorChange(index, 'name', event.target.value)}
                        disabled={isCompleted}
                        className={buildInputClasses(Boolean(inventorErrors.name))}
                      />
                      {inventorErrors.name && (
                        <p className="mt-1 text-xs text-red-600">{inventorErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">3 (iii) Pin Code</label>
                      <input
                        type="text"
                        value={inventor.pinCode}
                        onChange={(event) => handleInventorChange(index, 'pinCode', event.target.value)}
                        disabled={isCompleted}
                        className={buildInputClasses(Boolean(inventorErrors.pinCode))}
                      />
                      {inventorErrors.pinCode && (
                        <p className="mt-1 text-xs text-red-600">{inventorErrors.pinCode}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">3 (ii) Address</label>
                      <textarea
                        rows={2}
                        value={inventor.address}
                        onChange={(event) => handleInventorChange(index, 'address', event.target.value)}
                        disabled={isCompleted}
                        className={buildInputClasses(Boolean(inventorErrors.address))}
                      />
                      {inventorErrors.address && (
                        <p className="mt-1 text-xs text-red-600">{inventorErrors.address}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">3 (iv) Nationality</label>
                      <input
                        type="text"
                        value={inventor.nationality}
                        onChange={(event) => handleInventorChange(index, 'nationality', event.target.value)}
                        disabled={isCompleted}
                        className={buildInputClasses(Boolean(inventorErrors.nationality))}
                      />
                      {inventorErrors.nationality && (
                        <p className="mt-1 text-xs text-red-600">{inventorErrors.nationality}</p>
                      )}
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </section>

          {/* Comments */}
          <section className="bg-white -lg shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">4. Comments</h2>
            <textarea
              rows={4}
              value={formData.comments}
              onChange={(event) => setFormData((prev) => ({ ...prev, comments: event.target.value }))}
              disabled={isCompleted}
              className="w-full px-3 py-2 border border-gray-300 -md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Share any additional details or context you would like our team to know"
            />
          </section>
        </div>

        {!isCompleted && (
          <div className="bg-white -lg shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="text-sm text-gray-500">
              {isSavingDraft && <span>Saving draft...</span>}
            </div>
            <div className="flex items-center space-x-3">
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
                {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
                {isSubmitting ? 'Submitting...' : 'Submit Form'}
              </button>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="bg-green-50 border border-green-200 -lg p-6 text-green-800">
            <h3 className="text-lg font-semibold">Thank you!</h3>
            <p className="mt-1 text-sm">We received your details on {submittedAtDisplay}. Our team will review and connect with you shortly.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const DocumentUploadField = ({
  label,
  fieldName,
  value,
  disabled,
  uploadingField,
  viewingField,
  onUpload,
  onView,
  error,
}) => {
  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      onUpload(fieldName, file)
    }
  }

  const hasError = Boolean(error)
  const hasDocument = Boolean(value?.publicId)
  const isViewing = viewingField === fieldName

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className={`border border-dashed ${hasError ? 'border-red-400 bg-red-50/40' : 'border-gray-300 bg-white'} -md p-4`}>
        {hasDocument ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-700">Document uploaded</p>
            <button
              type="button"
              onClick={() => onView(fieldName)}
              disabled={isViewing}
              className="text-sm text-primary-600 hover:text-primary-700 underline disabled:opacity-50"
            >
              {isViewing ? 'Opening…' : 'View document'}
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No document uploaded yet.</p>
        )}

        {!disabled && (
          <div className="mt-3">
            <label className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium cursor-pointer hover:bg-primary-700">
              <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" />
              {uploadingField === fieldName ? 'Uploading...' : 'Upload'}
            </label>
          </div>
        )}
      </div>
      {hasError && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default PrimaryInvitationForm

