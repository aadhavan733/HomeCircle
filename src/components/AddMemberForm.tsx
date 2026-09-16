'use client'

import { useState } from 'react'
import { addFamilyMemberAction } from '@/app/family/actions'

interface Props {
  familyId: string
  userRole: string
}

export default function AddMemberForm({ familyId, userRole }: Props) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'member' | 'admin' | 'viewer'>('member')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Only owner/admin can add members
  if (!['owner', 'admin'].includes(userRole)) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.set('email', email)
    formData.set('role', role)
    formData.set('familyId', familyId)

    const res = await addFamilyMemberAction(formData)

    if (res.error) {
      setError(res.error)
    } else {
      setSuccess(`Successfully added ${email} to your family!`)
      setEmail('')
      setRole('member')
      setTimeout(() => {
        setOpen(false)
        setSuccess(null)
        // Refresh the page to show the new member
        window.location.reload()
      }, 1500)
    }
    setLoading(false)
  }

  return (
    <div className="mt-4">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Member
        </button>
      ) : (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Add a Family Member</h3>
          <p className="text-xs text-gray-500 mb-4">
            They must already have a HomeCircle account. Enter their registered email address.
          </p>

          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg font-medium">
              ✓ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. spouse@example.com"
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as 'member' | 'admin' | 'viewer')}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              >
                <option value="member">Member – can add transactions</option>
                <option value="admin">Admin – can manage members</option>
                <option value="viewer">Viewer – read only</option>
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                {loading ? 'Adding...' : 'Add Member'}
              </button>
              <button
                type="button"
                onClick={() => { setOpen(false); setError(null) }}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
