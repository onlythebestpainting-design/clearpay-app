'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  })

  async function onSubmit(data: ResetPasswordInput) {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password?mode=reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error ?? 'Failed to reset password')
        return
      }

      toast.success('Password updated! Please sign in.')
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Set new password</h1>
          <p className="mt-1 text-sm text-slate-600">Choose a strong password for your account</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input label="New password" type="password" autoComplete="new-password" required error={errors.password?.message} {...register('password')} />
            <Input label="Confirm password" type="password" autoComplete="new-password" required error={errors.confirmPassword?.message} {...register('confirmPassword')} />
            <Button type="submit" loading={loading} className="w-full" size="lg">Update password</Button>
          </form>
          <p className="mt-4 text-center text-sm">
            <Link href="/login" className="text-indigo-600 hover:text-indigo-800">← Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
