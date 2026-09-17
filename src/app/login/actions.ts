'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error('Login error:', error.message)
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('full_name') as string,
      }
    }
  }

  const { data: { session }, error } = await supabase.auth.signUp(data)

  if (error) {
    console.error('Signup error:', error.message)
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  if (!session) {
    redirect('/login?message=' + encodeURIComponent('Please check your email to confirm your account (or disable Email Confirmations in Supabase Auth settings).'))
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signout() {
  const cookieStore = await cookies()
  const supabase = await createClient()
  await supabase.auth.signOut()

  const allCookies = cookieStore.getAll()
  for (const cookie of allCookies) {
    if (cookie.name.startsWith('sb-') || cookie.name.includes('auth-token') || cookie.name.includes('supabase')) {
      cookieStore.delete(cookie.name)
    }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
