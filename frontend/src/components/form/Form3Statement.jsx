import React, { useEffect, useState } from 'react'
import { useForm } from '../../contexts/FormContext'
import { PlusIcon, TrashIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'

const Form3Statement = ({
  formData,
  setFieldValue,
  setNestedFieldValue,
  setArrayFieldValue,
  addArrayItem,
  removeArrayItem
}) => {
  const { errors } = useForm()
  const [autoFetchedFields, setAutoFetchedFields] = useState({})

  const countries = [
    'United States', 'Europe (EPO)', 'United Kingdom', 'Germany', 'France', 'Japan', 'China',
    'Canada', 'Australia', 'South Korea', 'Brazil', 'Russia', 'Switzerland', 'Netherlands',
    'Sweden', 'Israel', 'WIPO (PCT)', 'Others'
  ]

  const applicationStatuses = [
    'Filed',
    'Published',
    'Examination requested',
    'Under examination',
    'Granted',
    'Rejected',
    'Abandoned',
    'Withdrawn'
  ]

  // Auto-fetch from Form 1 (this form is closely tied to Form 1)
  useEffect(() => {
    const autoFetchFromForm1 = () => {
      const fetched = {}

      // Section 1: Applicant Details - Full auto-fetch from Form 1/2
      if (!formData.form3_applicant_name) {
        if (formData.form2_applicant_name) {
          setFieldValue('form3_applicant_name', formData.form2_applicant_name)
          fetched.form3_applicant_name = 'form2'
        } else if (formData.applicants?.[0]?.name_full) {
          setFieldValue('form3_applicant_name', formData.applicants[0].name_full)
          fetched.form3_applicant_name = 'form1'
        }
      }

      if (!formData.form3_applicant_address) {
        if (formData.form2_applicant_address) {
          setFieldValue('form3_applicant_address', formData.form2_applicant_address)
          fetched.form3_applicant_address = 'form2'
        } else if (formData.applicants?.[0]?.address) {
          const addr = formData.applicants[0].address
          const addressParts = [
            addr.house_no,
            addr.village ? `${addr.village},` : '',
            addr.post_office ? `P.O. ${addr.post_office}` : '',
            addr.street,
            [addr.city, addr.state, addr.pin_code].filter(Boolean).join(', '),
            addr.country
          ].filter(Boolean)

          if (addressParts.length > 0) {
            setFieldValue('form3_applicant_address', addressParts.join(', '))
            fetched.form3_applicant_address = 'form1'
          }
        }
      }

      // Section 2: Indian Application Details - Full auto-fetch from Form 1
      if (!formData.form3_indian_application_number && formData.application_number) {
        setFieldValue('form3_indian_application_number', formData.application_number)
        fetched.form3_indian_application_number = 'form1'
      }

      if (!formData.form3_indian_filing_date && formData.filing_date) {
        setFieldValue('form3_indian_filing_date', formData.filing_date)
        fetched.form3_indian_filing_date = 'form1'
      }

      // Section 4: Foreign Applications - Partial auto-fetch from Form 1 Section 8 (Convention)
      if (formData.application_type?.includes('convention') && formData.convention_applications?.length > 0) {
        if (!formData.form3_foreign_applications || formData.form3_foreign_applications.length === 0) {
          const conventionApps = formData.convention_applications.map(app => ({
            country: app.country || '',
            filing_date: app.filing_date || '',
            application_number: app.application_number || '',
            status: 'Filed',
            publication_date: '',
            publication_number: '',
            grant_date: '',
            grant_number: ''
          }))

          setFieldValue('form3_foreign_applications', conventionApps)
          fetched.form3_foreign_applications = 'form1_convention'
        }
      }

      // Section 5: Rights Assignment - Conditional from Form 6
      if (!formData.form3_rights_assigned_to) {
        if (formData.form6_new_applicant_name) {
          setFieldValue('form3_rights_assigned_to', formData.form6_new_applicant_name)
          fetched.form3_rights_assigned_to = 'form6'
        } else if (formData.form2_applicant_name) {
          setFieldValue('form3_rights_assigned_to', formData.form2_applicant_name)
          fetched.form3_rights_assigned_to = 'form2'
        } else if (formData.applicants?.[0]?.name_full) {
          setFieldValue('form3_rights_assigned_to', formData.applicants[0].name_full)
          fetched.form3_rights_assigned_to = 'form1'
        }
      }

      // Section 7: Signature - Conditional auto-fetch from Form 1
      if (!formData.form3_signatory_name && formData.patent_agent?.name) {
        setFieldValue('form3_signatory_name', formData.patent_agent.name)
        fetched.form3_signatory_name = 'agent'
      }

      if (!formData.form3_signatory_designation && formData.patent_agent?.name) {
        setFieldValue('form3_signatory_designation', 'Registered Patent Agent')
        fetched.form3_signatory_designation = 'agent'
      }

      if (!formData.form3_patent_agent_inpa && formData.patent_agent?.inpa_no) {
        setFieldValue('form3_patent_agent_inpa', `IN/PA ${formData.patent_agent.inpa_no}`)
        fetched.form3_patent_agent_inpa = 'form1'
      }

      // Section 8: Addressee - Auto-fetch from Form 1
      if (!formData.form3_office_location && formData.patent_office_location) {
        setFieldValue('form3_office_location', formData.patent_office_location)
        fetched.form3_office_location = 'form1'
      }

      // Default statement date
      if (!formData.form3_statement_date) {
        const today = new Date().toISOString().split('T')[0]
        setFieldValue('form3_statement_date', today)
        fetched.form3_statement_date = 'default'
      }

      setAutoFetchedFields(fetched)
    }

    autoFetchFromForm1()
  }, [])

  const handleChange = (field, value) => {
    setFieldValue(field, value)
  }

  const handleForeignAppChange = (index, field, value) => {
    setArrayFieldValue('form3_foreign_applications', index, field, value)
  }

  const addForeignApplication = () => {
    addArrayItem('form3_foreign_applications', {
      country: '',
      filing_date: '',
      application_number: '',
      status: '',
      publication_date: '',
      publication_number: '',
      grant_date: '',
      grant_number: ''
    })
  }

  const removeForeignApplication = (index) => {
    removeArrayItem('form3_foreign_applications', index)
  }

  const handleFileUpload = (field, event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB')
        return
      }

      const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        alert('Only JPG, PNG, and PDF files are allowed')
        return
      }

      setFieldValue(`${field}_file`, file)
      setFieldValue(`${field}_filename`, file.name)
    }
  }

  const isFieldAutoFetched = (fieldName) => {
    return autoFetchedFields[fieldName] !== undefined
  }

  const getAutoFetchSource = (fieldName) => {
    return autoFetchedFields[fieldName]
  }

  const AutoFetchBadge = ({ source }) => {
    if (!source) return null

    const badgeConfig = {
      form6: { color: 'purple', text: '🔄 From Form 6' },
      form2: { color: 'blue', text: '🔄 From Form 2' },
      form1: { color: 'green', text: '🔄 From Form 1' },
      form1_convention: { color: 'green', text: '🔄 From Form 1 Convention' },
      agent: { color: 'orange', text: '👤 Patent Agent' },
      default: { color: 'gray', text: '📅 Current Date' }
    }

    const config = badgeConfig[source] || { color: 'gray', text: '📥 Auto' }

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium text-${config.color}-700 bg-${config.color}-100 -md ml-2`}>
        {config.text}
      </span>
    )
  }

  const foreignApplications = formData.form3_foreign_applications || []
  const hasForeignApps = formData.form3_foreign_applications_exist

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 -lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Form 3: Statement and Undertaking under Section 8
        </h2>
        <p className="text-sm text-gray-600 mb-1">
          Section 8, Rule 12 of The Patents Act, 1970 & The Patents Rules, 2003
        </p>
        <p className="text-xs text-amber-700 mt-2">
          📋 Mandatory disclosure of foreign patent applications for the same/substantially same invention
        </p>
        <p className="text-xs text-gray-600 mt-1">
          All fields are optional. Most details will auto-populate from Form 1.
        </p>
      </div>

      {/* Section 1: APPLICANT DETAILS */}
      <div className="form-section">
        <h3 className="form-section-title">Section 1: Applicant Details</h3>

        <p className="text-sm text-gray-600 mb-4">
          Applicant information auto-populated from Form 1/2. All fields are optional.
        </p>

        <div className="grid grid-cols-1 gap-6">
          {/* Applicant Name */}
          <div>
            <label className="label">
              Name of Applicant(s)
              <AutoFetchBadge source={getAutoFetchSource('form3_applicant_name')} />
            </label>
            <input
              type="text"
              value={formData.form3_applicant_name || ''}
              onChange={(e) => handleChange('form3_applicant_name', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form3_applicant_name') === 'form2' ? 'bg-blue-50 border-blue-300' :
                getAutoFetchSource('form3_applicant_name') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="e.g., BOREALIS AG"
              maxLength={300}
            />
            {isFieldAutoFetched('form3_applicant_name') && (
              <p className="text-xs text-green-600 mt-1">
                ✅ Auto-populated from Form 1
              </p>
            )}
          </div>

          {/* Applicant Address */}
          <div>
            <label className="label">
              Address of Applicant
              <AutoFetchBadge source={getAutoFetchSource('form3_applicant_address')} />
            </label>
            <textarea
              value={formData.form3_applicant_address || ''}
              onChange={(e) => handleChange('form3_applicant_address', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form3_applicant_address') === 'form2' ? 'bg-blue-50 border-blue-300' :
                getAutoFetchSource('form3_applicant_address') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              rows={3}
              placeholder="Trabrennstrasse 6-8, Austria, 1020 Vienna (AT)"
              maxLength={500}
            />
          </div>
        </div>
      </div>

      {/* Section 2: INDIAN PATENT APPLICATION DETAILS */}
      <div className="form-section">
        <h3 className="form-section-title">Section 2: Indian Patent Application Details</h3>

        <p className="text-sm text-gray-600 mb-4">
          Details of the Indian patent application for which this Form 3 is being filed. Auto-populated from Form 1.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Indian Application Number */}
          <div>
            <label className="label">
              Indian Application Number
              <AutoFetchBadge source={getAutoFetchSource('form3_indian_application_number')} />
            </label>
            <input
              type="text"
              value={formData.form3_indian_application_number || ''}
              onChange={(e) => handleChange('form3_indian_application_number', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form3_indian_application_number') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="e.g., 202517046877"
              maxLength={50}
            />
            {isFieldAutoFetched('form3_indian_application_number') && (
              <p className="text-xs text-green-600 mt-1">
                ✅ Auto-populated from Form 1
              </p>
            )}
          </div>

          {/* Indian Filing Date */}
          <div>
            <label className="label">
              Indian Application Filing Date
              <AutoFetchBadge source={getAutoFetchSource('form3_indian_filing_date')} />
            </label>
            <input
              type="date"
              value={formData.form3_indian_filing_date || ''}
              onChange={(e) => handleChange('form3_indian_filing_date', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form3_indian_filing_date') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
            />
          </div>
        </div>
      </div>

      {/* Section 3: DECLARATION - FOREIGN APPLICATIONS */}
      <div className="form-section bg-blue-50 border border-blue-200 -lg p-6">
        <h3 className="form-section-title">Section 3: Declaration Regarding Foreign Applications</h3>

        <p className="text-sm text-gray-600 mb-4">
          Have you made applications in other countries for the same or substantially the same invention?
        </p>

        <div className="space-y-3">
          <label className="flex items-start p-3 border border-gray-300 -lg bg-white cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="form3_foreign_applications_exist"
              value="yes"
              checked={hasForeignApps === 'yes'}
              onChange={(e) => handleChange('form3_foreign_applications_exist', e.target.value)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 mt-1"
            />
            <span className="ml-3 text-sm text-gray-700">
              <strong>Yes</strong> - I have made applications in other countries
            </span>
          </label>

          <label className="flex items-start p-3 border border-gray-300 -lg bg-white cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="form3_foreign_applications_exist"
              value="no"
              checked={hasForeignApps === 'no'}
              onChange={(e) => handleChange('form3_foreign_applications_exist', e.target.value)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 mt-1"
            />
            <span className="ml-3 text-sm text-gray-700">
              <strong>No</strong> - I have NOT made applications in other countries
            </span>
          </label>
        </div>

        {hasForeignApps === 'no' && (
          <div className="mt-4 p-3 bg-gray-100 border border-gray-300 -lg">
            <p className="text-sm text-gray-700">
              ℹ️ You will still need to sign the undertaking below to inform the Patent Office if any foreign applications are filed in the future.
            </p>
          </div>
        )}
      </div>

      {/* Section 4: FOREIGN APPLICATION DETAILS TABLE */}
      {hasForeignApps === 'yes' && (
        <div className="form-section">
          <div className="flex items-center justify-between mb-4">
            <h3 className="form-section-title">
              Section 4: Foreign Application Details
              {isFieldAutoFetched('form3_foreign_applications') && (
                <AutoFetchBadge source={getAutoFetchSource('form3_foreign_applications')} />
              )}
            </h3>
            <button
              type="button"
              onClick={addForeignApplication}
              className="btn-primary flex items-center text-sm"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Foreign Application
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            List all foreign patent applications for the same or substantially the same invention. All fields are optional.
          </p>

          {foreignApplications.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 -lg border border-gray-200">
              <p className="text-gray-500 mb-4">No foreign applications added yet</p>
              <button
                type="button"
                onClick={addForeignApplication}
                className="btn-primary flex items-center mx-auto"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add First Foreign Application
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">S.No.</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Country</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Filing Date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">App. Number</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Pub. Date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Pub. Number</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Grant Date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Grant Number</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {foreignApplications.map((app, index) => (
                    <tr key={index} className={`${isFieldAutoFetched('form3_foreign_applications') ? 'bg-green-50' : ''}`}>
                      <td className="px-3 py-2 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-3 py-2">
                        <select
                          value={app.country || ''}
                          onChange={(e) => handleForeignAppChange(index, 'country', e.target.value)}
                          className="input-field text-sm"
                        >
                          <option value="">Select</option>
                          {countries.map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="date"
                          value={app.filing_date || ''}
                          onChange={(e) => handleForeignAppChange(index, 'filing_date', e.target.value)}
                          className="input-field text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={app.application_number || ''}
                          onChange={(e) => handleForeignAppChange(index, 'application_number', e.target.value)}
                          className="input-field text-sm"
                          placeholder="App. No."
                          maxLength={50}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={app.status || ''}
                          onChange={(e) => handleForeignAppChange(index, 'status', e.target.value)}
                          className="input-field text-sm"
                        >
                          <option value="">Select</option>
                          {applicationStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="date"
                          value={app.publication_date || ''}
                          onChange={(e) => handleForeignAppChange(index, 'publication_date', e.target.value)}
                          className="input-field text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={app.publication_number || ''}
                          onChange={(e) => handleForeignAppChange(index, 'publication_number', e.target.value)}
                          className="input-field text-sm"
                          placeholder="Pub. No."
                          maxLength={50}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="date"
                          value={app.grant_date || ''}
                          onChange={(e) => handleForeignAppChange(index, 'grant_date', e.target.value)}
                          className="input-field text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={app.grant_number || ''}
                          onChange={(e) => handleForeignAppChange(index, 'grant_number', e.target.value)}
                          className="input-field text-sm"
                          placeholder="Grant No."
                          maxLength={50}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => removeForeignApplication(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {isFieldAutoFetched('form3_foreign_applications') && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 -lg">
              <p className="text-xs text-green-700">
                ✅ Foreign applications auto-populated from Form 1 Convention applications. You can edit or add more.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Section 5: ASSIGNMENT DECLARATION */}
      <div className="form-section">
        <h3 className="form-section-title">Section 5: Rights Assignment Statement</h3>

        <p className="text-sm text-gray-600 mb-4">
          Declare to whom the rights in foreign applications have been assigned (if applicable). All fields are optional.
        </p>

        <div>
          <label className="label">
            Rights in Foreign Applications Assigned To
            <AutoFetchBadge source={getAutoFetchSource('form3_rights_assigned_to')} />
          </label>
          <input
            type="text"
            value={formData.form3_rights_assigned_to || ''}
            onChange={(e) => handleChange('form3_rights_assigned_to', e.target.value)}
            className={`input-field ${
              getAutoFetchSource('form3_rights_assigned_to') === 'form6' ? 'bg-purple-50 border-purple-300' :
              getAutoFetchSource('form3_rights_assigned_to') === 'form2' ? 'bg-blue-50 border-blue-300' :
              getAutoFetchSource('form3_rights_assigned_to') === 'form1' ? 'bg-green-50 border-green-300' : ''
            }`}
            placeholder="e.g., BOREALIS AG"
            maxLength={300}
          />
          <p className="text-xs text-gray-500 mt-1">
            Often same as the Indian applicant. If Form 6 was filed, this auto-fills with the new applicant name.
          </p>
        </div>
      </div>

      {/* Section 6: UNDERTAKING */}
      <div className="form-section bg-indigo-50 border border-indigo-200 -lg p-6">
        <h3 className="form-section-title">Section 6: Undertaking</h3>

        <div className="flex items-start p-4 bg-white border border-gray-300 -lg">
          <input
            type="checkbox"
            checked={formData.form3_undertaking_acknowledged || false}
            onChange={(e) => setFieldValue('form3_undertaking_acknowledged', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300  mt-1"
          />
          <span className="ml-3 text-sm text-gray-800">
            That we undertake that up to the date of grant of the Patent by the Controller, we would keep him informed in writing the details of corresponding Applications for Patents filed outside India in accordance with provisions contained in section 8 and rule 12.
          </span>
        </div>

        <p className="text-xs text-indigo-600 mt-3">
          📝 This is a mandatory undertaking to keep the Patent Office informed of all corresponding foreign applications until the Indian patent is granted.
        </p>
      </div>

      {/* Section 7: DATE AND SIGNATURE */}
      <div className="form-section">
        <h3 className="form-section-title">Section 7: Date and Signature</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Statement Date */}
          <div>
            <label className="label">
              Date of Statement
              <AutoFetchBadge source={getAutoFetchSource('form3_statement_date')} />
            </label>
            <input
              type="date"
              value={formData.form3_statement_date || ''}
              onChange={(e) => handleChange('form3_statement_date', e.target.value)}
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: "Dated this [day] Day of [Month], [Year]"
            </p>
          </div>

          {/* Signatory Name */}
          <div>
            <label className="label">
              Name of Signatory
              <AutoFetchBadge source={getAutoFetchSource('form3_signatory_name')} />
            </label>
            <input
              type="text"
              value={formData.form3_signatory_name || ''}
              onChange={(e) => handleChange('form3_signatory_name', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form3_signatory_name') === 'agent' ? 'bg-orange-50 border-orange-300' : ''
              }`}
              placeholder="Full name of person signing"
              maxLength={200}
            />
          </div>

          {/* Signatory Designation */}
          <div>
            <label className="label">
              Designation
              <AutoFetchBadge source={getAutoFetchSource('form3_signatory_designation')} />
            </label>
            <input
              type="text"
              value={formData.form3_signatory_designation || ''}
              onChange={(e) => handleChange('form3_signatory_designation', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form3_signatory_designation') === 'agent' ? 'bg-orange-50 border-orange-300' : ''
              }`}
              placeholder="e.g., Registered Patent Agent, On behalf of Applicant"
              maxLength={100}
            />
          </div>

          {/* Patent Agent INPA */}
          <div>
            <label className="label">
              Patent Agent Registration Number (if applicable)
              <AutoFetchBadge source={getAutoFetchSource('form3_patent_agent_inpa')} />
            </label>
            <input
              type="text"
              value={formData.form3_patent_agent_inpa || ''}
              onChange={(e) => handleChange('form3_patent_agent_inpa', e.target.value)}
              className={`input-field ${
                getAutoFetchSource('form3_patent_agent_inpa') === 'form1' ? 'bg-green-50 border-green-300' : ''
              }`}
              placeholder="(IN/PA XXXX)"
              maxLength={20}
            />
          </div>
        </div>

        {/* Signature Upload */}
        <div className="mt-6">
          <label className="label">
            Signature Upload
          </label>
          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed -lg hover:border-primary-400 transition-colors">
            <div className="space-y-2 text-center">
              <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white -md font-medium text-primary-600 hover:text-primary-500">
                  <span>Upload signature</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileUpload('form3_signature', e)}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                JPG, PNG, PDF up to 2MB
              </p>
              {formData.form3_signature_filename && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 ">
                  <p className="text-sm text-green-700">
                    ✅ Uploaded: {formData.form3_signature_filename}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 8: ADDRESSEE */}
      <div className="form-section bg-gray-50 border border-gray-300 -lg p-6">
        <h3 className="form-section-title">Section 8: Addressee</h3>

        <div className="space-y-3">
          <div className="flex items-center">
            <label className="label w-40">To:</label>
            <input
              type="text"
              value="The Controller of Patents"
              className="input-field bg-gray-100"
              readOnly
            />
          </div>

          <div className="flex items-center">
            <label className="label w-40">Patent Office:</label>
            <input
              type="text"
              value={formData.form3_office_location || 'Delhi'}
              className={`input-field ${
                getAutoFetchSource('form3_office_location') === 'form1' ? 'bg-green-50 border-green-300' : 'bg-gray-100'
              }`}
              readOnly
            />
            {isFieldAutoFetched('form3_office_location') && (
              <AutoFetchBadge source={getAutoFetchSource('form3_office_location')} />
            )}
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="p-4 bg-amber-50 -lg border border-amber-200">
        <h4 className="text-sm font-medium text-amber-800 mb-2">Form 3 Important Guidelines:</h4>
        <ul className="text-xs text-amber-700 space-y-1">
          <li>• All fields are optional - fill only the information you have available</li>
          <li>• Form 3 must be filed at the time of filing Form 1, or within 6 months from filing date</li>
          <li>• Most fields auto-populate from Form 1 - this form is closely tied to the patent application</li>
          <li>• Foreign applications from Form 1 Convention section auto-populate if applicable</li>
          <li>• The undertaking is mandatory acknowledgment to keep Patent Office informed</li>
          <li>• You must update this form if status of foreign applications changes</li>
          <li>• Failure to disclose foreign applications can result in patent rejection</li>
        </ul>
      </div>
    </div>
  )
}

export default Form3Statement
