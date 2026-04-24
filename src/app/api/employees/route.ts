import { NextRequest, NextResponse } from 'next/server'
import { employeeSchema } from '@/lib/validations/employee'
import { createClient } from '@/lib/supabase/server'
import { getAuthContext, isValidUUID } from '@/lib/security'
import { writeAuditLog, getRequestMeta } from '@/lib/audit'

export async function GET(request: NextRequest) {
  const auth = getAuthContext(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const businessId = searchParams.get('business_id')
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  const supabase = await createClient()
  let query = supabase
    .from('employees')
    .select('*, businesses(name, color)')
    .order('full_name')

  if (businessId && isValidUUID(businessId)) query = query.eq('business_id', businessId)
  if (status) query = query.eq('status', status)
  if (search) query = query.ilike('full_name', `%${search}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })

  return NextResponse.json({ employees: data })
}

export async function POST(request: NextRequest) {
  const auth = getAuthContext(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.role === 'viewer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const parsed = employeeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('employees')
    .insert({ ...parsed.data, account_id: auth.accountId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 })

  const { ip, userAgent } = getRequestMeta(request)
  await writeAuditLog({
    accountId: auth.accountId,
    userId: auth.userId,
    userEmail: auth.email,
    businessId: parsed.data.business_id,
    action: 'create',
    tableName: 'employees',
    recordId: data.id,
    newValue: { full_name: data.full_name, pay_type: data.pay_type },
    ipAddress: ip,
    userAgent,
  })

  return NextResponse.json({ employee: data }, { status: 201 })
}
