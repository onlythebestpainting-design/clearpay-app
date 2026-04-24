'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginInput) {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error ?? 'Login failed')
        return
      }

      toast.success('Welcome back!')
      router.push('/dashboard')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 mb-4">
            <span className="text-white font-bold text-lg">CP</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Sign in to ClearPay</h1>
          <p className="mt-1 text-sm text-slate-600">Manage your payroll with confidence</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              required
              error={errors.email?.message}
              {...register('email')}
            />
            <div>
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                required
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="mt-2 text-right">
                <Link href="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-800">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-800">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
