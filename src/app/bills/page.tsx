import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { markBillPaid } from './actions'
import { getActiveFamilyId } from '@/lib/activeFamily'

export default async function BillsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { familyId } = await getActiveFamilyId(user.id)
  const familyMember = familyId ? { family_id: familyId } : null

  if (!familyMember) {
    return (
      <div className="p-4 md:p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Bills</h1>
        <p className="text-gray-500 mb-4">You need to join or create a family first.</p>
        <Link href="/family" className="text-blue-600 underline">Go to Family settings</Link>
      </div>
    )
  }

  // Fetch occurrences with bill info
  const { data: occurrences } = await supabase
    .from('bill_occurrences')
    .select(`
      id, due_date, status,
      recurring_bills!inner (id, name, amount_paise, frequency, family_id)
    `)
    .eq('recurring_bills.family_id', familyMember.family_id)
    .order('due_date', { ascending: true })

  const unpaidBills = occurrences?.filter(o => o.status === 'unpaid') || []
  const paidBills = occurrences?.filter(o => o.status === 'paid') || []

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Monthly Bills</h1>
        <Link href="/bills/add" className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200">
          Add Bill
        </Link>
      </div>

      <section className="mb-8">
        <h2 className="font-semibold text-gray-800 mb-4">Upcoming & Unpaid</h2>
        {unpaidBills.length > 0 ? (
          <div className="space-y-3">
            {unpaidBills.map((occ: any) => (
              <div key={occ.id} className="bg-white rounded-xl shadow-sm border border-red-100 p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded bg-red-50 text-red-500 flex items-center justify-center mr-3 text-lg">
                    🧾
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{occ.recurring_bills.name}</div>
                    <div className="text-xs text-gray-500">
                      Due: {new Date(occ.due_date).toLocaleDateString()} • {occ.recurring_bills.frequency}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900 mb-1">
                    ₹{(occ.recurring_bills.amount_paise / 100).toFixed(2)}
                  </div>
                  <form action={markBillPaid.bind(null, occ.id, occ.due_date, occ.recurring_bills.id, occ.recurring_bills.frequency)}>
                    <button className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 font-medium">
                      Mark Paid
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
            No upcoming bills.
          </div>
        )}
      </section>

      <section>
        <h2 className="font-semibold text-gray-800 mb-4">Recently Paid</h2>
        {paidBills.length > 0 ? (
          <div className="space-y-3 opacity-70">
            {paidBills.map((occ: any) => (
              <div key={occ.id} className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded bg-gray-200 text-gray-500 flex items-center justify-center mr-3 text-sm">
                    ✓
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">{occ.recurring_bills.name}</div>
                    <div className="text-xs text-gray-500">
                      Paid • Due was {new Date(occ.due_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="font-semibold text-gray-600">
                  ₹{(occ.recurring_bills.amount_paise / 100).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
            No paid bills yet.
          </div>
        )}
      </section>
    </div>
  )
}
