'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createFamilyAction } from '@/app/family/actions'

export default function CreateFamilyForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    try {
      const res = await createFamilyAction(formData)
      if (res?.error) {
        setError(res.error)
        setLoading(false)
      } else {
        // Success! Reload to home dashboard
        router.refresh()
        window.location.href = '/'
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while creating the family.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg text-left leading-relaxed">
          <strong>Notice:</strong> {error}
        </div>
      )}
      <input 
        name="name" 
        placeholder="e.g. The Smiths, Our Home" 
        required
        disabled={loading}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm disabled:opacity-50"
      />
      <button 
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:bg-blue-400 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Creating Family...</span>
          </>
        ) : (
          'Create Family'
        )}
      </button>
    </form>
  )
}
