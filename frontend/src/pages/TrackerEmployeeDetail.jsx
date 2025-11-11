import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeftIcon,
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { trackerAPI } from '../services/api'

const periodOptions = ['day', 'week', 'month']

const TrackerEmployeeDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState(null)
  const [summary, setSummary] = useState({
    totalHoursByEmployee: [],
    effortTypeBreakdown: [],
    dailyTotals: []
  })
  const [entries, setEntries] = useState([])
  const [period, setPeriod] = useState('month')
  const [filters, setFilters] = useState({ startDate: '', endDate: '' })
  const [isLoading, setIsLoading] = useState(true)

  const logGroup = (label, fn) => {
    console.groupCollapsed(label)
    try {
      fn()
    } finally {
      console.groupEnd()
    }
  }

  const loadEmployeeDetail = async (selectedPeriod = period) => {
    if (!id) return
    logGroup('[TrackerEmployeeDetail][loadEmployeeDetail] start', () => {
      console.info('Employee ID', id)
      console.info('Period', selectedPeriod)
    })
    try {
      const response = await trackerAPI.getEmployee(id, { period: selectedPeriod })
      const payload = response.data || {}
      setEmployee(payload.employee || null)
      setSummary(
        payload.summary || {
          totalHoursByEmployee: [],
          effortTypeBreakdown: [],
          dailyTotals: []
        }
      )
      console.info('[TrackerEmployeeDetail][loadEmployeeDetail] success', payload)
    } catch (error) {
      console.error('[TrackerEmployeeDetail][loadEmployeeDetail] failed', error)
      toast.error(error.message || 'Failed to load employee details')
    }
  }

  const loadEntries = async (overrides = {}) => {
    if (!id) return
    const appliedFilters = { ...filters, ...overrides }
    logGroup('[TrackerEmployeeDetail][loadEntries] start', () => {
      console.info('Applied filters', appliedFilters)
    })
    try {
      const params = { employeeId: id }
      if (appliedFilters.startDate) params.startDate = appliedFilters.startDate
      if (appliedFilters.endDate) params.endDate = appliedFilters.endDate

      const response = await trackerAPI.getEntries(params)
      const payload = response.data || []
      console.info('[TrackerEmployeeDetail][loadEntries] success', {
        count: payload.length,
        preview: payload[0]
      })
      setEntries(payload)
    } catch (error) {
      console.error('[TrackerEmployeeDetail][loadEntries] failed', error)
      toast.error(error.message || 'Failed to load employee activity logs')
    }
  }

  useEffect(() => {
    if (!id) return
    const initialize = async () => {
      console.groupCollapsed('[TrackerEmployeeDetail][initialize] start')
      setIsLoading(true)
      try {
        await Promise.all([loadEmployeeDetail(period), loadEntries(filters)])
      } finally {
        setIsLoading(false)
        console.groupEnd()
      }
    }
    initialize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (!id) return
    loadEmployeeDetail(period)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period])

  useEffect(() => {
    if (!id) return
    loadEntries(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate])

  const employeeStats = useMemo(() => {
    if (!summary?.totalHoursByEmployee?.length) {
      return {
        totalHours: 0,
        daysLogged: 0
      }
    }
    const first = summary.totalHoursByEmployee[0]
    return {
      totalHours: first.totalHours || 0,
      daysLogged: first.daysLogged || 0
    }
  }, [summary])

  const flattenedEntries = useMemo(() => {
    return entries
      .flatMap((entry) => {
        if (!entry.entries || entry.entries.length === 0) {
          return [
            {
              key: `${entry._id}-empty`,
              date: entry.date,
              weekday: entry.weekday,
              arrivalTime: entry.arrivalTime,
              projectName: '—',
              docketNumber: '',
              effortType: '—',
              hours: entry.totalHours || 0,
              submittedAt: entry.submittedAt
            }
          ]
        }

        return entry.entries.map((effort, index) => ({
          key: `${entry._id}-${index}`,
          date: entry.date,
          weekday: entry.weekday,
          arrivalTime: entry.arrivalTime,
          projectName: effort.projectName,
          docketNumber: effort.docketNumber,
          effortType: effort.effortType,
          hours: effort.hours,
          submittedAt: entry.submittedAt
        }))
      })
      .sort((a, b) => {
        const aDate = new Date(a.date || 0).getTime()
        const bDate = new Date(b.date || 0).getTime()
        if (bDate !== aDate) return bDate - aDate
        const aSubmitted = new Date(a.submittedAt || 0).getTime()
        const bSubmitted = new Date(b.submittedAt || 0).getTime()
        return bSubmitted - aSubmitted
      })
  }, [entries])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="flex items-center gap-3 text-emerald-700">
          <ArrowPathIcon className="h-6 w-6 animate-spin" />
          <span className="text-sm font-medium">Loading employee tracker details...</span>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold text-gray-900">Employee not found</h1>
          <p className="text-sm text-gray-600">
            We couldn&apos;t locate this employee in the tracker system. Please return to the tracker dashboard.
          </p>
          <button
            onClick={() => navigate('/tracker')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Tracker
          </button>
        </div>
      </div>
    )
  }

  const employeeDisplayName = employee.name || employee.email

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/tracker')}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-gray-600 hover:text-emerald-700 hover:border-emerald-400 transition"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-3 rounded-lg text-white">
                <ChartBarIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{employeeDisplayName}</h1>
                <p className="text-sm text-gray-600">Detailed activity log and insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Total Hours</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{employeeStats.totalHours.toFixed(1)}h</p>
          <p className="text-xs text-gray-400 mt-1">Cumulative hours logged in the selected period</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Days Logged</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{employeeStats.daysLogged}</p>
          <p className="text-xs text-gray-400 mt-1">Unique tracker submissions</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Department</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {employee.metadata?.department || 'Not specified'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Based on employee metadata</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Designation</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{employee.designation || '—'}</p>
          <p className="text-xs text-gray-400 mt-1">Last updated employee profile</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Productivity Overview</h2>
            <p className="text-sm text-gray-500">
              Charts and breakdowns for the selected time window ({period}).
            </p>
          </div>
          <div className="flex gap-2">
            {periodOptions.map((option) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border border-emerald-100 rounded-lg p-4 bg-emerald-50/40">
            <h3 className="text-sm font-semibold text-emerald-800 mb-3">Daily Totals</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {summary.dailyTotals?.length ? (
                summary.dailyTotals.map((item) => (
                  <div key={item.date} className="flex items-center justify-between text-sm text-emerald-900">
                    <span>
                      {new Date(item.date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="font-semibold">{item.totalHours.toFixed(1)}h</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-emerald-700">No activity recorded in this period.</p>
              )}
            </div>
          </div>

          <div className="border border-emerald-100 rounded-lg p-4 bg-emerald-50/40">
            <h3 className="text-sm font-semibold text-emerald-800 mb-3">Effort Breakdown</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {summary.effortTypeBreakdown?.length ? (
                summary.effortTypeBreakdown.map((item) => (
                  <div key={item.effortType} className="flex items-center justify-between text-sm text-emerald-900">
                    <span>{item.effortType}</span>
                    <span className="font-semibold">{item.totalHours.toFixed(1)}h</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-emerald-700">No effort items recorded in this period.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Daily Activity Log</h2>
            <p className="text-sm text-gray-500">
              Detailed breakdown of each effort entry submitted by {employeeDisplayName}.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CalendarIcon className="h-5 w-5" />
            <span>
              Showing {flattenedEntries.length} effort rows ({entries.length} submissions)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({ startDate: '', endDate: '' })
                logGroup('[TrackerEmployeeDetail][clearFilters]', () => {
                  console.info('Cleared employee detail filters')
                })
              }}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Date</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Arrival</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Project / Docket</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Effort Type</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-600">Hours</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Submitted At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {flattenedEntries.length ? (
                flattenedEntries.map((row) => (
                  <tr key={row.key} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-900">
                      <div className="flex flex-col">
                        <span>
                          {new Date(row.date).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="text-xs text-gray-500">{row.weekday}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-700">{row.arrivalTime}</td>
                    <td className="px-4 py-2 text-gray-700">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{row.projectName || '—'}</span>
                        {row.docketNumber && (
                          <span className="text-xs text-gray-500">Docket: {row.docketNumber}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-700 uppercase tracking-wide text-xs">
                      {row.effortType}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-900 font-semibold">{row.hours}h</td>
                    <td className="px-4 py-2 text-gray-500">
                      {row.submittedAt
                        ? new Date(row.submittedAt).toLocaleString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })
                        : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                    No tracker submissions were found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TrackerEmployeeDetail

