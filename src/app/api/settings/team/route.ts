import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getAuthContext, isValidUUID } from '@/lib/security'
import { writeAuditLog, getRequestMeta } from '@/lib/audit'

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'viewer']),
  assigned_businesses: z.array(z.string().uuid()).default([]),
})

const updateMemberSchema = z.object({
  member_id: z.string().uuid(),
  role: z.enum(['admin', 'viewer']).optional(),
  assigned_businesses: z.array(z.string().uuid()).optional(),
})

export async function GET(request: NextRequest) {
  const auth = getAuthContext(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('account_members')
    .select('*')
    .order('invited_at')

  if (error) return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 })
  return NextResponse.json({ members: data })
}

export async function POST(request: NextRequest) {
  const auth = getAuthContext(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.role !== 'owner') return NextResponse.json({ error: 'Only owners can invite members' }, { status: 403 })

  const body = await request.json().catch(() => null)
  const parsed = inviteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 422 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('account_members')
    .insert({
      account_id: auth.accountId,
      email: parsed.data.email,
      role: parsed.data.role,
      assigned_businesses: parsed.data.assigned_businesses,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Member already invited' }, { status: 409 })
    return NextResponse.json({ error: 'Failed to invite member' }, { status: 500 })
  }

  const { ip, userAgent } = getRequestMeta(request)
  await writeAuditLog({
    accountId: auth.accountId,
    userId: auth.userId,
    userEmail: auth.email,
    action: 'invite_member',
    tableName: 'account_members',
    recordId: data.id,
    newValue: { email: parsed.data.email, role: parsed.data.role },
    ipAddress: ip,
    userAgent,
  })

  return NextResponse.json({ member: data }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const auth = getAuthContext(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.role !== 'owner') return NextResponse.json({ error: 'Only owners can update members' }, { status: 403 })

  const body = await request.json().catch(() => null)
  const parsed = updateMemberSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 422 })

  const supabase = await createClient()
  const update: Record<string, unknown> = {}
  if (parsed.data.role) update.role = parsed.data.role
  if (parsed.data.assigned_businesses) update.assigned_businesses = parsed.data.assigned_businesses

  const { data, error } = await supabase
    .from('account_members')
    .update(update)
    .eq('id', parsed.data.member_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
  return NextResponse.json({ member: data })
}

export async function DELETE(request: NextRequest) {
  const auth = getAuthContext(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.role !== 'owner') return NextResponse.json({ error: 'Only owners can remove members' }, { status: 403 })

  const { searchParams } = request.nextUrl
  const memberId = searchParams.get('id')
  if (!memberId || !isValidUUID(memberId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const supabase = await createClient()
  const { error } = await supabase
    .from('account_members')
    .delete()
    .eq('id', memberId)
    .neq('role', 'owner')

  if (error) return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })

  const { ip, userAgent } = getRequestMeta(request)
  await writeAuditLog({
    accountId: auth.accountId,
    userId: auth.userId,
    userEmail: auth.email,
    action: 'remove_member',
    tableName: 'account_members',
    recordId: memberId,
    ipAddress: ip,
    userAgent,
  })

  return NextResponse.json({ message: 'Member removed' })
}
