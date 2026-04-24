import { NextRequest, NextResponse } from 'next/server'
import { hourEntrySchema, bulkHourEntrySchema } from '@/lib/validations/hours'
import { createClient } from '@/lib/supabase/server'
import { getAuthContext, isValidUUID } from '@/lib/security'
import { writeAuditLog, getRequestMeta } from '@/lib/audit'

export async function GET(request: NextRequest) {
  const auth = getAuthContext(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const businessId = searchParams.get('business_id')
  const periodStart = searchParams.get('period_start')
  const periodEnd = searchParams.get('period_end')

  const supabase = await createClient()
  let query = supabase
    .from('hours_entries')
    .select('*, employees(full_name, pay_type, rate)')
    .order('submitted_at', { ascending: false })

  if (businessId && isValidUUID(businessId)) query = query.eq('business_id', businessId)
  if (periodStart) query = query.gte('pay_period_start', periodStart)
  if (periodEnd) query = query.lte('pay_period_end', periodEnd)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Failed to fetch hours' }, { status: 500 })

  return NextResponse.json({ entries: data })
}

export async function POST(request: NextRequest) {
  const auth = getAuthContext(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.role === 'viewer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  // Handle bulk entry
  if (body.entries && Array.isArray(body.entries)) {
    const parsed = bulkHourEntrySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 422 },
      )
    }

    const supabase = await createClient()
    const rows = parsed.data.entries.map((e) => ({
      employee_id: e.employee_id,
      business_id: parsed.data.business_id,
      account_id: auth.accountId,
      pay_period_start: parsed.data.pay_period_start,
      pay_period_end: parsed.data.pay_period_end,
      regular_hours: e.regular_hours,
      overtime_hours: e.overtime_hours,
      source: 'manual' as const,
    }))

    const { data, error } = await supabase.from('hours_entries').insert(rows).select()
    if (error) return NextResponse.json({ error: 'Failed to save hours' }, { status: 500 })

    const { ip, userAgent } = getRequestMeta(request)
    await writeAuditLog({
      accountId: auth.accountId,
      userId: auth.userId,
      userEmail: auth.email,
      businessId: parsed.data.business_id,
      action: 'bulk_hours_entry',
      tableName: 'hours_entries',
      recordId: parsed.data.business_id,
      newValue: { count: data.length, period_start: parsed.data.pay_period_start },
      ipAddress: ip,
      userAgent,
    })

    return NextResponse.json({ entries: data }, { status: 201 })
  }

  // Single entry
  const parsed = hourEntrySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('hours_entries')
    .insert({ ...parsed.data, account_id: auth.accountId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to save hours' }, { status: 500 })

  const { ip, userAgent } = getRequestMeta(request)
  await writeAuditLog({
    accountId: auth.accountId,
    userId: auth.userId,
    userEmail: auth.email,
    businessId: parsed.data.business_id,
    action: 'create',
    tableName: 'hours_entries',
    recordId: data.id,
    newValue: { regular_hours: data.regular_hours, overtime_hours: data.overtime_hours },
    ipAddress: ip,
    userAgent,
  })

  return NextResponse.json({ entry: data }, { status: 201 })
}
