'use client'

import { useState, useRef, useEffect } from 'react'

interface Family {
  id: string
  name: string
  role: string
}

interface Props {
  families: Family[]
  activeFamilyId: string
  activeFamilyName: string
}

export default function FamilySwitcher({ families, activeFamilyId, activeFamilyName }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Build the switch URL using window.location so it always uses the current host
  // This is critical for mobile (192.168.x.x:3000) — no fetch() needed
  function getSwitchUrl(familyId: string) {
    const currentPage = typeof window !== 'undefined' ? window.location.pathname : '/'
    return `/api/set-active-family-redirect?familyId=${familyId}&redirect=${currentPage}`
  }

  // Only show switcher if user has multiple families
  if (families.length <= 1) {
    return (
      <div className="text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full truncate max-w-[140px]">
        {activeFamilyName}
      </div>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors max-w-[160px]"
        aria-label="Switch family"
      >
        <span className="truncate">{activeFamilyName}</span>
        <svg
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
          <p className="text-xs text-gray-400 font-medium px-3 pt-3 pb-1 uppercase tracking-wide">Your Families</p>
          {families.map(f => (
            // Use plain <a> tag — no fetch(), no router — just a browser navigation
            // The redirect route sets the cookie then redirects back to the same page
            <a
              key={f.id}
              href={getSwitchUrl(f.id)}
              onClick={() => setOpen(false)}
              className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors block ${f.id === activeFamilyId ? 'bg-blue-50' : ''}`}
            >
              <div>
                <p className={`text-sm font-medium ${f.id === activeFamilyId ? 'text-blue-700' : 'text-gray-900'}`}>
                  {f.name}
                </p>
                <p className="text-xs text-gray-400 capitalize">{f.role}</p>
              </div>
              {f.id === activeFamilyId && (
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
