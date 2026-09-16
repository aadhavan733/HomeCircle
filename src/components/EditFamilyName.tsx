'use client'

import { useState } from 'react'

interface Props {
  familyId: string
  currentName: string
  updateAction: (formData: FormData) => Promise<{ error?: string; success?: boolean }>
}

export default function EditFamilyName({ familyId, currentName, updateAction }: Props) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(currentName)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!value.trim() || value.trim() === currentName) { setEditing(false); return }
    setSaving(true)
    setError(null)
    const fd = new FormData()
    fd.set('familyId', familyId)
    fd.set('name', value.trim())
    const res = await updateAction(fd)
    if (res.error) {
      setError(res.error)
      setSaving(false)
    } else {
      setSaving(false)
      setEditing(false)
      window.location.reload()
    }
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold text-gray-900">{currentName}</h2>
        <button
          onClick={() => setEditing(true)}
          className="text-gray-400 hover:text-blue-600 transition-colors"
          title="Edit family name"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false) }}
          disabled={saving}
          className="border border-blue-400 rounded-lg px-2 py-1 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? '…' : 'Save'}
        </button>
        <button onClick={() => { setEditing(false); setValue(currentName) }} className="text-xs text-gray-500 hover:text-gray-700">
          Cancel
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
