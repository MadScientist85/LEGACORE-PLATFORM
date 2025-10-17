'use client'

import { useEffect, useState } from 'react'

export default function VivaltLegacyDashboard() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/apps/vivat-legacy/api/cases')
      .then(res => res.json())
      .then(data => { setCases(data.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Vivat Legacy</h1>
        <p className="text-gray-600 mb-8">Estate planning and legacy management solutions</p>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Cases ({cases.length})</h2>
          <div className="space-y-4">
            {cases.map((c: any) => (
              <div key={c.id} className="border-l-4 border-purple-500 pl-4 py-2">
                <div className="font-medium">{c.title}</div>
                <div className="text-sm text-gray-500">{c.caseNumber}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
