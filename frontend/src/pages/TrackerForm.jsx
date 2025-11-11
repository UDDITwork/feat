import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ClockIcon,
  CalendarIcon,
  PlusIcon,
  PaperAirplaneIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { trackerFormAPI } from '../services/api'

const effortTypes = ['Search Report', 'Drafting', 'Drawing', 'Review', 'Internal Meeting', 'Client Meeting']

const createEmptyEntry = () => ({
  projectName: '',
  docketNumber: '',
  effortType: effortTypes[0],
  hours: ''
})

const TrackerForm = () => {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState(null)
  const [arrivalTime, setArrivalTime] = useState('')
  const [entries, setEntries] = useState([createEmptyEntry()])
  const [submissionInfo, setSubmissionInfo] = useState(null)

  useEffect(() => {
    console.groupCollapsed('[TrackerForm][fetchForm] start')
    const fetchForm = async () => {
      try {
        console.info('Fetching tracker form for token', token)
        const response = await trackerFormAPI.getForm(token)
        if (!response.success) {
          console.warn('[TrackerForm][fetchForm] non-success response', response)
          throw new Error(response.message || 'Unable to load tracker form')
        }
        setFormData(response.data)
        setArrivalTime(new Date(response.data.currentDate).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit'
        }))
        console.info('[TrackerForm][fetchForm] success', response.data)
      } catch (error) {
        console.error('[TrackerForm][fetchForm] failed', error)
        toast.error(error.message || 'Failed to load tracker form')
      } finally {
        setLoading(false)
        console.groupEnd()
      }
    }

    fetchForm()
  }, [token])

  const totalHours = useMemo(() => {
    return entries.reduce((sum, entry) => sum + (parseFloat(entry.hours) || 0), 0)
  }, [entries])

  const handleEntryChange = (index, field, value) => {
    console.debug('[TrackerForm][handleEntryChange]', { index, field, value })
    setEntries((prev) =>
      prev.map((entry, idx) =>
        idx === index
          ? {
              ...entry,
              [field]: field === 'hours' ? value.replace(/[^0-9.]/g, '') : value
            }
          : entry
      )
    )
  }

  const handleAddEntry = () => {
    console.info('[TrackerForm][handleAddEntry] adding new effort row')
    setEntries((prev) => [...prev, createEmptyEntry()])
  }

  const handleRemoveEntry = (index) => {
    if (entries.length === 1) return
    console.warn('[TrackerForm][handleRemoveEntry] removing entry', index)
    setEntries((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleNewEntry = () => {
    console.groupCollapsed('[TrackerForm][handleNewEntry] start')
    setSubmissionInfo(null)
    setEntries([createEmptyEntry()])
    setArrivalTime(
      new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      })
    )
    console.info('[TrackerForm][handleNewEntry] form reset for new submission')
    console.groupEnd()
  }

  const validateEntries = () => {
    console.groupCollapsed('[TrackerForm][validateEntries] start')
    for (const entry of entries) {
      if (!entry.projectName.trim()) {
        console.error('[TrackerForm][validateEntries] project name missing', entry)
        throw new Error('Project name is required for every entry.')
      }
      if (!entry.hours) {
        console.error('[TrackerForm][validateEntries] hours missing', entry)
        throw new Error('Hours are required for every entry.')
      }
      const hoursValue = parseFloat(entry.hours)
      if (Number.isNaN(hoursValue) || hoursValue <= 0 || hoursValue > 24) {
        console.error('[TrackerForm][validateEntries] invalid hours', {
          entry,
          hoursValue
        })
        throw new Error('Hours must be between 0 and 24 for every entry.')
      }
    }

    const combinationSet = new Set()
    entries.forEach((entry) => {
      const key = `${entry.projectName.trim().toLowerCase()}|${entry.docketNumber.trim().toLowerCase()}|${entry.effortType}`
      if (combinationSet.has(key)) {
        console.error('[TrackerForm][validateEntries] duplicate effort detected', {
          key,
          entry
        })
        throw new Error('The same effort type cannot be repeated for the same project/docket number.')
      }
      combinationSet.add(key)
    })
    console.info('[TrackerForm][validateEntries] success', { entries: entries.length })
    console.groupEnd()
  }

  const handleSubmit = async (event) => {
    console.groupCollapsed('[TrackerForm][handleSubmit] start')
    event.preventDefault()

    if (!formData) {
      console.error('[TrackerForm][handleSubmit] missing form metadata')
      toast.error('Tracker form metadata is missing.')
      console.groupEnd()
      return
    }

    try {
      validateEntries()
    } catch (error) {
      console.error('[TrackerForm][handleSubmit] validation failed', error)
      toast.error(error.message)
      console.groupEnd()
      return
    }

    setSubmitting(true)
    try {
      const entriesSnapshot = entries.map((entry) => ({
        projectName: entry.projectName.trim(),
        docketNumber: entry.docketNumber.trim(),
        effortType: entry.effortType,
        hours: parseFloat(entry.hours)
      }))

      const payload = {
        arrivalTime,
        weekday: formData.weekday,
        date: formData.currentDate,
        entries: entriesSnapshot
      }

      console.info('[TrackerForm][handleSubmit] prepared payload', payload)
      const response = await trackerFormAPI.submit(token, payload)
      if (!response.success) {
        console.warn('[TrackerForm][handleSubmit] non-success response', response)
        throw new Error(response.message || 'Failed to submit tracker entry')
      }

      const responseData = response.data || {}
      const submissionTimestamp = responseData.submittedAt ? new Date(responseData.submittedAt) : new Date()
      const submissionDate = new Date(responseData.date || formData.currentDate || new Date())
      const formattedDate = submissionDate.toLocaleDateString('en-IN', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
      const formattedTime = submissionTimestamp.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })

      setSubmissionInfo({
        date: submissionDate.toISOString(),
        submittedAt: submissionTimestamp.toISOString(),
        totalHours: responseData.totalHours ?? totalHours,
        entries: entriesSnapshot,
        employeeName: responseData.employee?.name || formData.name,
        employeeEmail: responseData.employee?.email || formData.email
      })

      toast.success(`Thank you for filling the activity tracker for ${formattedDate}. Submitted at ${formattedTime}.`)
      console.info('[TrackerForm][handleSubmit] submission success', {
        formattedDate,
        formattedTime,
        totalHours: responseData.totalHours ?? totalHours
      })
    } catch (error) {
      console.error('[TrackerForm][handleSubmit] failed', error)
      toast.error(error.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
      console.groupEnd()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="flex items-center gap-3 text-emerald-700">
          <ArrowPathIcon className="h-6 w-6 animate-spin" />
          <span className="text-sm font-medium">Preparing tracker form...</span>
        </div>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            Tracker link expired or invalid
          </h1>
          <p className="text-sm text-gray-600">
            Please reach out to your admin so they can share a fresh tracker link.
          </p>
        </div>
      </div>
    )
  }

  if (submissionInfo) {
    const submissionDate = submissionInfo.date ? new Date(submissionInfo.date) : null
    const submissionTime = submissionInfo.submittedAt ? new Date(submissionInfo.submittedAt) : null
    const formattedDate = submissionDate && !Number.isNaN(submissionDate.getTime())
      ? submissionDate.toLocaleDateString('en-IN', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })
      : new Date().toLocaleDateString('en-IN', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })
    const formattedTime = submissionTime && !Number.isNaN(submissionTime.getTime())
      ? submissionTime.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      : new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white shadow-xl border border-emerald-100 rounded-2xl p-8 space-y-8">
          <header className="space-y-2 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-600 font-semibold">
              SITABIENCE IP • Daily Work Tracker
            </p>
            <h1 className="text-3xl font-bold text-gray-900">
              Thank you, {submissionInfo.employeeName || formData.name || 'there'}!
            </h1>
            <p className="text-sm text-gray-600">
              Your activity tracker for <span className="font-semibold text-emerald-700">{formattedDate}</span> was
              recorded at <span className="font-semibold text-emerald-700">{formattedTime}</span>.
            </p>
          </header>

          <section className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 space-y-4 text-emerald-800">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-600">Total Hours</p>
                <p className="text-xl font-semibold">{(submissionInfo.totalHours || 0).toFixed(1)}h</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-600">Effort Items Logged</p>
                <p className="text-xl font-semibold">{submissionInfo.entries?.length || 0}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-600">Submitted By</p>
                <p className="text-sm font-medium">
                  {submissionInfo.employeeName || formData.name || '—'}
                  <br />
                  <span className="text-xs text-emerald-700">{submissionInfo.employeeEmail || formData.email}</span>
                </p>
              </div>
            </div>

            {submissionInfo.entries?.length ? (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-emerald-600">Effort Breakdown</p>
                <div className="space-y-2">
                  {submissionInfo.entries.map((entry, index) => (
                    <div
                      key={`${entry.projectName}-${index}`}
                      className="bg-white border border-emerald-100 rounded-lg px-4 py-3 text-sm text-emerald-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                    >
                      <div>
                        <p className="font-semibold">{entry.projectName}</p>
                        <p className="text-xs text-emerald-700 uppercase tracking-wide">{entry.effortType}</p>
                        {entry.docketNumber && (
                          <p className="text-xs text-emerald-600">Docket: {entry.docketNumber}</p>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-emerald-800">{entry.hours}h</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-xs text-gray-500">
              Need to update your entry? You can submit the tracker again to overwrite today’s log.
            </p>
            <button
              onClick={handleNewEntry}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
            >
              Log another activity
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-xl border border-emerald-100 rounded-2xl p-6 md:p-10 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wider text-emerald-600 font-semibold">
              SITABIENCE IP • Daily Work Tracker
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">
              Hello {formData.name || 'there'},
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">
              Please log today’s efforts across projects so we can keep the tracker up to date.
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-2 text-sm text-emerald-700">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              <span>
                {new Date(formData.currentDate).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              <span>Current time: {new Date(formData.currentDate).toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <PaperAirplaneIcon className="h-5 w-5" />
              <span>Total hours logged today: {totalHours.toFixed(1)}h</span>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arrival Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={arrivalTime}
                required
                onChange={(event) => setArrivalTime(event.target.value)}
                className="w-full md:w-1/3 rounded-lg border border-gray-200 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-6">
              {entries.map((entry, index) => (
                <div key={index} className="bg-white border border-emerald-100 rounded-xl p-4 md:p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-800">
                      Effort Entry #{index + 1}
                    </h3>
                    {entries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEntry(index)}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Project / Docket Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={entry.projectName}
                        onChange={(event) => handleEntryChange(index, 'projectName', event.target.value)}
                        placeholder="Project or docket reference"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Docket Number (optional)
                      </label>
                      <input
                        type="text"
                        value={entry.docketNumber}
                        onChange={(event) => handleEntryChange(index, 'docketNumber', event.target.value)}
                        placeholder="Docket code"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Effort Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={entry.effortType}
                        onChange={(event) => handleEntryChange(index, 'effortType', event.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {effortTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Time Given (hours) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        step="0.25"
                        value={entry.hours}
                        onChange={(event) => handleEntryChange(index, 'hours', event.target.value)}
                        placeholder="e.g. 2.5"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddEntry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-50"
            >
              <PlusIcon className="h-5 w-5" />
              Add Another Effort Entry
            </button>
          </section>

          <section className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-emerald-900">Daily Summary</p>
              <p className="text-xs text-emerald-700">
                Total time logged across all projects today: <strong>{totalHours.toFixed(1)} hours</strong>
              </p>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-5 w-5" />
                  Submit Today’s Tracker
                </>
              )}
            </button>
          </section>
        </form>

        <footer className="text-xs text-gray-500 text-center pt-2">
          Powered by SITABIENCE IP • Need help? Contact mail@sitabienceip.com
        </footer>
      </div>
    </div>
  )
}

export default TrackerForm

