'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { signout } from '@/app/login/actions'

interface SignOutButtonProps {
  variant?: 'sidebar' | 'button' | 'card'
  className?: string
}

export default function SignOutButton({ variant = 'button', className = '' }: SignOutButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignOut = async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. Clear client-side Supabase session
      try {
        const supabase = createClient()
        await supabase.auth.signOut()
      } catch (e) {
        console.warn('Client signout warning:', e)
      }

      // 2. Clear client document cookies
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';')
        for (const cookie of cookies) {
          const eqPos = cookie.indexOf('=')
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
          if (name.startsWith('sb-') || name.includes('auth-token') || name.includes('supabase')) {
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0`
          }
        }
      }

      // 3. Clear local & session storage
      if (typeof window !== 'undefined') {
        window.localStorage.clear()
        window.sessionStorage.clear()
      }

      // 4. Server-side session & cookie clearance
      try {
        await signout()
      } catch (e) {
        console.warn('Server signout warning:', e)
      }

      // 5. Force hard browser replacement to /login
      window.location.replace('/login')
    } catch (err: unknown) {
      console.error('Logout error:', err)
      window.location.replace('/login')
    }
  }

  if (variant === 'sidebar') {
    return (
      <div className="w-full">
        {error && <p className="text-xs text-red-500 mb-1 px-3">{error}</p>}
        <button
          onClick={handleSignOut}
          disabled={loading}
          className={`w-full p-3 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 flex items-center font-medium transition-colors text-sm disabled:opacity-50 ${className}`}
          aria-label="Sign Out"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-3 text-red-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Signing Out...</span>
            </>
          ) : (
            <>
              <span className="mr-3 text-xl">🚪</span> Sign Out
            </>
          )}
        </button>
      </div>
    )
  }

  return (
    <div>
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
      <button
        onClick={handleSignOut}
        disabled={loading}
        className={`px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 ${className}`}
        aria-label="Sign Out"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Signing Out...</span>
          </>
        ) : (
          <>
            <span>🚪</span> Sign Out
          </>
        )}
      </button>
    </div>
  )
}
