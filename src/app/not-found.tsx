import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-800">404</h1>
        <p className="mt-4 text-xl text-slate-600">Page not found</p>
        <p className="mt-2 text-slate-500">The page you're looking for doesn't exist.</p>
        <Link
          href="/dashboard"
          className="mt-8 inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
