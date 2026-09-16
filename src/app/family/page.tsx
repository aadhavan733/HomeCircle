import { createClient } from '@/utils/supabase/server'
import { leaveFamily, removeFamilyMemberAction, updateFamilyNameAction, updateMyNameAction } from './actions'
import { redirect } from 'next/navigation'
import CreateFamilyForm from '@/components/CreateFamilyForm'
import AddMemberForm from '@/components/AddMemberForm'
import EditFamilyName from '@/components/EditFamilyName'
import EditMyName from '@/components/EditMyName'
import { getActiveFamilyId } from '@/lib/activeFamily'

export default async function FamilyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { familyId, familyName, role: myRole, allFamilies } = await getActiveFamilyId(user.id)

  if (!familyId) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Family</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            👨‍👩‍👧‍👦
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">You don't belong to a family yet</h2>
          <p className="text-gray-600 mb-6 text-sm">Create a new family to start managing your household budget, tracking bills, and saving together.</p>
          <CreateFamilyForm />
        </div>
      </div>
    )
  }

  // Fetch all members of the active family
  const { data: members, error: membersError } = await supabase
    .from('family_members')
    .select('user_id, role, profiles(full_name, email)')
    .eq('family_id', familyId)

  if (membersError) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Family</h1>
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <h3 className="font-bold mb-2">Database Error</h3>
          <p className="text-sm">{membersError.message}</p>
        </div>
      </div>
    )
  }

  const isAdminOrOwner = ['owner', 'admin'].includes(myRole || '')

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Family</h1>

      {/* Family selector pills — if user is in multiple families */}
      {allFamilies.length > 1 && (
        <div className="mb-6">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Your Families</p>
          <div className="flex gap-2 flex-wrap">
            {allFamilies.map(f => (
              <a
                key={f.id}
                href={`/api/set-active-family-redirect?familyId=${f.id}&redirect=/family`}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  f.id === familyId
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {f.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Active Family Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        {/* Family Name Header */}
        <div className="flex justify-between items-start mb-1">
          {isAdminOrOwner ? (
            <EditFamilyName
              familyId={familyId}
              currentName={familyName!}
              updateAction={updateFamilyNameAction}
            />
          ) : (
            <h2 className="text-xl font-semibold text-gray-900">{familyName}</h2>
          )}
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${
            myRole === 'owner' ? 'bg-purple-100 text-purple-700' :
            myRole === 'admin' ? 'bg-orange-100 text-orange-700' :
            myRole === 'viewer' ? 'bg-gray-100 text-gray-600' :
            'bg-blue-100 text-blue-700'
          }`}>
            {myRole}
          </span>
        </div>
        <p className="text-sm text-gray-400 mb-5">
          {members?.length || 1} member{(members?.length || 1) !== 1 ? 's' : ''} · tap ✏️ to edit names
        </p>

        {/* Members List */}
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Members</h3>
        <div className="space-y-2 mb-4">
          {members?.map((member: any) => {
            const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles
            const name = profile?.full_name || profile?.email?.split('@')[0] || 'Unknown'
            const email = profile?.email || ''
            const isMe = member.user_id === user.id
            const isOwner = member.role === 'owner'
            const canRemove = isAdminOrOwner && !isMe && !isOwner

            return (
              <div key={member.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 flex-shrink-0 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold uppercase">
                    {name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    {/* Anyone can edit their own name */}
                    {isMe ? (
                      <EditMyName currentName={name} updateAction={updateMyNameAction} />
                    ) : (
                      <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                    )}
                    <p className="text-xs text-gray-400 truncate">{email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    member.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                    member.role === 'admin' ? 'bg-orange-100 text-orange-700' :
                    member.role === 'viewer' ? 'bg-gray-100 text-gray-600' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {member.role}
                  </span>
                  {canRemove && (
                    <form action={removeFamilyMemberAction.bind(null, familyId, member.user_id)}>
                      <button className="text-xs text-red-400 hover:text-red-600 px-1.5 py-1 rounded hover:bg-red-50 transition-colors">
                        Remove
                      </button>
                    </form>
                  )}
                  {isMe && !isOwner && (
                    <form action={leaveFamily.bind(null, familyId)}>
                      <button className="text-xs text-red-400 hover:text-red-600 px-1.5 py-1 rounded hover:bg-red-50 transition-colors">
                        Leave
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Add Member */}
        <AddMemberForm familyId={familyId} userRole={myRole || 'member'} />

        {/* Danger Zone for owner */}
        {myRole === 'owner' && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">Danger Zone</p>
            <form action={leaveFamily.bind(null, familyId)}>
              <button className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-xs font-medium transition-colors">
                Delete / Leave Family
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
