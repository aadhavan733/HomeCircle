'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createFamilyAction(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'You are not logged in. Please sign in again.' }
  }

  const name = (formData.get('name') as string)?.trim()
  if (!name) {
    return { error: 'Please enter a family name.' }
  }

  // Ensure user profile exists in public.profiles to satisfy foreign key constraints
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member'
    })

  if (profileError) {
    console.error("Profile upsert notice:", profileError.message)
  }

  // 1. Try atomic RPC function first
  const { data: rpcFamilyId, error: rpcError } = await supabase.rpc('create_family_with_defaults', {
    family_name: name
  })

  if (!rpcError && rpcFamilyId) {
    revalidatePath('/', 'layout')
    revalidatePath('/family')
    return { success: true }
  }

  if (rpcError) {
    console.warn("RPC create_family_with_defaults returned error:", rpcError.message)
  }

  // 2. Fallback to direct table inserts
  const { data: family, error: familyError } = await supabase
    .from('families')
    .insert({ name })
    .select('id')
    .single()

  if (familyError || !family) {
    console.error("Error creating family:", familyError)
    return { 
      error: `Database permission error: ${familyError?.message || 'Could not insert family'}. Please run the provided SQL in your Supabase SQL Editor.` 
    }
  }

  // Insert owner into family_members
  const { error: memberError } = await supabase
    .from('family_members')
    .insert({
      family_id: family.id,
      user_id: user.id,
      role: 'owner'
    })

  if (memberError) {
    console.error("Error adding family member:", memberError)
    return { 
      error: `Could not assign owner to family: ${memberError.message}. Please run the SQL fix in Supabase.` 
    }
  }

  // Insert default categories
  const defaultCategories = [
    { family_id: family.id, name: 'Groceries', type: 'expense' },
    { family_id: family.id, name: 'Rent', type: 'expense' },
    { family_id: family.id, name: 'Transport', type: 'expense' },
    { family_id: family.id, name: 'Utilities', type: 'expense' },
    { family_id: family.id, name: 'Salary', type: 'income' },
  ]
  
  await supabase.from('categories').insert(defaultCategories)

  revalidatePath('/', 'layout')
  revalidatePath('/family')
  return { success: true }
}

export async function createFamily(formData: FormData) {
  const result = await createFamilyAction(formData)
  if (result.error) {
    throw new Error(result.error)
  }
  redirect('/family')
}

export async function addFamilyMemberAction(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'You are not logged in.' }

  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const role = (formData.get('role') as string) || 'member'
  const familyId = formData.get('familyId') as string

  if (!email) return { error: 'Please enter an email address.' }
  if (!familyId) return { error: 'Family ID is missing.' }

  // Check caller is owner/admin of this family
  const { data: callerMembership } = await supabase
    .from('family_members')
    .select('role')
    .eq('family_id', familyId)
    .eq('user_id', user.id)
    .single()

  if (!callerMembership || !['owner', 'admin'].includes(callerMembership.role)) {
    return { error: 'You do not have permission to add members.' }
  }

  // Look up the target user's profile by email
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (profileErr || !profile) {
    return { error: `No HomeCircle account found for "${email}". They need to sign up first.` }
  }

  // Check they're not already a member
  const { data: existing } = await supabase
    .from('family_members')
    .select('id')
    .eq('family_id', familyId)
    .eq('user_id', profile.id)
    .single()

  if (existing) {
    return { error: `${email} is already a member of this family.` }
  }

  // Add them
  const { error: insertErr } = await supabase
    .from('family_members')
    .insert({ family_id: familyId, user_id: profile.id, role })

  if (insertErr) {
    return { error: `Could not add member: ${insertErr.message}` }
  }

  revalidatePath('/family')
  return { success: true }
}

export async function removeFamilyMemberAction(familyId: string, memberId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Must be owner/admin, or removing yourself
  const { data: callerMembership } = await supabase
    .from('family_members')
    .select('role')
    .eq('family_id', familyId)
    .eq('user_id', user.id)
    .single()

  if (!callerMembership) return

  const isAdminOrOwner = ['owner', 'admin'].includes(callerMembership.role)
  const isRemovingSelf = memberId === user.id

  if (!isAdminOrOwner && !isRemovingSelf) return

  await supabase
    .from('family_members')
    .delete()
    .eq('family_id', familyId)
    .eq('user_id', memberId)

  revalidatePath('/family')
}

export async function leaveFamily(familyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  const { error } = await supabase
    .from('family_members')
    .delete()
    .match({ family_id: familyId, user_id: user.id })

  if (error) {
    console.error("Error leaving family:", error)
  }

  revalidatePath('/family')
}

export async function updateFamilyNameAction(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in.' }

  const familyId = formData.get('familyId') as string
  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Name cannot be empty.' }

  // Verify caller is owner or admin
  const { data: membership } = await supabase
    .from('family_members')
    .select('role')
    .eq('family_id', familyId)
    .eq('user_id', user.id)
    .single()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return { error: 'Only owners and admins can rename the family.' }
  }

  const { error } = await supabase
    .from('families')
    .update({ name })
    .eq('id', familyId)

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  revalidatePath('/family')
  return { success: true }
}

export async function updateMyNameAction(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in.' }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Name cannot be empty.' }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: name })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  revalidatePath('/family')
  return { success: true }
}

