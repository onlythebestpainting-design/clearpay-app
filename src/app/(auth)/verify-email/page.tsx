import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-slate-900">Email verified!</h2>
        <p className="mt-2 text-slate-600">Your email has been confirmed. You can now sign in to your ClearPay account.</p>
        <Link
          href="/login"
          className="mt-6 inline-block px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Sign in →
        </Link>
      </div>
    </div>
  )
}
