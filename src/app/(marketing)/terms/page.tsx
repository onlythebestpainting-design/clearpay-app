import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-800">← Back to home</Link>
        <h1 className="mt-6 text-3xl font-bold text-slate-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="mt-8 space-y-8 text-slate-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">1. Acceptance of Terms</h2>
            <p>By creating an account on ClearPay, you agree to these Terms of Service. If you do not agree, do not use the service.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">2. Permitted Use</h2>
            <p>ClearPay is a payroll management tool for lawful business use. You may not use it for any illegal purpose, to process fraudulent payroll, or to violate any applicable labor laws.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">3. Account Responsibility</h2>
            <p>You are responsible for all activity under your account. Keep your credentials secure. Notify us immediately of any unauthorized access.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">4. Data Accuracy</h2>
            <p>You are responsible for the accuracy of all employee data, hours, and payroll information you enter. ClearPay provides tax estimates — always verify with a qualified accountant or tax professional.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">5. Limitation of Liability</h2>
            <p>ClearPay is provided "as is." We are not liable for payroll errors resulting from inaccurate data entry, tax estimate discrepancies, or system outages. Maximum liability is limited to fees paid in the prior 3 months.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">6. Termination</h2>
            <p>You may delete your account at any time from Settings. We may suspend accounts that violate these terms. Upon termination, your data is permanently deleted per our Privacy Policy.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">7. Changes to Terms</h2>
            <p>We may update these terms. Continued use after notification constitutes acceptance.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
