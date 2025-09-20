import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { 
  ChartBarIcon, 
  DocumentTextIcon,
  UsersIcon,
  EnvelopeIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const Analytics = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    completedSubmissions: 0,
    pendingSubmissions: 0,
    draftSubmissions: 0,
    totalClients: 0,
    invitationsSent: 0,
    completionRate: 0,
    avgCompletionTime: 0
  })
  const [monthlyData, setMonthlyData] = useState([])
  const [statusDistribution, setStatusDistribution] = useState([])
  const [topClients, setTopClients] = useState([])

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // In a real app, this would be an API call
      // For now, using mock data
      setTimeout(() => {
        const mockStats = {
          totalSubmissions: 156,
          completedSubmissions: 89,
          pendingSubmissions: 34,
          draftSubmissions: 33,
          totalClients: 42,
          invitationsSent: 203,
          completionRate: 57.1,
          avgCompletionTime: 4.2
        }

        const mockMonthlyData = [
          { month: 'Jan', submissions: 12, completed: 8, invitations: 18 },
          { month: 'Feb', submissions: 15, completed: 11, invitations: 22 },
          { month: 'Mar', submissions: 18, completed: 13, invitations: 25 },
          { month: 'Apr', submissions: 22, completed: 16, invitations: 28 },
          { month: 'May', submissions: 19, completed: 14, invitations: 24 },
          { month: 'Jun', submissions: 25, completed: 18, invitations: 31 },
          { month: 'Jul', submissions: 28, completed: 21, invitations: 35 },
          { month: 'Aug', submissions: 31, completed: 24, invitations: 38 },
          { month: 'Sep', submissions: 27, completed: 20, invitations: 33 },
          { month: 'Oct', submissions: 24, completed: 17, invitations: 29 },
          { month: 'Nov', submissions: 21, completed: 15, invitations: 26 },
          { month: 'Dec', submissions: 18, completed: 13, invitations: 23 }
        ]

        const mockStatusDistribution = [
          { status: 'Completed', count: 89, percentage: 57.1, color: 'bg-green-500' },
          { status: 'Pending', count: 34, percentage: 21.8, color: 'bg-yellow-500' },
          { status: 'Draft', count: 33, percentage: 21.1, color: 'bg-blue-500' }
        ]

        const mockTopClients = [
          { name: 'TechCorp Solutions', submissions: 8, completionRate: 87.5 },
          { name: 'Innovate Inc', submissions: 6, completionRate: 83.3 },
          { name: 'MedTech Innovations', submissions: 5, completionRate: 80.0 },
          { name: 'Green Energy Co', submissions: 4, completionRate: 75.0 },
          { name: 'StartupXYZ', submissions: 3, completionRate: 66.7 }
        ]

        setStats(mockStats)
        setMonthlyData(mockMonthlyData)
        setStatusDistribution(mockStatusDistribution)
        setTopClients(mockTopClients)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to fetch analytics data')
      setLoading(false)
    }
  }

  const getTrendIcon = (current, previous) => {
    if (current > previous) {
      return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
    } else if (current < previous) {
      return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
    }
    return <ClockIcon className="h-4 w-4 text-gray-500" />
  }

  const getTrendColor = (current, previous) => {
    if (current > previous) return 'text-green-600'
    if (current < previous) return 'text-red-600'
    return 'text-gray-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="gradient-bg p-3 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600">Track your patent application performance and insights</p>
            </div>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
              <div className="flex items-center mt-1">
                {getTrendIcon(156, 142)}
                <span className={`text-sm font-medium ml-1 ${getTrendColor(156, 142)}`}>
                  +9.9%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
              <div className="flex items-center mt-1">
                {getTrendIcon(42, 38)}
                <span className={`text-sm font-medium ml-1 ${getTrendColor(42, 38)}`}>
                  +10.5%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <EnvelopeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Invitations Sent</p>
              <p className="text-2xl font-bold text-gray-900">{stats.invitationsSent}</p>
              <div className="flex items-center mt-1">
                {getTrendIcon(203, 187)}
                <span className={`text-sm font-medium ml-1 ${getTrendColor(203, 187)}`}>
                  +8.6%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
              <div className="flex items-center mt-1">
                {getTrendIcon(57.1, 54.2)}
                <span className={`text-sm font-medium ml-1 ${getTrendColor(57.1, 54.2)}`}>
                  +2.9%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
          <div className="space-y-4">
            {monthlyData.slice(-6).map((data, index) => (
              <div key={data.month} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 w-12">{data.month}</span>
                <div className="flex-1 mx-4">
                  <div className="flex space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full" 
                        style={{ width: `${(data.submissions / 35) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(data.completed / 25) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-600 w-20">
                  <div>{data.submissions}</div>
                  <div className="text-green-600">{data.completed}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center mt-4 space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary-600 rounded mr-1"></div>
              Submissions
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-600 rounded mr-1"></div>
              Completed
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Status</h3>
          <div className="space-y-4">
            {statusDistribution.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 ${item.color} rounded-full mr-3`}></div>
                  <span className="text-sm font-medium text-gray-700">{item.status}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{item.count}</div>
                  <div className="text-xs text-gray-500">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Total</span>
              <span>{stats.totalSubmissions}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Clients */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Clients</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topClients.map((client, index) => (
                <tr key={client.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">{index + 1}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.submissions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.completionRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${client.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{client.completionRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <ArrowTrendingUpIcon className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm text-green-800">Completion rate improved by 2.9%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <UsersIcon className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm text-blue-800">4 new clients this month</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">Average completion time: 4.2 days</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
          <div className="space-y-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>Follow up:</strong> 12 pending submissions haven't been updated in 7+ days
              </p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <p className="text-sm text-indigo-800">
                <strong>Engagement:</strong> Send reminders to 8 clients with draft submissions
              </p>
            </div>
            <div className="p-3 bg-teal-50 rounded-lg">
              <p className="text-sm text-teal-800">
                <strong>Growth:</strong> Consider expanding services to renewable energy sector
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
