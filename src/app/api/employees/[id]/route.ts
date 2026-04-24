import { NextRequest, NextResponse } from 'next/server'
import { updateEmployeeSchema } from '@/lib/validations/employee'
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
    .from('employees')
    .select('*, businesses(name, color), deduction_profiles(*)')
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ employee: data })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAuthContext(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.role === 'viewer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const parsed = updateEmployeeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  const supabase = await createClient()
  const { data: oldData } = await supabase.from('employees').select('*').eq('id', id).single()

  // If rate changed, log rate change history
  if (parsed.data.rate !== undefined && oldData && parsed.data.rate !== oldData.rate) {
    await supabase.from('rate_change_history').insert({
      employee_id: id,
      account_id: auth.accountId,
      old_rate: oldData.rate,
      new_rate: parsed.data.rate,
      changed_by: auth.userId,
    })
  }

  const { data, error } = await supabase
    .from('employees')
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
    businessId: data.business_id,
    action: 'update',
    tableName: 'employees',
    recordId: id,
    oldValue: { rate: oldData?.rate, status: oldData?.status },
    newValue: { rate: data.rate, status: data.status },
    ipAddress: ip,
    userAgent,
  })

  return NextResponse.json({ employee: data })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAuthContext(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.role !== 'owner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const supabase = await createClient()

  // Soft delete — set inactive instead of deleting to preserve payroll history
  const { error } = await supabase
    .from('employees')
    .update({ status: 'inactive' })
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Failed to deactivate employee' }, { status: 500 })

  const { ip, userAgent } = getRequestMeta(request)
  await writeAuditLog({
    accountId: auth.accountId,
    userId: auth.userId,
    userEmail: auth.email,
    action: 'deactivate',
    tableName: 'employees',
    recordId: id,
    ipAddress: ip,
    userAgent,
  })

  return NextResponse.json({ message: 'Employee deactivated' })
}
