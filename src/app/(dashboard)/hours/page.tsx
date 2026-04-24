'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { PageLoader } from '@/components/ui/Spinner'
import { formatDateTime } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { HoursEntry, Business, Employee } from '@/types'

export default function HoursPage() {
  const searchParams = useSearchParams()
  const bizFilter = searchParams.get('business_id') ?? ''

  const [entries, setEntries] = useState<HoursEntry[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const today = new Date()
  const periodStart = new Date(today.setDate(today.getDate() - today.getDay() + 1)).toISOString().split('T')[0]
  const periodEnd = new Date(new Date(periodStart).setDate(new Date(periodStart).getDate() + 6)).toISOString().split('T')[0]

  const [form, setForm] = useState({
    business_id: bizFilter, employee_id: '', pay_period_start: periodStart,
    pay_period_end: periodEnd, regular_hours: 40, overtime_hours: 0,
  })

  useEffect(() => {
    Promise.all([
      fetch(`/api/hours${bizFilter ? `?business_id=${bizFilter}` : ''}`).then((r) => r.json()),
      fetch('/api/businesses').then((r) => r.json()),
    ]).then(([hourData, bizData]) => {
      setEntries(hourData.entries ?? [])
      setBusinesses(bizData.businesses ?? [])
    }).finally(() => setLoading(false))
  }, [bizFilter])

  useEffect(() => {
    if (form.business_id) {
      fetch(`/api/employees?business_id=${form.business_id}&status=active`)
        .then((r) => r.json())
        .then((d) => setEmployees(d.employees ?? []))
    }
  }, [form.business_id])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, regular_hours: Number(form.regular_hours), overtime_hours: Number(form.overtime_hours) }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed'); return }
      setEntries((prev) => [data.entry, ...prev])
      setShowModal(false)
      toast.success('Hours recorded')
    } finally {
      setSaving(false)
    }
  }

  const bizOptions = businesses.map((b) => ({ value: b.id, label: b.name }))
  const empOptions = employees.map((e) => ({ value: e.id, label: e.full_name }))

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hour Intake</h1>
          <p className="text-sm text-slate-500">{entries.length} entries recorded</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" /> Enter Hours
        </Button>
      </div>

      <Card padding={false}>
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-500" /> Recent Hour Entries
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Employee', 'Business', 'Period', 'Regular', 'OT', 'Source', 'Submitted'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {entries.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-slate-400">No hour entries yet</td></tr>
              ) : (
                entries.map((e: any) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{e.employees?.full_name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{e.business_id}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{e.pay_period_start} → {e.pay_period_end}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{e.regular_hours}h</td>
                    <td className="px-4 py-3 text-slate-600">
                      {e.overtime_hours > 0 ? <span className="text-yellow-600 font-medium">{e.overtime_hours}h OT</span> : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs capitalize">{e.source.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDateTime(e.submitted_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Enter Hours" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select label="Business" required options={bizOptions} placeholder="Select business" value={form.business_id} onChange={(e) => setForm({ ...form, business_id: e.target.value, employee_id: '' })} />
          <Select label="Employee" required options={empOptions} placeholder="Select employee" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} disabled={!form.business_id} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Period start" type="date" required value={form.pay_period_start} onChange={(e) => setForm({ ...form, pay_period_start: e.target.value })} />
            <Input label="Period end" type="date" required value={form.pay_period_end} onChange={(e) => setForm({ ...form, pay_period_end: e.target.value })} />
            <Input label="Regular hours" type="number" step="0.5" min={0} max={168} required value={form.regular_hours} onChange={(e) => setForm({ ...form, regular_hours: Number(e.target.value) })} />
            <Input label="Overtime hours" type="number" step="0.5" min={0} max={168} value={form.overtime_hours} onChange={(e) => setForm({ ...form, overtime_hours: Number(e.target.value) })} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={saving} className="flex-1">Save Hours</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
