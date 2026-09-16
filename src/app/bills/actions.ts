'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function addBill(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const familyId = formData.get('family_id') as string
  const name = formData.get('name') as string
  const amountStr = formData.get('amount') as string
  const amount_paise = Math.round(parseFloat(amountStr) * 100)
  const frequency = formData.get('frequency') as string // 'monthly', 'yearly', etc.
  const next_due_date = formData.get('next_due_date') as string

  const { data: bill, error: billError } = await supabase
    .from('recurring_bills')
    .insert({
      family_id: familyId,
      name,
      amount_paise,
      frequency,
      next_due_date
    })
    .select()
    .single()

  if (billError) {
    console.error('Error adding bill:', billError)
    throw new Error('Failed to add bill')
  }

  // Create the first occurrence
  await supabase
    .from('bill_occurrences')
    .insert({
      bill_id: bill.id,
      due_date: next_due_date,
      status: 'unpaid'
    })

  revalidatePath('/bills')
  redirect('/bills')
}

export async function markBillPaid(occurrenceId: string, currentDueDate: string, billId: string, frequency: string) {
  const supabase = await createClient()
  
  // Update current occurrence to paid
  const { error } = await supabase
    .from('bill_occurrences')
    .update({ status: 'paid' })
    .match({ id: occurrenceId })

  if (error) {
    console.error('Error marking bill paid:', error)
    throw new Error('Failed to mark as paid')
  }

  if (frequency !== 'one_time') {
    // Calculate next due date
    const date = new Date(currentDueDate)
    if (frequency === 'monthly') {
      date.setMonth(date.getMonth() + 1)
    } else if (frequency === 'yearly') {
      date.setFullYear(date.getFullYear() + 1)
    } else if (frequency === 'weekly') {
      date.setDate(date.getDate() + 7)
    }
    const nextDueDateStr = date.toISOString().split('T')[0]

    // Update bill next due date
    await supabase
      .from('recurring_bills')
      .update({ next_due_date: nextDueDateStr })
      .match({ id: billId })

    // Create next occurrence
    await supabase
      .from('bill_occurrences')
      .insert({
        bill_id: billId,
        due_date: nextDueDateStr,
        status: 'unpaid'
      })
  }

  revalidatePath('/bills')
}
