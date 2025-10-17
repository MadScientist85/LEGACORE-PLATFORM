'use client'

import { useEffect, useState } from 'react'

interface MetricSummary {
  name: string
  values: Array<{ period: string; value: number }>
  total: number
  avg: number
}

export default function AurelianDigitalDashboard() {
  const [metrics, setMetrics] = useState<MetricSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch('/apps/aurelian-digital/api/analytics?limit=100')
        if (!response.ok) throw new Error('Failed to fetch analytics')
        
        const data = await response.json()
        setMetrics(data.aggregated || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Aurelian Digital</h1>
          <p className="text-gray-600 mt-2">Digital transformation and technology consulting</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {metrics.slice(0, 3).map((metric) => (
            <div key={metric.name} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium uppercase">
                {metric.name.replace(/_/g, ' ')}
              </h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {metric.avg.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">Average across {metric.values.length} periods</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Analytics Overview</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {metrics.map((metric) => (
                <div key={metric.name} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {metric.name.replace(/_/g, ' ').toUpperCase()}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-medium">{metric.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Average:</span>
                      <span className="font-medium">{metric.avg.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Data Points:</span>
                      <span className="font-medium">{metric.values.length}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-xs font-medium text-gray-500 mb-2">Recent Periods</h4>
                    <div className="space-y-1">
                      {metric.values.slice(0, 3).map((v, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-gray-500">{v.period}</span>
                          <span className="font-medium">{v.value.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
