'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function AnalyticsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentView = searchParams.get('view') || 'monthly'
  const currentDate = searchParams.get('date') || new Date().toISOString().split('T')[0]
  const currentStart = searchParams.get('start') || ''
  const currentEnd = searchParams.get('end') || ''

  const [view, setView] = useState(currentView)
  const [customStart, setCustomStart] = useState(currentStart)
  const [customEnd, setCustomEnd] = useState(currentEnd)

  const applyFilters = (newView: string, customS?: string, customE?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', newView)
    
    // Clear old month param if it exists (legacy)
    params.delete('month')

    if (newView === 'custom') {
      if (customS) params.set('start', customS)
      if (customE) params.set('end', customE)
    } else {
      params.delete('start')
      params.delete('end')
      // keep date param if exists, otherwise set to today
      if (!params.get('date')) {
        params.set('date', new Date().toISOString().split('T')[0])
      }
    }
    
    router.push(`/analytics?${params.toString()}`)
  }

  const handleViewChange = (v: string) => {
    setView(v)
    if (v !== 'custom') {
      applyFilters(v)
    }
  }

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      applyFilters('custom', customStart, customEnd)
    }
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const d = new Date(currentDate)
    if (currentView === 'weekly') {
      d.setDate(d.getDate() + (direction === 'next' ? 7 : -7))
    } else if (currentView === 'monthly') {
      d.setMonth(d.getMonth() + (direction === 'next' ? 1 : -1))
    } else if (currentView === 'yearly') {
      d.setFullYear(d.getFullYear() + (direction === 'next' ? 1 : -1))
    }
    
    const params = new URLSearchParams(searchParams.toString())
    params.set('date', d.toISOString().split('T')[0])
    router.push(`/analytics?${params.toString()}`)
  }

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6">
      <div className="flex flex-wrap gap-2 mb-4">
        {['weekly', 'monthly', 'yearly', 'custom'].map((v) => (
          <button
            key={v}
            onClick={() => handleViewChange(v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              view === v 
                ? 'bg-[#149c77] text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {view === 'custom' ? (
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
            <input 
              type="date" 
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#149c77]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
            <input 
              type="date" 
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#149c77]"
            />
          </div>
          <button 
            onClick={handleCustomApply}
            className="px-4 py-2 bg-[#149c77] text-white rounded-lg text-sm font-medium hover:bg-[#107e69]"
          >
            Apply
          </button>
        </div>
      ) : (
        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
          <button onClick={() => navigateDate('prev')} className="p-2 text-gray-500 hover:text-gray-800">◀</button>
          <span className="font-semibold text-gray-700">
            {/* The actual label will be rendered by the server component to stay perfectly in sync, 
                this is just a placeholder or we leave it empty and let server render it above */}
             Use arrows to change period
          </span>
          <button onClick={() => navigateDate('next')} className="p-2 text-gray-500 hover:text-gray-800">▶</button>
        </div>
      )}
    </div>
  )
}
