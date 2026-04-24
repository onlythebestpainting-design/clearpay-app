import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { formatCurrency, formatDate, getPeriodLabel } from '@/lib/utils'
import { AlertTriangle, Users, Building2, Clock, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ data: businesses }, { data: employees }, { count: flagCount }] = await Promise.all([
    supabase.from('businesses').select('*').eq('archived', false).order('name'),
    supabase.from('employees').select('id, business_id').eq('status', 'active'),
    supabase.from('hours_entries').select('*', { count: 'exact', head: true })
      .gt('overtime_hours', 0)
      .gte('submitted_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  const totalEmployees = employees?.length ?? 0
  const readyCount = businesses?.filter((b) => b.status === 'ready').length ?? 0
  const blockedCount = businesses?.filter((b) => b.status === 'blocked').length ?? 0

  const metrics = [
    { label: 'Total Employees', value: totalEmployees, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Businesses', value: businesses?.length ?? 0, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'OT Flags (7 days)', value: flagCount ?? 0, icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Ready for Payroll', value: readyCount, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Overview across all your client businesses</p>
      </div>

      {/* Alert banner */}
      {blockedCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span><strong>{blockedCount}</strong> {blockedCount === 1 ? 'business is' : 'businesses are'} blocked and require attention before payroll can be run.</span>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <Card key={m.label}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{m.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{m.value}</p>
                </div>
                <div className={`w-12 h-12 ${m.bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${m.color}`} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Business status cards */}
      <Card padding={false}>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Client Businesses</h2>
          <Link href="/businesses" className="text-sm text-indigo-600 hover:text-indigo-800">View all →</Link>
        </div>
        <div className="divide-y divide-slate-100">
          {!businesses?.length ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No businesses yet. <Link href="/businesses" className="text-indigo-600">Add your first →</Link>
            </div>
          ) : (
            businesses.map((b) => {
              const empCount = employees?.filter((e) => e.business_id === b.id).length ?? 0
              return (
                <div key={b.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-10 rounded-sm flex-shrink-0" style={{ backgroundColor: b.color }} />
                    <div>
                      <Link href={`/businesses/${b.id}`} className="font-medium text-slate-800 hover:text-indigo-600">
                        {b.name}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {empCount} employees · {getPeriodLabel(b.pay_period)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={b.status} />
                    <Link href={`/hours?business_id=${b.id}`} className="text-xs text-slate-400 hover:text-slate-600">
                      <Clock className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>
    </div>
  )
}
