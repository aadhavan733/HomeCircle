import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

const COOKIE_NAME = 'active_family_id'

/**
 * Get the active family_id for the current user.
 * Falls back to their first membership if cookie is not set or is stale.
 * Returns null if the user has no families.
 */
export async function getActiveFamilyId(userId: string): Promise<{
  familyId: string | null
  familyName: string | null
  role: string | null
  allFamilies: { id: string; name: string; role: string }[]
}> {
  const supabase = await createClient()
  const cookieStore = await cookies()

  // Fetch ALL families the user belongs to
  const { data: memberships } = await supabase
    .from('family_members')
    .select('family_id, role, families(id, name)')
    .eq('user_id', userId)

  if (!memberships || memberships.length === 0) {
    return { familyId: null, familyName: null, role: null, allFamilies: [] }
  }

  const allFamilies = memberships.map((m: any) => ({
    id: m.families.id,
    name: m.families.name,
    role: m.role,
  }))

  // Check if cookie matches a valid family
  const cookieValue = cookieStore.get(COOKIE_NAME)?.value
  const matched = cookieValue ? allFamilies.find(f => f.id === cookieValue) : null

  // Use cookie value if valid, otherwise fall back to first
  const active = matched || allFamilies[0]

  return {
    familyId: active.id,
    familyName: active.name,
    role: active.role,
    allFamilies,
  }
}

/**
 * Set the active family cookie (call from a Server Action).
 */
export async function setActiveFamilyCookie(familyId: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, familyId, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  })
}
