import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getActiveFamilyId } from '@/lib/activeFamily'
import IncomeExpenseChart from '@/components/charts/IncomeExpenseChart'
import CategorySpendingChart from '@/components/charts/CategorySpendingChart'
import SpendingTrendChart from '@/components/charts/SpendingTrendChart'
import AnalyticsFilters from '@/components/AnalyticsFilters'

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; view?: string; date?: string; start?: string; end?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { familyId } = await getActiveFamilyId(user.id)
  if (!familyId) redirect('/')

  // Date and View handling
  const view = params.view || 'monthly'
  let startDate: Date
  let endDate: Date
  let formattedLabel = ''
  
  // Backwards compatibility with ?month=YYYY-MM if it exists
  let refDate = new Date()
  if (params.month) {
    const [y, m] = params.month.split('-').map(Number)
    refDate = new Date(y, m - 1, 1)
  } else if (params.date) {
    refDate = new Date(params.date)
  }

  if (view === 'yearly') {
    const year = refDate.getFullYear()
    startDate = new Date(year, 0, 1)
    endDate = new Date(year, 11, 31)
    formattedLabel = `${year}`
  } else if (view === 'weekly') {
    // get Monday to Sunday
    const day = refDate.getDay() || 7 // make sunday 7
    startDate = new Date(refDate)
    startDate.setDate(startDate.getDate() - day + 1)
    endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 6)
    formattedLabel = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  } else if (view === 'custom' && params.start && params.end) {
    startDate = new Date(params.start)
    endDate = new Date(params.end)
    formattedLabel = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  } else {
    // default to monthly
    const year = refDate.getFullYear()
    const month = refDate.getMonth()
    startDate = new Date(year, month, 1)
    endDate = new Date(year, month + 1, 0)
    formattedLabel = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  // Fetch Transactions for the selected period
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount_paise, type, visibility, user_id, categories(name)')
    .eq('family_id', familyId)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])

  let totalIncomePaise = 0
  let totalExpensePaise = 0
  const categorySpending: Record<string, number> = {}

  if (transactions) {
    transactions.forEach(txn => {
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

  // Prepare category data for charts
  const categoryChartData = Object.entries(categorySpending).map(([name, value]) => ({ name, value }))

  // Fetch historical data for trends ONLY IF not custom view
  let trendData: { month: string; spent: number }[] = []
  
  if (view !== 'custom') {
    let trendStartDate: Date
    const trendDataMap = new Map<string, number>()
    
    if (view === 'yearly') {
      // Last 5 years
      const endYear = endDate.getFullYear()
      trendStartDate = new Date(endYear - 4, 0, 1)
      for (let i = 4; i >= 0; i--) {
        trendDataMap.set(`${endYear - i}`, 0)
      }
    } else if (view === 'weekly') {
      // Last 6 weeks
      trendStartDate = new Date(startDate)
      trendStartDate.setDate(trendStartDate.getDate() - 35) // 5 weeks ago + current week = 6 weeks
      
      for (let i = 5; i >= 0; i--) {
        const wkStart = new Date(startDate)
        wkStart.setDate(wkStart.getDate() - (i * 7))
        const wkEnd = new Date(wkStart)
        wkEnd.setDate(wkEnd.getDate() + 6)
        const label = `${wkStart.getDate()} ${wkStart.toLocaleDateString('en-US', {month: 'short'})}`
        trendDataMap.set(label, 0)
      }
    } else {
      // Last 6 months
      const year = endDate.getFullYear()
      const month = endDate.getMonth()
      trendStartDate = new Date(year, month - 5, 1)
      
      for (let i = 5; i >= 0; i--) {
        const d = new Date(year, month - i, 1)
        const label = d.toLocaleDateString('en-US', { month: 'short' })
        trendDataMap.set(label, 0)
      }
    }

    const { data: trendTransactions } = await supabase
      .from('transactions')
      .select('amount_paise, type, date, user_id, visibility')
      .eq('family_id', familyId)
      .gte('date', trendStartDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])

    if (trendTransactions) {
      trendTransactions.forEach(txn => {
        if (txn.visibility === 'personal' && txn.user_id !== user.id) return
        if (txn.type === 'expense') {
          const txnDate = new Date(txn.date)
          let label = ''
          
          if (view === 'yearly') {
            label = `${txnDate.getFullYear()}`
          } else if (view === 'weekly') {
            // Find which week bucket it falls into
            for (const [key] of trendDataMap.entries()) {
              // Extract the day and month from label to find the bucket
              // Simplification: We map the transaction back to the Monday of its week
              const day = txnDate.getDay() || 7
              const mon = new Date(txnDate)
              mon.setDate(mon.getDate() - day + 1)
              const monLabel = `${mon.getDate()} ${mon.toLocaleDateString('en-US', {month: 'short'})}`
              if (monLabel === key) {
                label = key
                break
              }
            }
          } else {
            label = txnDate.toLocaleDateString('en-US', { month: 'short' })
          }

          if (label && trendDataMap.has(label)) {
            trendDataMap.set(label, trendDataMap.get(label)! + txn.amount_paise)
          }
        }
      })
    }
    
    trendData = Array.from(trendDataMap.entries()).map(([k, v]) => ({ month: k, spent: v }))
  }

  // Return statement below


  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <Link href="/" className="text-gray-400 hover:text-gray-700 text-2xl font-bold">×</Link>
      </header>
      
      <AnalyticsFilters />
      
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-gray-800">{formattedLabel}</h2>
      </div>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="font-semibold text-gray-800">Income vs Expense</h3>
        <IncomeExpenseChart income={totalIncomePaise} expense={totalExpensePaise} />
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="font-semibold text-gray-800">Spending by Category</h3>
        <CategorySpendingChart data={categoryChartData} />
      </section>

      {view !== 'custom' && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <h3 className="font-semibold text-gray-800">
            {view === 'yearly' ? 'Yearly Spending Trend' : view === 'weekly' ? 'Weekly Spending Trend' : 'Monthly Spending Trend'}
          </h3>
          <SpendingTrendChart data={trendData} />
        </section>
      )}
    </div>
  )
}
