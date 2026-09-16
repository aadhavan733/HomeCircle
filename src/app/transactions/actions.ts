'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function addTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const familyId = formData.get('family_id') as string
  const amountStr = formData.get('amount') as string
  // Convert standard currency to paise (e.g., 250.50 -> 25050)
  const amount_paise = Math.round(parseFloat(amountStr) * 100)
  
  const type = formData.get('type') as string // 'expense' or 'income'
  const category_id = formData.get('category_id') as string
  const date = formData.get('date') as string
  const visibility = formData.get('visibility') as string // 'shared' or 'personal'
  const note = formData.get('note') as string

  const { error } = await supabase
    .from('transactions')
    .insert({
      family_id: familyId,
      user_id: user.id,
      amount_paise,
      type,
      category_id: category_id || null,
      date,
      visibility,
      note
    })

  if (error) {
    console.error('Error adding transaction:', error)
    throw new Error('Failed to add transaction')
  }

  revalidatePath('/transactions')
  redirect('/transactions')
}

export async function editTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id') as string
  const amountStr = formData.get('amount') as string
  const amount_paise = Math.round(parseFloat(amountStr) * 100)
  
  const type = formData.get('type') as string 
  const category_id = formData.get('category_id') as string
  const date = formData.get('date') as string
  const visibility = formData.get('visibility') as string 
  const note = formData.get('note') as string

  // We rely on RLS to ensure only authorized users can update
  const { error } = await supabase
    .from('transactions')
    .update({
      amount_paise,
      type,
      category_id: category_id || null,
      date,
      visibility,
      note
    })
    .match({ id })

  if (error) {
    console.error('Error updating transaction:', error)
    throw new Error('Failed to update transaction')
  }

  revalidatePath('/transactions')
  redirect('/transactions')
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('transactions')
    .delete()
    .match({ id })

  if (error) {
    console.error('Error deleting transaction:', error)
  }

  revalidatePath('/transactions')
}

export async function syncTransactions(payloads: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Process custom categories first
  const sanitizedPayloads = []
  for (const p of payloads) {
    let finalCategoryId = p.category_id

    if (!finalCategoryId && p.custom_category_name) {
      // Check if it already exists to avoid duplicates
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('family_id', p.family_id)
        .eq('name', p.custom_category_name)
        .eq('type', p.type)
        .maybeSingle()
        
      if (existing) {
        finalCategoryId = existing.id
      } else {
        const { data: newCat, error: catError } = await supabase
          .from('categories')
          .insert({
            family_id: p.family_id,
            name: p.custom_category_name,
            type: p.type
          })
          .select('id')
          .single()
          
        if (!catError && newCat) {
          finalCategoryId = newCat.id
        }
      }
    }

    sanitizedPayloads.push({
      id: p.id,
      family_id: p.family_id,
      user_id: user.id, // Force server-side auth identity
      amount_paise: p.amount_paise,
      type: p.type,
      category_id: finalCategoryId || null,
      date: p.date,
      visibility: p.visibility,
      note: p.note,
      is_synced: true,
      created_at: p.created_at
    })
  }

  const { error } = await supabase
    .from('transactions')
    .upsert(sanitizedPayloads, { onConflict: 'id' })

  if (error) {
    console.error('Error syncing transactions:', error)
    return { error: 'Sync failed' }
  }

  revalidatePath('/transactions')
  revalidatePath('/')
  return { success: true }
}
