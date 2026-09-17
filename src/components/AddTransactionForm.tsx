'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/lib/db'
import { syncTransactions } from '@/app/transactions/actions'

export default function AddTransactionForm({ 
  familyId, 
  expenses, 
  incomes 
}: { 
  familyId: string, 
  expenses: any[], 
  incomes: any[] 
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [type, setType] = useState('expense')
  const [categoryId, setCategoryId] = useState('')
  const [customCategory, setCustomCategory] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    const amountStr = formData.get('amount') as string
    const amount_paise = Math.round(parseFloat(amountStr) * 100)

    const payload = {
      id: uuidv4(),
      family_id: familyId,
      amount_paise,
      type,
      category_id: categoryId === 'other' ? null : (categoryId || null),
      custom_category_name: categoryId === 'other' ? customCategory.trim() : undefined,
      date: formData.get('date') as string,
      visibility: formData.get('visibility') as string,
      note: formData.get('note') as string,
      sync_status: 'pending' as const,
      created_at: new Date().toISOString()
    }

    try {
      // 1. Save to local IndexedDB
      await db.transactions.add(payload)
      
      // 2. Optimistic navigation back to transactions
      router.push('/transactions')

      // 3. Attempt to sync immediately in background
      try {
        const result = await syncTransactions([payload])
        if (result.success) {
          await db.transactions.update(payload.id, { sync_status: 'synced' })
          await db.transactions.delete(payload.id) // Cleanup synced items
          router.refresh() // Tell NextJS to update the server cache
        }
      } catch (syncErr) {
        console.log('Offline: Transaction saved locally. Will sync later.', syncErr)
      }
      
    } catch (err) {
      console.error(err)
      setError('Failed to save transaction locally.')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>}
      
      {/* Type Selection */}
      <div className="flex p-1 bg-gray-100 rounded-lg">
        <label className="flex-1 text-center cursor-pointer">
          <input type="radio" name="type" value="expense" checked={type === 'expense'} onChange={() => { setType('expense'); setCategoryId(''); setCustomCategory(''); }} className="peer sr-only" />
          <div className="py-2 rounded-md peer-checked:bg-white peer-checked:shadow-sm peer-checked:font-medium text-gray-600 peer-checked:text-gray-900 transition-all">
            Expense
          </div>
        </label>
        <label className="flex-1 text-center cursor-pointer">
          <input type="radio" name="type" value="income" checked={type === 'income'} onChange={() => { setType('income'); setCategoryId(''); setCustomCategory(''); }} className="peer sr-only" />
          <div className="py-2 rounded-md peer-checked:bg-white peer-checked:shadow-sm peer-checked:font-medium text-gray-600 peer-checked:text-gray-900 transition-all">
            Income
          </div>
        </label>
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="tx-amount" className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
        <input 
          id="tx-amount"
          name="amount"
          type="number" 
          step="0.01" 
          min="0.01"
          required
          placeholder="0.00"
          className="w-full text-3xl font-bold p-3 text-gray-900 placeholder-gray-400 border-b-2 border-gray-200 focus:border-blue-600 focus:outline-none transition-colors"
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="tx-category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select 
          id="tx-category"
          name="category_id" 
          value={categoryId} 
          onChange={(e) => setCategoryId(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>Select a category</option>
          {type === 'expense' ? (
            <>
              {expenses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              <option value="other">Other Expense (Add New)</option>
            </>
          ) : (
            <>
              {incomes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              <option value="other">Other Income (Add New)</option>
            </>
          )}
        </select>
      </div>

      {categoryId === 'other' && (
        <div>
          <label htmlFor="tx-custom-category" className="block text-sm font-medium text-gray-700 mb-1">New Category Name</label>
          <input 
            id="tx-custom-category"
            type="text" 
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            required
            placeholder={type === 'expense' ? "e.g. Subscriptions" : "e.g. Freelance"}
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Date */}
      <div>
        <label htmlFor="tx-date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input 
          id="tx-date"
          name="date"
          type="date"
          required
          defaultValue={new Date().toISOString().split('T')[0]}
          className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Visibility */}
      <div>
        <label htmlFor="tx-visibility" className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
        <select id="tx-visibility" name="visibility" className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="shared">Shared with Family</option>
          <option value="personal">Personal (Private)</option>
        </select>
      </div>

      {/* Note */}
      <div>
        <label htmlFor="tx-note" className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
        <textarea 
          id="tx-note"
          name="note"
          rows={2}
          placeholder="What was this for?"
          className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button disabled={isSubmitting} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-sm mt-4 disabled:bg-blue-400">
        {isSubmitting ? 'Saving...' : 'Save Record'}
      </button>
    </form>
  )
}
