import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { addContribution } from './actions'
import { getActiveFamilyId } from '@/lib/activeFamily'
 
export const dynamic = 'force-dynamic'

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { familyId } = await getActiveFamilyId(user.id)
  const familyMember = familyId ? { family_id: familyId } : null

  if (!familyMember) {
    return (
      <div className="p-4 md:p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Savings Goals</h1>
        <p className="text-gray-500 mb-4">You need to join or create a family first.</p>
        <Link href="/family" className="text-blue-600 underline">Go to Family settings</Link>
      </div>
    )
  }

  // Fetch Goals and their Contributions
  const { data: goals } = await supabase
    .from('savings_goals')
    .select(`
      *,
      goal_contributions(amount_paise)
    `)
    .eq('family_id', familyMember.family_id)

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Savings Goals</h1>
        <Link href="/goals/add" className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200">
          New Goal
        </Link>
      </div>

      <div className="space-y-4">
        {goals && goals.length > 0 ? (
          goals.map((goal: any) => {
            const totalContributed = goal.goal_contributions.reduce((sum: number, c: any) => sum + c.amount_paise, 0)
            const percentage = Math.min(100, Math.round((totalContributed / goal.target_amount_paise) * 100))
            const isCompleted = totalContributed >= goal.target_amount_paise

            return (
              <div key={goal.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{goal.name}</h3>
                    <p className="text-xs text-gray-500">
                      Target: ₹{(goal.target_amount_paise / 100).toFixed(2)} 
                      {goal.target_date ? ` by ${new Date(goal.target_date).toLocaleDateString()}` : ''}
                      {goal.visibility === 'personal' && ' • Personal'}
                    </p>
                  </div>
                  <div className={`font-bold text-lg ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                    {percentage}%
                  </div>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
                  <div className={`h-3 ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${percentage}%` }}></div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">₹{(totalContributed / 100).toFixed(2)}</span>
                    <span className="text-gray-500"> saved</span>
                  </div>
                  
                  {!isCompleted && (
                    <form action={addContribution} className="flex gap-2">
                      <input type="hidden" name="goal_id" value={goal.id} />
                      <input 
                        name="amount"
                        type="number" 
                        step="0.01" 
                        min="0.01"
                        placeholder="Amt"
                        required
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button className="px-3 py-1 bg-gray-900 text-white text-sm rounded hover:bg-gray-800">
                        Add
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
            <p className="text-gray-500">No savings goals set.</p>
            <p className="text-sm text-gray-400 mt-1">Start saving for your next big goal!</p>
          </div>
        )}
      </div>
    </div>
  )
}
