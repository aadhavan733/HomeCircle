import { NextRequest, NextResponse } from 'next/server'
import { setActiveFamilyCookie } from '@/lib/activeFamily'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { familyId } = await req.json()
  if (!familyId) return NextResponse.json({ error: 'familyId required' }, { status: 400 })

  // Verify the user actually belongs to this family
  const { data: membership } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', user.id)
    .eq('family_id', familyId)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'Not a member of this family' }, { status: 403 })
  }

  await setActiveFamilyCookie(familyId)
  return NextResponse.json({ ok: true })
}
