import { FileBarChart, Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card'

const UPCOMING_REPORTS = [
  { title: 'Payroll Summary', desc: 'Gross pay, net pay, and deduction totals per pay period', eta: 'Phase 2' },
  { title: 'Employee YTD Report', desc: 'Year-to-date earnings, taxes, and deductions per employee', eta: 'Phase 2' },
  { title: 'Business Payroll Comparison', desc: 'Side-by-side payroll costs across all client businesses', eta: 'Phase 2' },
  { title: 'Overtime Analysis', desc: 'Flag employees consistently exceeding standard hours', eta: 'Phase 2' },
  { title: 'Tax Liability Report', desc: 'Federal and state tax withholding summary for compliance', eta: 'Phase 2' },
  { title: 'Audit Trail Export', desc: 'Full export of all account activity for compliance review', eta: 'Phase 2' },
]

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileBarChart className="h-6 w-6 text-indigo-500" /> Reports
        </h1>
        <p className="text-sm text-slate-500">Payroll analytics and compliance exports</p>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Clock className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Reports Coming Soon</p>
            <p className="text-sm text-slate-500">Reporting module is scheduled for Phase 2</p>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          The following reports will be available. Use the Audit Log and Pay Calculator in the meantime for data needs.
        </p>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {UPCOMING_REPORTS.map((r) => (
          <div
            key={r.title}
            className="flex items-start gap-4 p-5 rounded-xl border border-slate-200 opacity-60"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <FileBarChart className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <p className="font-medium text-sm text-slate-700">{r.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">{r.desc}</p>
              <span className="inline-block mt-2 text-xs text-indigo-400 font-medium">{r.eta}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
