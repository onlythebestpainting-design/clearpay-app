'use client'

import { useState, useEffect } from 'react'
import { Shield, Filter } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageLoader } from '@/components/ui/Spinner'
import { formatDateTime } from '@/lib/utils'
import type { AuditLog } from '@/types'

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ from: '', to: '', action: '' })

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page) })
    if (filters.from) params.set('from', filters.from)
    if (filters.to) params.set('to', filters.to)
    if (filters.action) params.set('action', filters.action)

    setLoading(true)
    fetch(`/api/audit?${params}`)
      .then((r) => r.json())
      .then((d) => { setEntries(d.entries ?? []); setTotal(d.total ?? 0) })
      .finally(() => setLoading(false))
  }, [page, filters])

  const actionColors: Record<string, string> = {
    create: 'text-green-600 bg-green-50',
    update: 'text-blue-600 bg-blue-50',
    delete: 'text-red-600 bg-red-50',
    archive: 'text-orange-600 bg-orange-50',
    deactivate: 'text-orange-600 bg-orange-50',
    invite_member: 'text-indigo-600 bg-indigo-50',
    remove_member: 'text-red-600 bg-red-50',
    bulk_import: 'text-purple-600 bg-purple-50',
    bulk_hours_entry: 'text-teal-600 bg-teal-50',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="h-6 w-6 text-indigo-500" /> Audit Log
        </h1>
        <p className="text-sm text-slate-500">Immutable record of all account activity. {total.toLocaleString()} total entries.</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-600">
          <Filter className="h-4 w-4" /> Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input label="From date" type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
          <Input label="To date" type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
          <Input label="Action" placeholder="create, update…" value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })} />
        </div>
      </Card>

      {loading ? <PageLoader /> : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Time', 'User', 'Action', 'Table', 'Record', 'IP'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {entries.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-slate-400">No audit entries found</td></tr>
                ) : (
                  entries.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDateTime(e.created_at)}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{e.user_email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${actionColors[e.action] ?? 'text-slate-600 bg-slate-100'}`}>
                          {e.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{e.table_name}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs font-mono">{e.record_id.slice(0, 8)}…</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{e.ip_address}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 50 && (
            <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
              <span>Showing {((page - 1) * 50) + 1}–{Math.min(page * 50, total)} of {total}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                  className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                >Prev</button>
                <button onClick={() => setPage(page + 1)} disabled={page * 50 >= total}
                  className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                >Next</button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
