import { NextRequest, NextResponse } from 'next/server'
import { updateBusinessSchema } from '@/lib/validations/business'
import { createClient } from '@/lib/supabase/server'
import { getAuthContext, isValidUUID } from '@/lib/security'
import { writeAuditLog, getRequestMeta } from '@/lib/audit'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAuthContext(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ business: data })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAuthContext(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.role === 'viewer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const parsed = updateBusinessSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  const supabase = await createClient()

  // Get old value for audit
  const { data: oldData } = await supabase.from('businesses').select('*').eq('id', id).single()

  const { data, error } = await supabase
    .from('businesses')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) return NextResponse.json({ error: 'Failed to update' }, { status: 500 })

  const { ip, userAgent } = getRequestMeta(request)
  await writeAuditLog({
    accountId: auth.accountId,
    userId: auth.userId,
    userEmail: auth.email,
    businessId: id,
    action: 'update',
    tableName: 'businesses',
    recordId: id,
    oldValue: oldData,
    newValue: data,
    ipAddress: ip,
    userAgent,
  })

  return NextResponse.json({ business: data })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAuthContext(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.role !== 'owner') return NextResponse.json({ error: 'Forbidden — owner only' }, { status: 403 })

  const { id } = await params
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const supabase = await createClient()

  // Archive instead of hard delete to preserve data integrity
  const { error } = await supabase
    .from('businesses')
    .update({ archived: true })
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Failed to archive business' }, { status: 500 })

  const { ip, userAgent } = getRequestMeta(request)
  await writeAuditLog({
    accountId: auth.accountId,
    userId: auth.userId,
    userEmail: auth.email,
    businessId: id,
    action: 'archive',
    tableName: 'businesses',
    recordId: id,
    ipAddress: ip,
    userAgent,
  })

  return NextResponse.json({ message: 'Business archived' })
}
