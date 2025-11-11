import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ChartBarIcon,
  PlusIcon,
  ArrowPathIcon,
  EnvelopeOpenIcon,
  CloudArrowDownIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { trackerAPI } from '../services/api'

const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const defaultEmployeeForm = {
  name: '',
  email: '',
  designation: '',
  department: '',
  employeeCode: ''
}

const Tracker = () => {
  const [employees, setEmployees] = useState([])
  const [entries, setEntries] = useState([])
  const [summary, setSummary] = useState({
    totalHoursByEmployee: [],
    effortTypeBreakdown: [],
    dailyTotals: []
  })
  const [settings, setSettings] = useState(null)
  const [settingsDraft, setSettingsDraft] = useState(null)
  const [period, setPeriod] = useState('week')
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employeeId: 'all'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isTriggering, setIsTriggering] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [isAddingEmployee, setIsAddingEmployee] = useState(false)
  const [employeeForm, setEmployeeForm] = useState(defaultEmployeeForm)
  const navigate = useNavigate()

  const logGroup = (label, fn) => {
    console.groupCollapsed(label)
    try {
      fn()
    } finally {
      console.groupEnd()
    }
  }

  const loadEmployees = async () => {
    logGroup('[Tracker][loadEmployees] start', () => {
      console.info('Fetching tracker employees')
    })
    try {
      const response = await trackerAPI.listEmployees()
      const payload = response.data || []
      console.info('[Tracker][loadEmployees] success', {
        count: payload.length,
        employees: payload.map((employee) => ({
          id: employee._id,
          email: employee.email,
          status: employee.status
        }))
      })
      setEmployees(payload)
    } catch (error) {
      console.error('[Tracker][loadEmployees] failed', error)
      toast.error(error.message || 'Failed to load employees')
    }
  }

  const loadEntries = async (appliedFilters = filters) => {
    logGroup('[Tracker][loadEntries] start', () => {
      console.info('Filters', appliedFilters)
    })
    try {
      const params = {}
      if (appliedFilters.startDate) params.startDate = appliedFilters.startDate
      if (appliedFilters.endDate) params.endDate = appliedFilters.endDate
      if (appliedFilters.employeeId && appliedFilters.employeeId !== 'all') {
        params.employeeId = appliedFilters.employeeId
      }

      const response = await trackerAPI.getEntries(params)
      const payload = response.data || []
      console.info('[Tracker][loadEntries] success', {
        count: payload.length,
        firstEntry: payload[0]
      })
      setEntries(payload)
    } catch (error) {
      console.error('[Tracker][loadEntries] failed', error)
      toast.error(error.message || 'Failed to load tracker entries')
    }
  }

  const loadSummary = async (selectedPeriod = period, employeeFilter = filters.employeeId) => {
    logGroup('[Tracker][loadSummary] start', () => {
      console.info('Period', selectedPeriod)
      console.info('Employee filter', employeeFilter)
    })
    try {
      const params = { period: selectedPeriod }
      if (employeeFilter && employeeFilter !== 'all') {
        params.employeeId = employeeFilter
      }
      const response = await trackerAPI.getSummary(params)
      const payload = response.data || {
        totalHoursByEmployee: [],
        effortTypeBreakdown: [],
        dailyTotals: []
      }
      console.info('[Tracker][loadSummary] success', {
        period: selectedPeriod,
        employeeFilter: employeeFilter === 'all' ? 'all' : employeeFilter,
        totals: {
          employees: payload.totalHoursByEmployee?.length || 0,
          effortTypes: payload.effortTypeBreakdown?.length || 0,
          days: payload.dailyTotals?.length || 0
        }
      })
      setSummary(payload)
    } catch (error) {
      console.error('[Tracker][loadSummary] failed', error)
      toast.error(error.message || 'Failed to load tracker summary')
    }
  }

  const loadSettings = async () => {
    console.groupCollapsed('[Tracker][loadSettings] start')
    try {
      const response = await trackerAPI.getSettings()
      setSettings(response.data)
      setSettingsDraft(response.data)
      console.info('[Tracker][loadSettings] success', response.data)
    } catch (error) {
      console.error('[Tracker][loadSettings] failed', error)
      toast.error(error.message || 'Failed to load tracker settings')
    } finally {
      console.groupEnd()
    }
  }

  const initialize = async () => {
    console.groupCollapsed('[Tracker][initialize] start')
    setIsLoading(true)
    await Promise.all([loadEmployees(), loadEntries(), loadSummary(), loadSettings()])
    setIsLoading(false)
    console.info('[Tracker][initialize] completed')
    console.groupEnd()
  }

  useEffect(() => {
    initialize()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      loadEntries(filters)
      loadSummary(period, filters.employeeId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate, filters.employeeId, period])

  const hoursByEmployee = useMemo(() => {
    const map = new Map()
    summary.totalHoursByEmployee.forEach((item) => {
      const key = item.employeeId?.toString?.() ?? item.employeeId
      map.set(key, item)
    })
    return map
  }, [summary.totalHoursByEmployee])

  const handleRefresh = async () => {
    console.groupCollapsed('[Tracker][handleRefresh] manual refresh triggered')
    await initialize()
    toast.success('Tracker data refreshed')
    console.info('[Tracker][handleRefresh] finished refresh')
    console.groupEnd()
  }

  const handleTriggerEmails = async () => {
    console.groupCollapsed('[Tracker][handleTriggerEmails] start')
    console.info('Manual email trigger initiated')
    setIsTriggering(true)
    try {
      const response = await trackerAPI.triggerEmails()
      const triggerSummary = response.data || {}
      toast.success('Tracker reminders triggered successfully')
      if (triggerSummary) {
        const { successful = 0, total = 0 } = triggerSummary
        toast.success(`Emails sent: ${successful}/${total}`)
        console.info('[Tracker][handleTriggerEmails] summary', triggerSummary)
      }
    } catch (error) {
      console.error('[Tracker][handleTriggerEmails] failed', error)
      toast.error(error.message || 'Failed to trigger reminders')
    } finally {
      setIsTriggering(false)
      console.groupEnd()
    }
  }

  const handleEmployeeInput = (field, value) => {
    console.debug('[Tracker][handleEmployeeInput]', { field, value })
    setEmployeeForm((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddEmployee = async (event) => {
    console.groupCollapsed('[Tracker][handleAddEmployee] start')
    event.preventDefault()
    setIsAddingEmployee(true)
    try {
      console.info('Submitting employee form', employeeForm)
      await trackerAPI.addEmployee(employeeForm)
      toast.success('Employee added to tracker')
      setEmployeeForm(defaultEmployeeForm)
      await loadEmployees()
    } catch (error) {
      console.error('[Tracker][handleAddEmployee] failed', error)
      toast.error(error.message || 'Failed to add employee')
    } finally {
      setIsAddingEmployee(false)
      console.groupEnd()
    }
  }

  const handleEmployeeCardClick = (employee) => {
    const employeeId = employee._id?.toString?.() ?? employee._id
    logGroup('[Tracker][handleEmployeeCardClick]', () => {
      console.info('Card clicked', {
        employeeId,
        email: employee.email
      })
    })
    if (!employeeId) {
      console.warn('[Tracker][handleEmployeeCardClick] missing employee id')
      return
    }

    navigate(`/tracker/employee/${employeeId}`)
  }

  const handleEmployeeFilterChange = (event) => {
    const value = event.target.value
    logGroup('[Tracker][handleEmployeeFilterChange]', () => {
      console.info('Dropdown change', { value })
    })
    setFilters((prev) => ({ ...prev, employeeId: value }))
  }

  const handleToggleDay = (day) => {
    console.debug('[Tracker][handleToggleDay]', day)
    setSettingsDraft((prev) => {
      if (!prev) return prev
      const days = new Set(prev.daysActive || [])
      if (days.has(day)) {
        days.delete(day)
      } else {
        days.add(day)
      }
      return {
        ...prev,
        daysActive: Array.from(days).sort(
          (a, b) => dayOptions.indexOf(a) - dayOptions.indexOf(b)
        )
      }
    })
  }

  const handleSettingsChange = (field, value) => {
    console.debug('[Tracker][handleSettingsChange]', { field, value })
    setSettingsDraft((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const handleSaveSettings = async () => {
    console.groupCollapsed('[Tracker][handleSaveSettings] start')
    if (!settingsDraft) return
    setIsSavingSettings(true)
    try {
      const response = await trackerAPI.updateSettings(settingsDraft)
      setSettings(response.data)
      setSettingsDraft(response.data)
      toast.success('Tracker settings updated')
      console.info('[Tracker][handleSaveSettings] success', response.data)
    } catch (error) {
      console.error('[Tracker][handleSaveSettings] failed', error)
      toast.error(error.message || 'Failed to update settings')
    } finally {
      setIsSavingSettings(false)
      console.groupEnd()
    }
  }

  const handleExport = async () => {
    console.groupCollapsed('[Tracker][handleExport] start')
    console.info('Export filters', filters)
    try {
      await trackerAPI.exportEntries({
        startDate: filters.startDate,
        endDate: filters.endDate,
        employeeId: filters.employeeId !== 'all' ? filters.employeeId : undefined
      })
      toast.success('Export started')
      console.info('[Tracker][handleExport] success')
    } catch (error) {
      console.error('[Tracker][handleExport] failed', error)
      toast.error(error.message || 'Failed to export tracker data')
    } finally {
      console.groupEnd()
    }
  }

  const totalEmployees = employees.length
  const activeEmployees = employees.filter((employee) => employee.status === 'active').length
  const totalLoggedHours = summary.totalHoursByEmployee.reduce(
    (acc, item) => acc + (item.totalHours || 0),
    0
  )
  const averageHours = totalEmployees ? (totalLoggedHours / totalEmployees).toFixed(1) : '0.0'

  const maxDailyHours = summary.dailyTotals.reduce(
    (max, item) => Math.max(max, item.totalHours || 0),
    0
  ) || 1

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const aDate = new Date(a.date || a.submittedAt || 0).getTime()
      const bDate = new Date(b.date || b.submittedAt || 0).getTime()
      if (bDate !== aDate) {
        return bDate - aDate
      }
      const aSubmitted = new Date(a.submittedAt || a.updatedAt || 0).getTime()
      const bSubmitted = new Date(b.submittedAt || b.updatedAt || 0).getTime()
      return bSubmitted - aSubmitted
    })
  }, [entries])

  const recentEntries = useMemo(() => sortedEntries.slice(0, 10), [sortedEntries])

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-teal-500 to-emerald-500 p-3 rounded-lg text-white">
              <ChartBarIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Employee Work Tracker</h1>
              <p className="text-sm text-gray-600">
                Monitor daily effort logs, send reminders, and analyze productivity trends.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ArrowPathIcon className="h-5 w-5" />
              Refresh
            </button>
            <button
              onClick={handleTriggerEmails}
              disabled={isTriggering || !activeEmployees}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <EnvelopeOpenIcon className="h-5 w-5" />
              {isTriggering ? 'Sending...' : 'Trigger Reminder'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Employees</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{totalEmployees}</p>
          <p className="text-xs text-gray-400 mt-1">
            {activeEmployees} active, {totalEmployees - activeEmployees} inactive
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Hours Logged</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{totalLoggedHours.toFixed(1)}h</p>
          <p className="text-xs text-gray-400 mt-1">Across selected time period</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Average Hours / Employee</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{averageHours}h</p>
          <p className="text-xs text-gray-400 mt-1">Based on active employees</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Data Export</p>
          <button
            onClick={handleExport}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700"
          >
            <CloudArrowDownIcon className="h-5 w-5" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 xl:col-span-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Daily Productivity</h2>
              <p className="text-sm text-gray-500">
                Logged hours for the selected period ({period})
              </p>
            </div>
            <div className="flex gap-2">
              {['day', 'week', 'month'].map((option) => (
                <button
                  key={option}
                  onClick={() => setPeriod(option)}
                  className={`px-3 py-1 text-sm rounded-lg border ${
                    period === option
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {summary.dailyTotals.length === 0 ? (
              <div className="text-sm text-gray-500">No work entries recorded for this period.</div>
            ) : (
              summary.dailyTotals.map((item) => {
                const width = `${Math.max((item.totalHours / maxDailyHours) * 100, 4)}%`
                const label = new Date(item.date).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })
                return (
                  <div key={item.date} className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{label}</span>
                      <span>{item.totalHours.toFixed(1)}h</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all"
                        style={{ width }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900">Effort Type Breakdown</h2>
          <p className="text-sm text-gray-500 mb-4">
            Distribution of hours by effort category
          </p>
          <div className="space-y-3">
            {summary.effortTypeBreakdown.length === 0 ? (
              <div className="text-sm text-gray-500">
                No effort entries recorded for this period.
              </div>
            ) : (
              summary.effortTypeBreakdown.map((item) => (
                <div key={item.effortType} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.effortType}</p>
                    <p className="text-xs text-gray-500">{item.totalHours.toFixed(1)} hours</p>
                  </div>
                  <div className="text-sm font-semibold text-emerald-600">
                    {Math.round((item.totalHours / (totalLoggedHours || 1)) * 100)}%
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Employees</h2>
              <p className="text-sm text-gray-500">
                Manage tracker recipients and monitor submission activity
              </p>
            </div>
            <button
              onClick={() => setEmployeeForm(defaultEmployeeForm)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <PlusIcon className="h-5 w-5" />
              Add Employee
            </button>
          </div>

          <form onSubmit={handleAddEmployee} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                <input
                  type="text"
                  value={employeeForm.name}
                  onChange={(event) => handleEmployeeInput('name', event.target.value)}
                  placeholder="Employee name"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email *</label>
                <input
                  type="email"
                  value={employeeForm.email}
                  onChange={(event) => handleEmployeeInput('email', event.target.value)}
                  placeholder="employee@example.com"
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Designation</label>
                <input
                  type="text"
                  value={employeeForm.designation}
                  onChange={(event) => handleEmployeeInput('designation', event.target.value)}
                  placeholder="Sr. Associate"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
                <input
                  type="text"
                  value={employeeForm.department}
                  onChange={(event) => handleEmployeeInput('department', event.target.value)}
                  placeholder="Drafting"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Employee Code</label>
                <input
                  type="text"
                  value={employeeForm.employeeCode}
                  onChange={(event) => handleEmployeeInput('employeeCode', event.target.value)}
                  placeholder="EMP-001"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isAddingEmployee}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
              >
                {isAddingEmployee ? 'Adding...' : 'Add Employee'}
              </button>
            </div>
          </form>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {employees.length === 0 ? (
              <div className="text-sm text-gray-500">No employees added yet. Use the form above to invite your team.</div>
            ) : (
              employees.map((employee) => {
                const employeeId = employee._id?.toString?.() ?? employee._id
                const stats = hoursByEmployee.get(employeeId) || {}
                return (
                  <div
                    key={employeeId}
                    onClick={() => handleEmployeeCardClick(employee)}
                    className="border border-gray-200 rounded-lg p-3 cursor-pointer transition-all duration-150 hover:border-emerald-400 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{employee.name || 'Unnamed Employee'}</p>
                        <p className="text-xs text-gray-500">{employee.email}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          employee.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {employee.status}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-600">
                      <div>
                        <p className="text-gray-500">Total Hours</p>
                        <p className="font-semibold text-gray-800">{(stats.totalHours || 0).toFixed(1)}h</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Days Logged</p>
                        <p className="font-semibold text-gray-800">{stats.daysLogged || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Submission</p>
                        <p className="font-semibold text-gray-800">
                          {employee.lastSubmissionAt
                            ? new Date(employee.lastSubmissionAt).toLocaleString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Entries</h2>
              <p className="text-sm text-gray-500">
                Latest submissions from employees. Use filters to narrow down the list or click an employee to view detailed logs.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Cog6ToothIcon className="h-5 w-5" />
              <span>
                Cron: {settings?.cronStatus === 'paused' ? 'Paused' : 'Active'} at {settings?.cronTime || '18:00'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(event) => setFilters((prev) => ({ ...prev, startDate: event.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(event) => setFilters((prev) => ({ ...prev, endDate: event.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Employee</label>
              <select
                value={filters.employeeId}
                onChange={handleEmployeeFilterChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All employees</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name || employee.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {recentEntries.length === 0 ? (
              <div className="text-sm text-gray-500">No entries available for the selected filters.</div>
            ) : (
              recentEntries.map((entry) => (
                <div key={entry._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {entry.employee?.name || 'Unknown'} • {entry.arrivalTime}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      {entry.submittedAt && (
                        <p className="text-xs text-gray-400">
                          Submitted at{' '}
                          {new Date(entry.submittedAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                      {entry.totalHours.toFixed(1)}h
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {entry.entries?.map((item, index) => (
                      <div
                        key={`${entry._id}-${index}`}
                        className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-600"
                      >
                        <div className="flex justify-between font-medium text-gray-800">
                          <span>{item.projectName}</span>
                          <span>{item.hours}h</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="uppercase tracking-wide text-[11px] text-emerald-700">
                            {item.effortType}
                          </span>
                          {item.docketNumber && (
                            <span className="text-[11px] text-gray-500">Docket: {item.docketNumber}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Automation Settings</h2>
            <p className="text-sm text-gray-500">
              Configure the daily cron job that delivers the tracker form to employees.
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              settingsDraft?.cronStatus === 'active'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {settingsDraft?.cronStatus === 'active' ? 'Cron Active' : 'Cron Paused'}
          </span>
        </div>

        {settingsDraft ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Cron Time</label>
                <input
                  type="time"
                  value={settingsDraft.cronTime || '18:00'}
                  onChange={(event) => handleSettingsChange('cronTime', event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Time is interpreted in the configured timezone ({settingsDraft.timezone})
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Timezone</label>
                <input
                  type="text"
                  value={settingsDraft.timezone || ''}
                  onChange={(event) => handleSettingsChange('timezone', event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Asia/Kolkata"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select
                  value={settingsDraft.cronStatus}
                  onChange={(event) => handleSettingsChange('cronStatus', event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Active Weekdays</p>
              <div className="flex flex-wrap gap-2">
                {dayOptions.map((day) => {
                  const isSelected = settingsDraft.daysActive?.includes(day)
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleToggleDay(day)}
                      className={`px-3 py-1 text-sm rounded-full border ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
              >
                {isSavingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Loading scheduler configuration...</div>
        )}
      </div>
    </div>
  )
}

export default Tracker

