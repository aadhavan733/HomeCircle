'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function GlobalFab() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Define where the FAB should be visible
  // It shouldn't show on form pages like /transactions/add, /family, /login, etc.
  // Define where the FAB should be visible
  const allowedPaths = ['/', '/transactions', '/bills', '/goals', '/budgets', '/family']
  const isAllowed = allowedPaths.includes(pathname)

  if (!isAllowed) return null

  return (
    <>
      {/* Backdrop for closing when clicking outside - must be outside transformed parent */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity" 
          onClick={() => setOpen(false)}
        />
      )}

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:bottom-8 md:left-auto md:right-8 md:translate-x-0 z-50 flex flex-col items-center md:items-end">
        {open && (
          <div className="flex flex-col gap-3 mb-4 items-center md:items-end animate-in slide-in-from-bottom-5 fade-in duration-200 z-10">
          <Link
            href="/goals/add"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-lg text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-colors border border-gray-100"
          >
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-lg">🎯</div>
            <span>Add Goal</span>
          </Link>
          <Link
            href="/bills/add"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-lg text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors border border-gray-100"
          >
            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-lg">🧾</div>
            <span>Add Bill</span>
          </Link>
          <Link
            href="/transactions/add"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-gray-100"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg">💸</div>
            <span>Add Transaction</span>
          </Link>
        </div>
      )}
      
        <button
          onClick={() => setOpen(!open)}
          className={`w-14 h-14 rounded-full shadow-lg text-3xl flex items-center justify-center transition-all duration-300 z-10 border-4 border-white ${open ? 'rotate-45 bg-gray-700 text-white hover:bg-gray-800' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          aria-label="Add options"
        >
          +
        </button>
      </div>
    </>
  )
}
