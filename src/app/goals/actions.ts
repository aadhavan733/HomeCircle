'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function addGoal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const familyId = formData.get('family_id') as string
  const name = formData.get('name') as string
  const targetStr = formData.get('target_amount') as string
  const target_amount_paise = Math.round(parseFloat(targetStr) * 100)
  const target_date = formData.get('target_date') as string
  const visibility = formData.get('visibility') as string

  const { error } = await supabase
    .from('savings_goals')
    .insert({
      family_id: familyId,
      user_id: user.id,
      name,
      target_amount_paise,
      target_date: target_date || null,
      visibility
    })

  if (error) {
    console.error('Error adding goal:', error)
    throw new Error('Failed to add goal')
  }

  revalidatePath('/goals')
  redirect('/goals')
}

export async function addContribution(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const goalId = formData.get('goal_id') as string
  const amountStr = formData.get('amount') as string
  const amount_paise = Math.round(parseFloat(amountStr) * 100)

  const { error } = await supabase
    .from('goal_contributions')
    .insert({
      goal_id: goalId,
      user_id: user.id,
      amount_paise,
      date: new Date().toISOString().split('T')[0]
    })

  if (error) {
    console.error('Error adding contribution:', error)
    throw new Error('Failed to add contribution')
  }

  revalidatePath('/goals')
  redirect('/goals')
}
