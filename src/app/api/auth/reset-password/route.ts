import { NextRequest, NextResponse } from 'next/server'
import { forgotPasswordSchema, resetPasswordSchema } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/server'

// POST /api/auth/reset-password?mode=request — sends reset email
// POST /api/auth/reset-password?mode=reset — sets new password with token
export async function POST(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get('mode') ?? 'request'
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const supabase = await createClient()

  if (mode === 'request') {
    const parsed = forgotPasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 422 })
    }

    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    })

    // Always return success to prevent email enumeration
    return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' })
  }

  if (mode === 'reset') {
    const parsed = resetPasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 422 },
      )
    }

    const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
    if (error) {
      return NextResponse.json({ error: 'Failed to reset password' }, { status: 400 })
    }

    return NextResponse.json({ message: 'Password updated successfully' })
  }

  return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
}
