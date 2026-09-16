import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { editTransaction } from '../../actions'
import Link from 'next/link'

export default async function EditTransactionPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: txn } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!txn) {
    redirect('/transactions')
  }

  const { data: familyMember } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', user.id)
    .single()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, type')
    .eq('family_id', familyMember?.family_id)

  const expenses = categories?.filter(c => c.type === 'expense') || []
  const incomes = categories?.filter(c => c.type === 'income') || []

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto bg-white min-h-[calc(100vh-4rem)] md:min-h-0 md:rounded-xl md:shadow-sm md:border md:border-gray-100 md:my-8 z-50 absolute md:relative inset-0 md:inset-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Record</h1>
        <Link href="/transactions" className="text-gray-400 hover:text-gray-600 text-2xl">×</Link>
      </div>

      <form action={editTransaction} className="space-y-5">
        <input type="hidden" name="id" value={txn.id} />
        
        {/* Type Selection */}
        <div className="flex p-1 bg-gray-100 rounded-lg">
          <label className="flex-1 text-center cursor-pointer">
            <input type="radio" name="type" value="expense" defaultChecked={txn.type === 'expense'} className="peer sr-only" />
            <div className="py-2 rounded-md peer-checked:bg-white peer-checked:shadow-sm peer-checked:font-medium text-gray-600 peer-checked:text-gray-900 transition-all">
              Expense
            </div>
          </label>
          <label className="flex-1 text-center cursor-pointer">
            <input type="radio" name="type" value="income" defaultChecked={txn.type === 'income'} className="peer sr-only" />
            <div className="py-2 rounded-md peer-checked:bg-white peer-checked:shadow-sm peer-checked:font-medium text-gray-600 peer-checked:text-gray-900 transition-all">
              Income
            </div>
          </label>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
          <input 
            name="amount"
            type="number" 
            step="0.01" 
            min="0.01"
            required
            defaultValue={(txn.amount_paise / 100).toFixed(2)}
            className="w-full text-3xl font-bold p-3 text-gray-900 border-b-2 border-gray-200 focus:border-blue-600 focus:outline-none transition-colors"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select name="category_id" defaultValue={txn.category_id || ''} className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select a category</option>
            <optgroup label="Expenses">
              {expenses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </optgroup>
            <optgroup label="Income">
              {incomes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </optgroup>
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input 
            name="date"
            type="date"
            required
            defaultValue={txn.date}
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
          <select name="visibility" defaultValue={txn.visibility} className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="shared">Shared with Family</option>
            <option value="personal">Personal (Private)</option>
          </select>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
          <textarea 
            name="note"
            rows={2}
            defaultValue={txn.note || ''}
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-sm mt-4">
          Save Changes
        </button>
      </form>
    </div>
  )
}
