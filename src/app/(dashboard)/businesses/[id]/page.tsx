'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Edit2, Archive } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { PageLoader } from '@/components/ui/Spinner'
import { getPeriodLabel, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Business } from '@/types'

const PAY_PERIODS = [
  { value: 'weekly', label: 'Weekly' }, { value: 'bi-weekly', label: 'Bi-Weekly' },
  { value: 'semi-monthly', label: 'Semi-Monthly' }, { value: 'monthly', label: 'Monthly' },
]
const INTAKE_METHODS = [
  { value: 'manual_entry', label: 'Manual Entry' },
  { value: 'file_upload', label: 'File Upload' },
  { value: 'email_attachment', label: 'Email Attachment' },
]
const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' }, { value: 'ready', label: 'Ready' },
  { value: 'blocked', label: 'Blocked' }, { value: 'under_review', label: 'Under Review' },
]

export default function BusinessDetailPage() {
  const { id } = useParams()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<Business>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/businesses/${id}`)
      .then((r) => r.json())
      .then((d) => { setBusiness(d.business); setForm(d.business ?? {}) })
      .finally(() => setLoading(false))
  }, [id])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/businesses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed'); return }
      setBusiness(data.business)
      setEditing(false)
      toast.success('Business updated')
    } finally {
      setSaving(false)
    }
  }

  async function handleArchive() {
    if (!confirm('Archive this business? It will no longer appear in your active list.')) return
    const res = await fetch(`/api/businesses/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Business archived'); window.location.href = '/businesses' }
    else toast.error('Failed to archive')
  }

  if (loading) return <PageLoader />
  if (!business) return <div className="text-center py-20 text-slate-500">Business not found</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/businesses" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-slate-600" />
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: business.color }} />
          <h1 className="text-2xl font-bold text-slate-900">{business.name}</h1>
          <StatusBadge status={business.status} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Edit2 className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={handleArchive}>
            <Archive className="h-3.5 w-3.5" /> Archive
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">Business Details</h3>
          <dl className="space-y-3 text-sm">
            {[
              { label: 'Industry', value: business.industry || '—' },
              { label: 'Pay Period', value: getPeriodLabel(business.pay_period) },
              { label: 'Employee Count', value: business.employee_count },
              { label: 'Default Rate', value: `$${business.default_rate}/hr` },
              { label: 'Intake Method', value: business.intake_method.replace('_', ' ') },
              { label: 'Created', value: formatDate(business.created_at) },
            ].map((item) => (
              <div key={item.label} className="flex justify-between">
                <dt className="text-slate-500">{item.label}</dt>
                <dd className="font-medium text-slate-800">{item.value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'View Employees', href: `/employees?business_id=${id}` },
              { label: 'Enter Hours', href: `/hours?business_id=${id}` },
              { label: 'Run Calculator', href: `/calculator?business_id=${id}` },
              { label: 'View Audit Log', href: `/audit?business_id=${id}` },
            ].map((a) => (
              <Link key={a.href} href={a.href}
                className="block px-4 py-2.5 bg-slate-50 text-sm text-slate-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
              >
                {a.label} →
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit Business" size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Business name" required value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <Input label="Industry" value={form.industry ?? ''} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
            <Select label="Pay period" options={PAY_PERIODS} value={form.pay_period ?? ''} onChange={(e) => setForm({ ...form, pay_period: e.target.value as Business['pay_period'] })} />
            <Input label="Employee count" type="number" min={0} value={form.employee_count ?? 0} onChange={(e) => setForm({ ...form, employee_count: Number(e.target.value) })} />
            <Input label="Default rate ($)" type="number" step="0.01" min={0} value={form.default_rate ?? 0} onChange={(e) => setForm({ ...form, default_rate: Number(e.target.value) })} />
            <Select label="Intake method" options={INTAKE_METHODS} value={form.intake_method ?? ''} onChange={(e) => setForm({ ...form, intake_method: e.target.value as Business['intake_method'] })} />
            <Select label="Status" options={STATUS_OPTIONS} value={form.status ?? ''} onChange={(e) => setForm({ ...form, status: e.target.value as Business['status'] })} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditing(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={saving} className="flex-1">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
