import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const serviceClient = createServiceClient()
  const { data: member } = await serviceClient
    .from('account_members')
    .select('account_id, role')
    .eq('user_id', user.id)
    .not('accepted_at', 'is', null)
    .single()

  const { data: account } = member
    ? await serviceClient.from('accounts').select('company_name').eq('id', member.account_id).single()
    : { data: null }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar
          userEmail={user.email ?? ''}
          companyName={account?.company_name ?? 'ClearPay'}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
