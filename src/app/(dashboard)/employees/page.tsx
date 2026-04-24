'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Search, Upload, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/Spinner'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import Papa from 'papaparse'
import type { Employee, Business } from '@/types'

const PAY_TYPES = [
  { value: 'hourly', label: 'Hourly' }, { value: 'salaried', label: 'Salaried' }, { value: 'part-time', label: 'Part-Time' },
]
const FILING_STATUSES = [
  { value: 'single', label: 'Single' }, { value: 'married_jointly', label: 'Married (Joint)' },
  { value: 'married_separately', label: 'Married (Separate)' }, { value: 'head_of_household', label: 'Head of Household' },
]

const defaultForm = {
  business_id: '', full_name: '', pay_type: 'hourly', rate: 0,
  filing_status: 'single', start_date: new Date().toISOString().split('T')[0], status: 'active',
}

export default function EmployeesPage() {
  const searchParams = useSearchParams()
  const bizFilter = searchParams.get('business_id') ?? ''

  const [employees, setEmployees] = useState<Employee[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterBiz, setFilterBiz] = useState(bizFilter)
  const [showModal, setShowModal] = useState(false)
  const [showCSV, setShowCSV] = useState(false)
  const [form, setForm] = useState({ ...defaultForm, business_id: bizFilter })
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/employees${filterBiz ? `?business_id=${filterBiz}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`).then((r) => r.json()),
      fetch('/api/businesses').then((r) => r.json()),
    ]).then(([empData, bizData]) => {
      setEmployees(empData.employees ?? [])
      setBusinesses(bizData.businesses ?? [])
    }).finally(() => setLoading(false))
  }, [filterBiz, search])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, rate: Number(form.rate) }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed'); return }
      setEmployees((prev) => [data.employee, ...prev])
      setShowModal(false)
      setForm({ ...defaultForm, business_id: bizFilter })
      toast.success('Employee added')
    } finally {
      setSaving(false)
    }
  }

  function handleCSVFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !form.business_id) { toast.error('Select a business first'); return }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const res = await fetch('/api/employees/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ business_id: form.business_id, rows: results.data }),
        })
        const data = await res.json()
        if (!res.ok) { toast.error(data.error ?? 'Import failed'); return }
        toast.success(`Imported ${data.imported} employees${data.skipped ? `, skipped ${data.skipped}` : ''}`)
        setShowCSV(false)
        window.location.reload()
      },
    })
  }

  const bizOptions = businesses.map((b) => ({ value: b.id, label: b.name }))

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
          <p className="text-sm text-slate-500">{employees.length} employee{employees.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowCSV(true)}>
            <Upload className="h-4 w-4" /> Import CSV
          </Button>
          <Button size="sm" onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" /> Add Employee
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <select
          value={filterBiz}
          onChange={(e) => setFilterBiz(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
        >
          <option value="">All businesses</option>
          {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Name', 'Business', 'Type', 'Rate', 'Filing', 'Start Date', 'Status', 'YTD Gross'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {employees.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-slate-400">No employees found</td></tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{emp.full_name}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {(emp as any).businesses?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{emp.pay_type}</td>
                    <td className="px-4 py-3 text-slate-600">${emp.rate}/hr</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{emp.filing_status.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(emp.start_date)}</td>
                    <td className="px-4 py-3"><StatusBadge status={emp.status} /></td>
                    <td className="px-4 py-3 text-slate-600">{formatCurrency(emp.ytd_gross ?? 0)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Employee Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Employee" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Full name" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <Select label="Business" required options={bizOptions} placeholder="Select business" value={form.business_id} onChange={(e) => setForm({ ...form, business_id: e.target.value })} />
            <Select label="Pay type" options={PAY_TYPES} value={form.pay_type} onChange={(e) => setForm({ ...form, pay_type: e.target.value })} />
            <Input label="Rate ($/hr or salary)" type="number" step="0.01" min={0} required value={form.rate} onChange={(e) => setForm({ ...form, rate: Number(e.target.value) })} />
            <Select label="Filing status" options={FILING_STATUSES} value={form.filing_status} onChange={(e) => setForm({ ...form, filing_status: e.target.value })} />
            <Input label="Start date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={saving} className="flex-1">Add Employee</Button>
          </div>
        </form>
      </Modal>

      {/* CSV Import Modal */}
      <Modal open={showCSV} onClose={() => setShowCSV(false)} title="Import Employees from CSV">
        <div className="space-y-4">
          <Select label="Business" required options={bizOptions} placeholder="Select business" value={form.business_id} onChange={(e) => setForm({ ...form, business_id: e.target.value })} />
          <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
            <p className="font-medium text-slate-700 mb-1">CSV must include columns:</p>
            <code className="block">full_name, pay_type, rate, filing_status (optional), start_date (optional)</code>
          </div>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVFile} />
          <Button onClick={() => fileRef.current?.click()} className="w-full" disabled={!form.business_id}>
            <Upload className="h-4 w-4" /> Choose CSV File
          </Button>
        </div>
      </Modal>
    </div>
  )
}
