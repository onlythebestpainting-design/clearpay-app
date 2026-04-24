'use client'

import { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { PageLoader } from '@/components/ui/Spinner'
import { getPeriodLabel, generateColor } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'
import type { Business } from '@/types'

const PAY_PERIODS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-Weekly' },
  { value: 'semi-monthly', label: 'Semi-Monthly' },
  { value: 'monthly', label: 'Monthly' },
]

const INTAKE_METHODS = [
  { value: 'manual_entry', label: 'Manual Entry' },
  { value: 'file_upload', label: 'File Upload' },
  { value: 'email_attachment', label: 'Email Attachment' },
]

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'ready', label: 'Ready' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'under_review', label: 'Under Review' },
]

const defaultForm = {
  name: '', industry: '', pay_period: 'bi-weekly', employee_count: 0,
  default_rate: 0, intake_method: 'manual_entry', status: 'pending', color: '',
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ ...defaultForm, color: generateColor() })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/businesses${search ? `?search=${encodeURIComponent(search)}` : ''}`)
      .then((r) => r.json())
      .then((d) => setBusinesses(d.businesses ?? []))
      .finally(() => setLoading(false))
  }, [search])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, employee_count: Number(form.employee_count), default_rate: Number(form.default_rate) }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed'); return }
      setBusinesses((prev) => [data.business, ...prev])
      setShowModal(false)
      setForm({ ...defaultForm, color: generateColor() })
      toast.success('Business created')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Businesses</h1>
          <p className="text-sm text-slate-500">{businesses.length} client {businesses.length === 1 ? 'business' : 'businesses'}</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" /> Add Business
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search businesses…"
          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {businesses.length === 0 ? (
          <div className="col-span-2 py-16 text-center text-slate-400">
            <p className="text-lg">No businesses yet</p>
            <p className="text-sm mt-1">Add your first client business to get started</p>
          </div>
        ) : (
          businesses.map((b) => (
            <Card key={b.id} className="hover:border-slate-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: b.color }} />
                  <div>
                    <Link href={`/businesses/${b.id}`} className="font-semibold text-slate-800 hover:text-indigo-600">
                      {b.name}
                    </Link>
                    {b.industry && <p className="text-xs text-slate-500">{b.industry}</p>}
                  </div>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-lg font-semibold text-slate-800">{b.employee_count}</p>
                  <p className="text-xs text-slate-500">Employees</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-xs font-medium text-slate-700">{getPeriodLabel(b.pay_period)}</p>
                  <p className="text-xs text-slate-500">Pay Period</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-xs font-medium text-slate-700">${b.default_rate}/hr</p>
                  <p className="text-xs text-slate-500">Default Rate</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Link href={`/employees?business_id=${b.id}`} className="flex-1 text-center text-xs py-1.5 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors">
                  Employees
                </Link>
                <Link href={`/hours?business_id=${b.id}`} className="flex-1 text-center text-xs py-1.5 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors">
                  Hours
                </Link>
                <Link href={`/calculator?business_id=${b.id}`} className="flex-1 text-center text-xs py-1.5 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors">
                  Calculator
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Business" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Business name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <Input label="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
            <Select label="Pay period" required options={PAY_PERIODS} value={form.pay_period} onChange={(e) => setForm({ ...form, pay_period: e.target.value })} />
            <Input label="Employee count" type="number" min={0} value={form.employee_count} onChange={(e) => setForm({ ...form, employee_count: Number(e.target.value) })} />
            <Input label="Default hourly rate ($)" type="number" step="0.01" min={0} value={form.default_rate} onChange={(e) => setForm({ ...form, default_rate: Number(e.target.value) })} />
            <Select label="Hour intake method" required options={INTAKE_METHODS} value={form.intake_method} onChange={(e) => setForm({ ...form, intake_method: e.target.value })} />
            <Select label="Status" required options={STATUS_OPTIONS} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={saving} className="flex-1">Create Business</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
