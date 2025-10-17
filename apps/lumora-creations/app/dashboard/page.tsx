'use client'

import { useEffect, useState } from 'react'

interface Asset {
  id: string
  title: string
  description?: string
  type: string
  filename: string
  filesize?: number
  mimeType?: string
  url?: string
  uploadedBy: {
    name?: string
    email: string
  }
  createdAt: string
}

const typeColors: Record<string, string> = {
  CONTRACT: 'bg-blue-100 text-blue-800',
  INVOICE: 'bg-green-100 text-green-800',
  REPORT: 'bg-purple-100 text-purple-800',
  PROPOSAL: 'bg-yellow-100 text-yellow-800',
  CORRESPONDENCE: 'bg-pink-100 text-pink-800',
  OTHER: 'bg-gray-100 text-gray-800'
}

export default function LumoraCreationsDashboard() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAssets() {
      try {
        const response = await fetch('/apps/lumora-creations/api/assets?limit=50')
        if (!response.ok) throw new Error('Failed to fetch assets')
        
        const data = await response.json()
        setAssets(data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchAssets()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
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
    total: assets.length,
    byType: assets.reduce((acc: Record<string, number>, asset) => {
      acc[asset.type] = (acc[asset.type] || 0) + 1
      return acc
    }, {}),
    totalSize: assets.reduce((sum, asset) => sum + (asset.filesize || 0), 0)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Lumora Creations</h1>
          <p className="text-gray-600 mt-2">Creative agency and digital content production</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Total Assets</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Asset Types</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {Object.keys(stats.byType).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Total Size</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {(stats.totalSize / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Most Common</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {Object.entries(stats.byType).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Creative Assets</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {assets.map((asset) => (
              <div key={asset.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex-1">{asset.title}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${typeColors[asset.type] || typeColors.OTHER}`}>
                    {asset.type}
                  </span>
                </div>
                
                {asset.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {asset.description}
                  </p>
                )}

                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>File:</span>
                    <span className="font-medium">{asset.filename}</span>
                  </div>
                  {asset.filesize && (
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span className="font-medium">
                        {(asset.filesize / 1024).toFixed(2)} KB
                      </span>
                    </div>
                  )}
                  {asset.mimeType && (
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium">{asset.mimeType}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Uploaded by:</span>
                    <span className="font-medium">
                      {asset.uploadedBy.name || asset.uploadedBy.email.split('@')[0]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-medium">
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
