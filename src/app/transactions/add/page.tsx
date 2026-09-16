import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AddTransactionForm from '@/components/AddTransactionForm'
import { getActiveFamilyId } from '@/lib/activeFamily'

export default async function AddTransactionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { familyId } = await getActiveFamilyId(user.id)
  if (!familyId) redirect('/family')

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, type')
    .eq('family_id', familyId)

  const expenses = categories?.filter(c => c.type === 'expense') || []
  const incomes = categories?.filter(c => c.type === 'income') || []

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto bg-white min-h-[calc(100vh-4rem)] md:min-h-0 md:rounded-xl md:shadow-sm md:border md:border-gray-100 md:my-8 z-50 absolute md:relative inset-0 md:inset-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add Record</h1>
        <Link href="/transactions" className="text-gray-400 hover:text-gray-600 text-2xl">×</Link>
      </div>

      <AddTransactionForm 
        familyId={familyId!}
        expenses={expenses}
        incomes={incomes}
      />
    </div>
  )
}
