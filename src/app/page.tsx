import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getActiveFamilyId } from '@/lib/activeFamily'

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { familyId, familyName, role, allFamilies } = await getActiveFamilyId(user.id)
  const familyMember = familyId ? { family_id: familyId, role } : null
  const profileName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'U'

  if (!familyMember) {
    return (
      <div className="p-4 md:p-8 text-center flex flex-col items-center justify-center h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Welcome to HomeCircle!</h1>
        <p className="text-gray-500 mb-8 max-w-sm">To start tracking your household finances, you need to join or create a family.</p>
        <Link href="/family" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium shadow-sm">Go to Family settings</Link>
      </div>
    )
  }

  // Month handling
  const now = new Date()
  const currentMonthStr = params.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [year, month] = currentMonthStr.split('-').map(Number)
  
  // Create Date objects for filtering
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)
  
  const formattedMonthName = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

  // Fetch Budget
  const { data: budget } = await supabase
    .from('budgets')
    .select('amount_paise')
    .eq('family_id', familyMember.family_id)
    .eq('month_year', currentMonthStr)
    .is('category_id', null)
    .single()

  const totalBudgetPaise = budget?.amount_paise || 0

  // Fetch Transactions for the month
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount_paise, type, visibility, user_id, categories(name)')
    .eq('family_id', familyMember.family_id)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])

  let totalIncomePaise = 0
  let totalExpensePaise = 0
  const categorySpending: Record<string, number> = {}

  if (transactions) {
    transactions.forEach(txn => {
      // Filter out personal transactions not owned by user (though RLS already does this)
      if (txn.visibility === 'personal' && txn.user_id !== user.id) return

      if (txn.type === 'income') {
        totalIncomePaise += txn.amount_paise
      } else {
        totalExpensePaise += txn.amount_paise
        const catObj = Array.isArray(txn.categories) ? txn.categories[0] : txn.categories
        const catName = catObj?.name || 'Uncategorized'
        categorySpending[catName] = (categorySpending[catName] || 0) + txn.amount_paise
      }
    })
  }

  const budgetRemainingPaise = Math.max(0, totalBudgetPaise - totalExpensePaise)
  const spentPercentage = totalBudgetPaise > 0 ? Math.min(100, (totalExpensePaise / totalBudgetPaise) * 100) : 0

  // Sort categories by highest spending
  const topCategories = Object.entries(categorySpending).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Fetch upcoming bills due within 10 days
  const today = new Date()
  const in10Days = new Date(today)
  in10Days.setDate(today.getDate() + 10)
  const todayStr = today.toISOString().split('T')[0]
  const in10DaysStr = in10Days.toISOString().split('T')[0]

  const { data: upcomingBills } = await supabase
    .from('recurring_bills')
    .select('id, name, amount_paise, next_due_date, frequency')
    .eq('family_id', familyMember.family_id)
    .gte('next_due_date', todayStr)
    .lte('next_due_date', in10DaysStr)
    .order('next_due_date', { ascending: true })

  // Previous and Next month links
  const prevMonthDate = new Date(year, month - 2, 1)
  const nextMonthDate = new Date(year, month, 1)
  const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`
  const nextMonthStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`



  return (
    <div className="px-4 pb-4 pt-0 md:p-8">
      <header className="mb-3 flex justify-center items-center">
        <div className="flex items-center gap-3">
          <Link href={`/?month=${prevMonthStr}`} className="text-gray-400 hover:text-gray-700">◀</Link>
          <h1 className="text-3xl font-bold min-w-[140px] text-center">{formattedMonthName}</h1>
          <Link href={`/?month=${nextMonthStr}`} className="text-gray-400 hover:text-gray-700">▶</Link>
        </div>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6 relative">
        <Link href={`/budgets?month=${currentMonthStr}`} className="absolute top-2 right-2 p-3 text-gray-400 hover:text-gray-700 flex items-center justify-center min-w-[44px] min-h-[44px]" title="Set Budget">
          <span className="text-lg">✏️</span>
        </Link>
        
        {totalBudgetPaise > 0 ? (
          <>
            <h2 className="text-sm font-medium text-gray-500 mb-1">Budget Remaining</h2>
            <div className={`text-3xl font-bold mb-4 ${budgetRemainingPaise === 0 ? 'text-red-500' : 'text-gray-900'}`}>
              ₹{(budgetRemainingPaise / 100).toFixed(2)}
            </div>
            
            <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden flex">
              <div className={`h-3 transition-all ${spentPercentage > 90 ? 'bg-red-500' : spentPercentage > 75 ? 'bg-yellow-500' : 'bg-blue-600'}`} style={{ width: `${spentPercentage}%` }}></div>
            </div>
          </>
        ) : (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">No budget set for this month.</p>
            <Link href={`/budgets?month=${currentMonthStr}`} className="text-blue-600 text-sm font-medium hover:underline">Set a monthly budget</Link>
          </div>
        )}
        
        <div className="flex justify-between text-xs text-gray-500 mt-4 pt-4 border-t border-gray-50">
          <div>
            <span className="block mb-1">Spent</span>
            <span className="font-semibold text-gray-900 text-sm">₹{(totalExpensePaise / 100).toFixed(2)}</span>
          </div>
          <div className="text-right">
            <span className="block mb-1">Income</span>
            <span className="font-semibold text-green-600 text-sm">₹{(totalIncomePaise / 100).toFixed(2)}</span>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <div className="flex justify-between items-end mb-3">
          <h2 className="font-semibold text-gray-800">Top Category Spending</h2>
          <Link href={`/analytics?month=${currentMonthStr}`} className="text-xs text-blue-600 hover:underline">View Analytics 📈</Link>
        </div>
        {topCategories.length > 0 ? (
          <div className="space-y-2">
            {topCategories.map(([name, amount]) => (
              <div key={name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="font-medium text-gray-700">{name}</div>
                </div>
                <div className="font-semibold text-gray-900">₹{(amount / 100).toFixed(2)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
            No expenses recorded this month.
          </div>
        )}
      </section>
      
      {/* Upcoming Bills — due within 10 days */}
      <section className="mb-6">
        <div className="flex justify-between items-end mb-3">
          <h2 className="font-semibold text-gray-800">Upcoming Bills</h2>
          <Link href="/bills" className="text-xs text-blue-600 hover:underline">View all</Link>
        </div>

        {upcomingBills && upcomingBills.length > 0 ? (
          <div className="space-y-2">
            {upcomingBills.map((bill) => {
              const dueDate = new Date(bill.next_due_date + 'T00:00:00')
              const diffDays = Math.ceil((dueDate.getTime() - today.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24))
              const isToday = diffDays === 0
              const isTomorrow = diffDays === 1
              const isUrgent = diffDays <= 3

              const dueDateLabel = isToday
                ? 'Due Today'
                : isTomorrow
                ? 'Due Tomorrow'
                : `Due in ${diffDays} days`

              return (
                <div key={bill.id} className={`bg-white rounded-xl shadow-sm border p-4 flex items-center justify-between ${
                  isToday ? 'border-red-200' : isUrgent ? 'border-orange-200' : 'border-gray-100'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                      isToday ? 'bg-red-50' : isUrgent ? 'bg-orange-50' : 'bg-yellow-50'
                    }`}>
                      🧾
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{bill.name}</p>
                      <p className={`text-xs font-medium ${
                        isToday ? 'text-red-600' : isUrgent ? 'text-orange-500' : 'text-gray-400'
                      }`}>
                        {dueDateLabel} · {dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">₹{(bill.amount_paise / 100).toFixed(2)}</p>
                    <p className="text-xs text-gray-400 capitalize">{bill.frequency}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-5 text-center">
            <p className="text-sm text-gray-500">No bills due in the next 10 days 🎉</p>
            <Link href="/bills" className="text-xs text-blue-600 hover:underline mt-1 block">Manage bills</Link>
          </div>
        )}
      </section>
    </div>
  )
}
