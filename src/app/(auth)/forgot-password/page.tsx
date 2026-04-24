'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordInput) {
    setLoading(true)
    try {
      await fetch('/api/auth/reset-password?mode=request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="text-xl font-bold text-slate-900">Check your inbox</h2>
          <p className="mt-2 text-slate-600">If an account exists with that email, you'll receive a reset link shortly.</p>
          <Link href="/login" className="mt-6 inline-block text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            Back to sign in →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
          <p className="mt-1 text-sm text-slate-600">Enter your email and we'll send a reset link</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input label="Email address" type="email" required error={errors.email?.message} {...register('email')} />
            <Button type="submit" loading={loading} className="w-full" size="lg">Send reset link</Button>
          </form>
          <p className="mt-4 text-center text-sm">
            <Link href="/login" className="text-indigo-600 hover:text-indigo-800">← Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
