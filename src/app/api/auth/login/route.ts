import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { checkLoginRateLimit, recordFailedLogin, clearFailedLogins } from '@/lib/auth/rateLimit'
import { getRequestMeta } from '@/lib/audit'

export async function POST(request: NextRequest) {
  const { ip, userAgent } = getRequestMeta(request)

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 422 })
  }

  const { email, password } = parsed.data

  // Rate limit check
  const allowed = await checkLoginRateLimit(email, ip)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Account temporarily locked. Try again in 15 minutes.' },
      { status: 429 },
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    await recordFailedLogin(email, ip)
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  // Check email verification
  if (!data.user.email_confirmed_at) {
    return NextResponse.json(
      { error: 'Please verify your email before logging in.' },
      { status: 403 },
    )
  }

  await clearFailedLogins(email)

  // Record session
  const serviceClient = createServiceClient()
  const { data: member } = await serviceClient
    .from('account_members')
    .select('account_id')
    .eq('user_id', data.user.id)
    .not('accepted_at', 'is', null)
    .single()

  if (member) {
    await serviceClient.from('sessions').insert({
      user_id: data.user.id,
      account_id: member.account_id,
      device_info: userAgent.substring(0, 200),
      ip_address: ip,
    })
  }

  return NextResponse.json({ message: 'Logged in successfully' })
}
