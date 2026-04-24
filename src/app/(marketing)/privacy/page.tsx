import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-800">← Back to home</Link>
        <h1 className="mt-6 text-3xl font-bold text-slate-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="mt-8 space-y-8 text-slate-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">1. Data We Collect</h2>
            <p>ClearPay collects information you provide when creating an account (email address, company name), employee data you enter (names, pay rates, hours), and usage data for security and audit purposes (IP addresses, timestamps, user agent strings).</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">2. How We Use Your Data</h2>
            <p>We use collected data solely to provide payroll management services, maintain security and audit logs, send transactional emails (verification, password reset), and comply with legal obligations.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">3. Data Isolation</h2>
            <p>All account data is strictly isolated. No data from your account is accessible to any other account. Row-level security is enforced at the database layer on every table.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">4. Data Retention</h2>
            <p>Audit logs are retained for a minimum of 7 years to support payroll compliance requirements. Account data is retained until you request deletion.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">5. Your Rights (GDPR)</h2>
            <p>You have the right to access all data we hold about you, request a complete data export, and request permanent deletion of your account and all associated data. Contact us via your account settings to exercise these rights.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">6. Security</h2>
            <p>Data is encrypted in transit (TLS 1.3) and at rest (AES-256). Sessions are managed via secure HTTP-only cookies. We do not store passwords in plaintext.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">7. Cookies</h2>
            <p>We use strictly necessary cookies for session management only. We do not use tracking or analytics cookies.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">8. Contact</h2>
            <p>For privacy questions, contact us through your account settings or at privacy@clearpay.app.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
