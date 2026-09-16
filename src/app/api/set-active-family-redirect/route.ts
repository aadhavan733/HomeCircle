import { NextRequest, NextResponse } from 'next/server'
import { setActiveFamilyCookie } from '@/lib/activeFamily'
import { createClient } from '@/utils/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', req.url))

  const familyId = req.nextUrl.searchParams.get('familyId')
  const redirectTo = req.nextUrl.searchParams.get('redirect') || '/'

  if (familyId) {
    // Verify membership
    const { data: membership } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .eq('family_id', familyId)
      .single()

    if (membership) {
      await setActiveFamilyCookie(familyId)
    }
  }

  return NextResponse.redirect(new URL(redirectTo, req.url))
}
