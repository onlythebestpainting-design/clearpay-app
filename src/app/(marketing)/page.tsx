import Link from 'next/link'
import { CheckCircle2, Shield, Users, BarChart3, Clock, Calculator } from 'lucide-react'

const features = [
  { icon: Users, title: 'Multi-Client Management', desc: 'Manage payroll for multiple businesses from a single dashboard.' },
  { icon: Clock, title: 'Hour Intake Automation', desc: 'Email scanning and bulk entry tools eliminate manual data entry.' },
  { icon: Calculator, title: 'Payroll Calculator', desc: 'Live calculations with federal tax, FICA, and deduction previews.' },
  { icon: Shield, title: 'Enterprise Security', desc: 'RLS isolation, audit logs, and role-based access out of the box.' },
  { icon: BarChart3, title: 'Reporting & Exports', desc: 'YTD summaries, overtime reports, and compliance exports.' },
  { icon: CheckCircle2, title: 'Payroll Safeguards', desc: 'Anomaly detection, OT flags, and pre-payroll approval checklists.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-200 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CP</span>
          </div>
          <span className="font-semibold text-slate-900 text-lg">ClearPay</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">Sign in</Link>
          <Link href="/signup" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium mb-6">
          <Shield className="h-3 w-3" />
          SOC-ready, audit-complete payroll platform
        </div>
        <h1 className="text-5xl font-bold text-slate-900 leading-tight">
          Payroll management<br />
          <span className="text-indigo-600">built for professionals</span>
        </h1>
        <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          ClearPay is the all-in-one payroll platform for managers who oversee multiple client businesses. Hours in, pay stubs out.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup" className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors text-sm">
            Start for free — no credit card
          </Link>
          <Link href="/login" className="px-8 py-3.5 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors text-sm">
            Sign in
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="p-6 rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-indigo-600 py-20">
        <div className="max-w-2xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-white">Ready to run cleaner payroll?</h2>
          <p className="mt-4 text-indigo-200">Set up your account in minutes. All features included.</p>
          <Link href="/signup" className="mt-8 inline-block px-8 py-3.5 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">
            Get started free →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-slate-500">© {new Date().getFullYear()} ClearPay. All rights reserved.</span>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-slate-700">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-700">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
