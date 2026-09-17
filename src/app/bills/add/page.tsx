import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { addBill } from '../actions'
import { getActiveFamilyId } from '@/lib/activeFamily'

export default async function AddBillPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { familyId, role } = await getActiveFamilyId(user.id)
  if (!familyId) redirect('/family')
  
  // Optional: Add an explicit UI guard for role if needed, though usually admin/owner can add bills
  if (role !== 'owner' && role !== 'admin') {
    return (
      <div className="p-4 md:p-8 text-center mt-10">
        <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-4">Only family owners and admins can add new recurring bills.</p>
        <Link href="/bills" className="text-blue-600 hover:underline">Return to Bills</Link>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto bg-white min-h-[calc(100vh-4rem)] md:min-h-0 md:rounded-xl md:shadow-sm md:border md:border-gray-100 md:my-8 z-50 absolute md:relative inset-0 md:inset-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add Recurring Bill</h1>
        <Link href="/bills" className="text-gray-400 hover:text-gray-600 text-2xl">×</Link>
      </div>

      <form action={addBill} className="space-y-5">
        <input type="hidden" name="family_id" value={familyId} />
        
        {/* Name */}
        <div>
          <label htmlFor="bill-name" className="block text-sm font-medium text-gray-700 mb-1">Bill Name</label>
          <input 
            id="bill-name"
            name="name" 
            type="text" 
            required
            placeholder="e.g. Electricity, Netflix"
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="bill-amount" className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
          <input 
            id="bill-amount"
            name="amount"
            type="number" 
            step="0.01" 
            min="0.01"
            required
            placeholder="0.00"
            className="w-full text-3xl font-bold p-3 text-gray-900 placeholder-gray-400 border-b-2 border-gray-200 focus:border-blue-600 focus:outline-none transition-colors"
          />
        </div>

        {/* Frequency */}
        <div>
          <label htmlFor="bill-frequency" className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
          <select id="bill-frequency" name="frequency" className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="one_time">One Time</option>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {/* Next Due Date */}
        <div>
          <label htmlFor="bill-next-due-date" className="block text-sm font-medium text-gray-700 mb-1">Next Due Date</label>
          <input 
            id="bill-next-due-date"
            name="next_due_date"
            type="date"
            required
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-sm mt-4">
          Save Bill
        </button>
      </form>
    </div>
  )
}
