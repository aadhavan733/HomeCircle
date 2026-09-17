import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { addGoal } from '../actions'
import { getActiveFamilyId } from '@/lib/activeFamily'

export default async function AddGoalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { familyId } = await getActiveFamilyId(user.id)
  if (!familyId) redirect('/family')

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto bg-white min-h-[calc(100vh-4rem)] md:min-h-0 md:rounded-xl md:shadow-sm md:border md:border-gray-100 md:my-8 z-50 absolute md:relative inset-0 md:inset-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">New Savings Goal</h1>
        <Link href="/goals" className="text-gray-400 hover:text-gray-600 text-2xl">×</Link>
      </div>

      <form action={addGoal} className="space-y-5">
        <input type="hidden" name="family_id" value={familyId} />
        
        {/* Name */}
        <div>
          <label htmlFor="goal-name" className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
          <input 
            id="goal-name"
            name="name"
            type="text" 
            required
            placeholder="e.g. Vacation Fund, New Laptop"
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="goal-target-amount" className="block text-sm font-medium text-gray-700 mb-1">Target Amount (₹)</label>
          <input 
            id="goal-target-amount"
            name="target_amount"
            type="number" 
            step="0.01" 
            min="1"
            required
            placeholder="0.00"
            className="w-full text-3xl font-bold p-3 text-gray-900 placeholder-gray-400 border-b-2 border-gray-200 focus:border-blue-600 focus:outline-none transition-colors"
          />
        </div>

        {/* Target Date */}
        <div>
          <label htmlFor="goal-target-date" className="block text-sm font-medium text-gray-700 mb-1">Target Date (Optional)</label>
          <input 
            id="goal-target-date"
            name="target_date"
            type="date"
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Visibility */}
        <div>
          <label htmlFor="goal-visibility" className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
          <select id="goal-visibility" name="visibility" className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="shared">Shared with Family</option>
            <option value="personal">Personal (Private)</option>
          </select>
        </div>

        <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-sm mt-4">
          Start Saving
        </button>
      </form>
    </div>
  )
}
