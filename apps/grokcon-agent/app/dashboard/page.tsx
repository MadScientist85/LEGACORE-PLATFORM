'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Opportunity {
  id: string
  solicitation: string
  title: string
  agency: string
  description?: string
  postedDate: string
  responseDeadline: string
  setValue?: string
  placeOfPerformance?: string
  aiScore?: string
  aiSummary?: string
}

export default function GrokConDashboard() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOpportunities() {
      try {
        const response = await fetch('/apps/grokcon-agent/api/opportunities?limit=10')
        if (!response.ok) throw new Error('Failed to fetch opportunities')
        
        const data = await response.json()
        setOpportunities(data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchOpportunities()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading opportunities...</p>
        </div>
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

  const stats = {
    total: opportunities.length,
    highValue: opportunities.filter(o => parseFloat(o.setValue || '0') > 5000000).length,
    urgentDeadlines: opportunities.filter(o => {
      const daysUntil = Math.floor((new Date(o.responseDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return daysUntil < 30
    }).length,
    avgScore: opportunities.reduce((sum, o) => sum + parseFloat(o.aiScore || '0'), 0) / opportunities.length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                GrokCon Agent
              </h1>
              <p className="text-gray-600 mt-2">AI-Powered Government Contracting Opportunities Platform</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                🤖 AI Enhanced
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-medium">Total Opportunities</h3>
            <p className="text-4xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-medium">High Value ($5M+)</h3>
            <p className="text-4xl font-bold text-green-600 mt-2">{stats.highValue}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-orange-500">
            <h3 className="text-gray-500 text-sm font-medium">Urgent Deadlines</h3>
            <p className="text-4xl font-bold text-orange-600 mt-2">{stats.urgentDeadlines}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-purple-500">
            <h3 className="text-gray-500 text-sm font-medium">Avg AI Score</h3>
            <p className="text-4xl font-bold text-purple-600 mt-2">{stats.avgScore.toFixed(1)}</p>
          </div>
        </div>

        {/* Opportunities List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Top Matched Opportunities</h2>
            <p className="text-blue-100 text-sm mt-1">Sorted by AI relevance score</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {opportunities.map((opp) => {
              const daysUntil = Math.floor((new Date(opp.responseDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              const aiScore = parseFloat(opp.aiScore || '0')
              const scoreColor = aiScore >= 90 ? 'text-green-600 bg-green-50' : aiScore >= 75 ? 'text-blue-600 bg-blue-50' : 'text-gray-600 bg-gray-50'
              
              return (
                <div key={opp.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{opp.title}</h3>
                        <span className={`px-3 py-1 text-sm font-bold rounded-full ${scoreColor}`}>
                          🎯 {aiScore.toFixed(1)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="font-medium">{opp.agency}</span>
                        <span>•</span>
                        <span>{opp.solicitation}</span>
                        {opp.setValue && (
                          <>
                            <span>•</span>
                            <span className="text-green-600 font-semibold">
                              ${parseFloat(opp.setValue).toLocaleString()}
                            </span>
                          </>
                        )}
                      </div>

                      {opp.aiSummary && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3 rounded">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold text-blue-600">AI Summary:</span> {opp.aiSummary}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Posted:</span>{' '}
                          <span className="font-medium">{new Date(opp.postedDate).toLocaleDateString()}</span>
                        </div>
                        <div className={daysUntil < 15 ? 'text-red-600 font-semibold' : ''}>
                          <span className="text-gray-500">Deadline:</span>{' '}
                          <span className="font-medium">{new Date(opp.responseDeadline).toLocaleDateString()}</span>
                          <span className="ml-1">({daysUntil} days)</span>
                        </div>
                        {opp.placeOfPerformance && (
                          <div>
                            <span className="text-gray-500">Location:</span>{' '}
                            <span className="font-medium">{opp.placeOfPerformance}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* AI Features Notice */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">🚀 Future AI Enhancements</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✨ Natural language search powered by AI models</li>
            <li>🎯 Personalized opportunity matching based on capabilities</li>
            <li>📊 Automated proposal generation assistance</li>
            <li>🔔 Intelligent deadline and requirement alerts</li>
            <li>📈 Competitive analysis and win probability predictions</li>
          </ul>
          <p className="text-xs text-gray-500 mt-4">
            Leveraging the shared @hbu/ai package for advanced AI capabilities
          </p>
        </div>
      </div>
    </div>
  )
}
