import { NextRequest, NextResponse } from 'next/server'
import { signupSchema } from '@/lib/validations/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { checkLoginRateLimit, recordFailedLogin } from '@/lib/auth/rateLimit'
import { getRequestMeta } from '@/lib/audit'

export async function POST(request: NextRequest) {
  const { ip } = getRequestMeta(request)

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const parsed = signupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  const { email, password, companyName } = parsed.data

  // Rate limit check
  const allowed = await checkLoginRateLimit(email, ip)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait 15 minutes.' },
      { status: 429 },
    )
  }

  const supabase = createServiceClient()

  // Create Supabase auth user (email verification enabled in Supabase dashboard)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    await recordFailedLogin(email, ip)
    const msg = authError?.message?.toLowerCase() ?? ''
    if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('already exists')) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }
    return NextResponse.json({ error: authError?.message ?? 'Failed to create account' }, { status: 500 })
  }

  // Create account record
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .insert({ company_name: companyName, owner_id: authData.user.id })
    .select()
    .single()

  if (accountError || !account) {
    // Rollback: delete auth user
    await supabase.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }

  // Create owner account member record
  await supabase.from('account_members').insert({
    account_id: account.id,
    user_id: authData.user.id,
    email,
    role: 'owner',
    assigned_businesses: [],
    accepted_at: new Date().toISOString(),
  })

  return NextResponse.json({ message: 'Account created successfully.' }, { status: 201 })
}
