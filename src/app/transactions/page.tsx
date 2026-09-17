import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { deleteTransaction } from './actions'
import { getActiveFamilyId } from '@/lib/activeFamily'
 
export const dynamic = 'force-dynamic'

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  // Get user's active family
  const { familyId, role } = await getActiveFamilyId(user.id)
  const familyMember = familyId ? { family_id: familyId, role } : null

  if (!familyMember) {
    return (
      <div className="p-4 md:p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Transactions</h1>
        <p className="text-gray-500 mb-4">You need to join or create a family first.</p>
        <Link href="/family" className="text-blue-600 underline">Go to Family settings</Link>
      </div>
    )
  }

  // Build query
  let query = supabase
    .from('transactions')
    .select('*, categories(name, type), profiles(full_name)')
    .eq('family_id', familyMember.family_id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (params.filter === 'personal') {
    query = query.eq('visibility', 'personal').eq('user_id', user.id)
  } else if (params.filter === 'shared') {
    query = query.eq('visibility', 'shared')
  }

  const { data: transactions } = await query

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Link 
          href="/transactions" 
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${!params.filter ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          All
        </Link>
        <Link 
          href="/transactions?filter=shared" 
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${params.filter === 'shared' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Shared
        </Link>
        <Link 
          href="/transactions?filter=personal" 
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${params.filter === 'personal' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Personal
        </Link>
      </div>

      {transactions && transactions.length > 0 ? (
        <div className="space-y-4">
          {transactions.map((txn: any) => (
            <div key={txn.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 text-lg ${txn.type === 'expense' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {txn.type === 'expense' ? '💸' : '💰'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {txn.categories?.name || 'Uncategorized'}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <span>{new Date(txn.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{txn.profiles?.full_name || 'Someone'}</span>
                      {txn.visibility === 'personal' && (
                        <>
                          <span>•</span>
                          <span className="bg-gray-200 px-1 rounded">Personal</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${txn.type === 'expense' ? 'text-gray-900' : 'text-green-600'}`}>
                    {txn.type === 'expense' ? '-' : '+'}₹{(txn.amount_paise / 100).toFixed(2)}
                  </div>
                  
                  {/* Edit/Delete buttons (only if owner of txn or admin) */}
                  {(txn.user_id === user.id || familyMember.role === 'owner' || familyMember.role === 'admin') && (
                    <div className="flex justify-end gap-3 mt-1">
                      <Link href={`/transactions/edit/${txn.id}`} className="text-xs text-blue-500 hover:underline">Edit</Link>
                      <form action={deleteTransaction.bind(null, txn.id)}>
                        <button className="text-xs text-red-500 hover:underline">Delete</button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
              {txn.note && (
                <div className="mt-2 pl-13 text-sm text-gray-600">
                  {txn.note}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
          <p className="text-gray-500">No transactions found.</p>
          <p className="text-sm text-gray-400 mt-1">Tap the + button to add one.</p>
        </div>
      )}
    </div>
  )
}
