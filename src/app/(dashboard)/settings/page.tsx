import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Settings, Users, Monitor, Lock, Download, Trash2 } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const serviceClient = createServiceClient()
  const { data: member } = user ? await serviceClient
    .from('account_members')
    .select('account_id, role')
    .eq('user_id', user.id)
    .single() : { data: null }

  const { data: account } = member ? await serviceClient
    .from('accounts')
    .select('company_name, plan, created_at')
    .eq('id', member?.account_id)
    .single() : { data: null }

  const settingsSections = [
    { icon: Settings, label: 'Account', desc: 'Company name, contact info, logo', href: '/settings', current: true },
    { icon: Users, label: 'Team Members', desc: 'Invite, assign roles and businesses', href: '/settings/team' },
    { icon: Monitor, label: 'Active Sessions', desc: 'View and revoke active sessions', href: '/settings/sessions' },
    { icon: Lock, label: 'Change Password', desc: 'Update your account password', href: '#change-password' },
    { icon: Download, label: 'Export Data', desc: 'Download all your account data (GDPR)', href: '#export' },
    { icon: Trash2, label: 'Delete Account', desc: 'Permanently remove your account and all data', href: '#delete', danger: true },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage your account and team</p>
      </div>

      {/* Account info */}
      <Card>
        <h2 className="font-semibold text-slate-800 mb-4">Account Information</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Company</dt>
            <dd className="font-medium text-slate-800">{account?.company_name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Plan</dt>
            <dd className="font-medium text-slate-800 capitalize">{account?.plan}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Your role</dt>
            <dd className="font-medium text-slate-800 capitalize">{member?.role}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-800">{user?.email}</dd>
          </div>
        </dl>
      </Card>

      {/* Settings grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {settingsSections.map((s) => {
          const Icon = s.icon
          return (
            <Link
              key={s.label}
              href={s.href}
              className={`flex items-start gap-4 p-5 rounded-xl border transition-colors ${
                s.danger
                  ? 'border-red-100 hover:bg-red-50 hover:border-red-200'
                  : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${s.danger ? 'bg-red-50' : 'bg-indigo-50'}`}>
                <Icon className={`h-5 w-5 ${s.danger ? 'text-red-500' : 'text-indigo-600'}`} />
              </div>
              <div>
                <p className={`font-medium text-sm ${s.danger ? 'text-red-700' : 'text-slate-800'}`}>{s.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
