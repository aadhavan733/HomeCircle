import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { saveBudget } from './actions'
import { getActiveFamilyId } from '@/lib/activeFamily'

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { familyId } = await getActiveFamilyId(user.id)
  if (!familyId) redirect('/family')

  const now = new Date()
  const currentMonth = params.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  // Fetch all categories for the family
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('family_id', familyId)
    .eq('type', 'expense')
    .order('name')

  // Fetch all budgets for this month
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*')
    .eq('family_id', familyId)
    .eq('month_year', currentMonth)

  const totalBudget = budgets?.find(b => b.category_id === null)
  const categoryBudgets = budgets?.filter(b => b.category_id !== null) || []

  // Fetch spending for this month to show usage
  const [year, month] = currentMonth.split('-').map(Number)
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount_paise, category_id, type')
    .eq('family_id', familyId)
    .eq('type', 'expense')
    .gte('date', startDate)
    .lte('date', endDate)

  const spentByCategory: Record<string, number> = {}
  let totalSpent = 0
  if (transactions) {
    transactions.forEach(txn => {
      totalSpent += txn.amount_paise
      if (txn.category_id) {
        spentByCategory[txn.category_id] = (spentByCategory[txn.category_id] || 0) + txn.amount_paise
      }
    })
  }

  const totalProgress = totalBudget && totalBudget.amount_paise > 0 
    ? Math.min(100, (totalSpent / totalBudget.amount_paise) * 100) 
    : 0

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto bg-white min-h-[calc(100vh-4rem)] md:min-h-0 md:rounded-xl md:shadow-sm md:border md:border-gray-100 md:my-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Budget</h1>
        <Link href="/" className="text-gray-400 hover:text-gray-600 text-2xl">×</Link>
      </div>

      <form action={saveBudget} className="space-y-8">
        <input type="hidden" name="family_id" value={familyId!} />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Month</label>
          <input 
            type="month" 
            name="month_year"
            defaultValue={currentMonth}
            required
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#149c77]"
          />
        </div>

        {/* Total Budget Section */}
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
          <label className="block text-sm font-semibold text-gray-900 mb-1">Total Monthly Budget</label>
          <p className="text-xs text-gray-500 mb-3">Your overall spending limit.</p>
          <div className="relative">
            <span className="absolute left-4 top-3 text-gray-500 font-medium">₹</span>
            <input 
              name="total_amount"
              type="number" 
              step="0.01" 
              min="0"
              defaultValue={totalBudget ? (totalBudget.amount_paise / 100).toFixed(2) : ''}
              placeholder="0.00"
              className="w-full text-2xl font-bold p-3 pl-8 text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:border-[#149c77] focus:outline-none"
            />
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Spent: ₹{(totalSpent / 100).toFixed(2)}</span>
              <span className={`font-semibold ${totalProgress > 100 ? 'text-red-500' : 'text-gray-600'}`}>
                {totalProgress.toFixed(0)}% Used
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden flex">
              <div 
                className={`h-2 transition-all ${totalProgress > 100 ? 'bg-red-500' : totalProgress > 80 ? 'bg-orange-400' : 'bg-[#149c77]'}`} 
                style={{ width: `${Math.min(100, totalProgress)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Category Budgets */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Limits</h2>
          <div className="space-y-4">
            {categories?.map(category => {
              const catBudget = categoryBudgets.find(b => b.category_id === category.id)
              const catSpent = spentByCategory[category.id] || 0
              const progress = catBudget && catBudget.amount_paise > 0 
                ? (catSpent / catBudget.amount_paise) * 100 
                : 0
              const isOver = progress > 100

              return (
                <div key={category.id} className="p-4 border border-gray-100 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">{category.name}</span>
                    <div className="flex items-center gap-1 w-32">
                      <span className="text-gray-500 text-sm">₹</span>
                      <input 
                        name={`budget_${category.id}`}
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={catBudget ? (catBudget.amount_paise / 100).toFixed(2) : ''}
                        placeholder="Limit"
                        className="w-full p-1 text-right text-sm border-b border-gray-200 focus:border-[#149c77] focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-1.5 transition-all ${isOver ? 'bg-red-500' : 'bg-[#149c77]'}`} 
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                    <span className={`text-xs w-20 text-right ${isOver ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                      ₹{(catSpent / 100).toFixed(0)} spent
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <button className="w-full py-4 bg-[#149c77] text-white rounded-xl font-bold text-lg hover:bg-[#107e69] shadow-sm mt-8 sticky bottom-4">
          Save All Budgets
        </button>
      </form>
    </div>
  )
}
