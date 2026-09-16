'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function saveBudget(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const familyId = formData.get('family_id') as string
  const monthYear = formData.get('month_year') as string
  
  // Array to hold upsert data
  const upsertData: { family_id: string; month_year: string; category_id: string | null; amount_paise: number }[] = []

  // Total budget
  const totalAmountStr = formData.get('total_amount') as string
  if (totalAmountStr !== null && totalAmountStr !== '') {
    upsertData.push({
      family_id: familyId,
      month_year: monthYear,
      category_id: null,
      amount_paise: Math.round(parseFloat(totalAmountStr) * 100)
    })
  }

  // Category budgets
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('budget_') && value) {
      const categoryId = key.replace('budget_', '')
      const amount = parseFloat(value as string)
      if (!isNaN(amount) && amount > 0) {
        upsertData.push({
          family_id: familyId,
          month_year: monthYear,
          category_id: categoryId,
          amount_paise: Math.round(amount * 100)
        })
      }
    }
  }

  if (upsertData.length > 0) {
    // Delete existing budgets for this month before upserting if we want to clear them? 
    // Upsert is better. But Supabase upsert on uniquely constrained columns works.
    for (const record of upsertData) {
      const { data: existing } = await supabase
        .from('budgets')
        .select('id')
        .eq('family_id', record.family_id)
        .eq('month_year', record.month_year)
        .is('category_id', record.category_id)
        .single()
        
      if (existing) {
        await supabase.from('budgets').update({ amount_paise: record.amount_paise }).eq('id', existing.id)
      } else {
        await supabase.from('budgets').insert(record)
      }
    }
  }

  revalidatePath('/')
  revalidatePath('/budgets')
  redirect('/')
}
