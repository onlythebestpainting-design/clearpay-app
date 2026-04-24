'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { signupSchema, type SignupInput } from '@/lib/validations/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { validatePasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } from '@/lib/auth/password'

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [password, setPassword] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  })

  const { score, errors: pwErrors } = validatePasswordStrength(password)

  async function onSubmit(data: SignupInput) {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error ?? 'Sign up failed')
        return
      }

      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="text-xl font-bold text-slate-900">Check your email</h2>
          <p className="mt-2 text-slate-600">We sent a verification link to your email. Click it to activate your account.</p>
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
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 mb-4">
            <span className="text-white font-bold text-lg">CP</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-600">Start managing payroll in minutes</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              label="Company / firm name"
              type="text"
              placeholder="Acme Payroll Services"
              required
              error={errors.companyName?.message}
              {...register('companyName')}
            />
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
                autoComplete="new-password"
                required
                error={errors.password?.message}
                {...register('password', {
                  onChange: (e) => setPassword(e.target.value),
                })}
              />
              {password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= score ? getPasswordStrengthColor(score) : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">{getPasswordStrengthLabel(score)}</p>
                  {pwErrors.length > 0 && (
                    <ul className="text-xs text-slate-500 space-y-0.5">
                      {pwErrors.map((e) => <li key={e} className="text-red-500">• {e}</li>)}
                    </ul>
                  )}
                </div>
              )}
            </div>
            <Input
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              required
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
