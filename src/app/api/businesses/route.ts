import { NextRequest, NextResponse } from 'next/server'
import { businessSchema } from '@/lib/validations/business'
import { createClient } from '@/lib/supabase/server'
import { getAuthContext } from '@/lib/security'
import { generateColor } from '@/lib/utils'
import { writeAuditLog, getRequestMeta } from '@/lib/audit'

export async function GET(request: NextRequest) {
  const auth = getAuthContext(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createClient()
  const { searchParams } = request.nextUrl
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  let query = supabase
    .from('businesses')
    .select('*')
    .eq('archived', false)
    .order('name')

  if (status) query = query.eq('status', status)
  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 })

  return NextResponse.json({ businesses: data })
}

export async function POST(request: NextRequest) {
  const auth = getAuthContext(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.role === 'viewer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const parsed = businessSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('businesses')
    .insert({
      ...parsed.data,
      account_id: auth.accountId,
      color: parsed.data.color ?? generateColor(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to create business' }, { status: 500 })

  const { ip, userAgent } = getRequestMeta(request)
  await writeAuditLog({
    accountId: auth.accountId,
    userId: auth.userId,
    userEmail: auth.email,
    businessId: data.id,
    action: 'create',
    tableName: 'businesses',
    recordId: data.id,
    newValue: data,
    ipAddress: ip,
    userAgent,
  })

  return NextResponse.json({ business: data }, { status: 201 })
}
