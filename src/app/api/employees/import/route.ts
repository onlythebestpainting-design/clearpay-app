import { NextRequest, NextResponse } from 'next/server'
import { csvEmployeeRowSchema } from '@/lib/validations/employee'
import { createClient } from '@/lib/supabase/server'
import { getAuthContext, isValidUUID } from '@/lib/security'
import { writeAuditLog, getRequestMeta } from '@/lib/audit'

export async function POST(request: NextRequest) {
  const auth = getAuthContext(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.role === 'viewer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => null)
  if (!body?.business_id || !Array.isArray(body?.rows)) {
    return NextResponse.json({ error: 'Invalid request — requires business_id and rows[]' }, { status: 400 })
  }

  if (!isValidUUID(body.business_id)) {
    return NextResponse.json({ error: 'Invalid business_id' }, { status: 400 })
  }

  if (body.rows.length > 500) {
    return NextResponse.json({ error: 'Maximum 500 employees per import' }, { status: 400 })
  }

  const valid: object[] = []
  const errors: { row: number; error: string }[] = []

  for (let i = 0; i < body.rows.length; i++) {
    const parsed = csvEmployeeRowSchema.safeParse(body.rows[i])
    if (parsed.success) {
      valid.push({
        ...parsed.data,
        business_id: body.business_id,
        account_id: auth.accountId,
        start_date: parsed.data.start_date ?? new Date().toISOString().split('T')[0],
      })
    } else {
      errors.push({ row: i + 1, error: parsed.error.flatten().formErrors.join(', ') })
    }
  }

  if (valid.length === 0) {
    return NextResponse.json({ error: 'No valid rows found', errors }, { status: 422 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.from('employees').insert(valid).select()

  if (error) return NextResponse.json({ error: 'Import failed' }, { status: 500 })

  const { ip, userAgent } = getRequestMeta(request)
  await writeAuditLog({
    accountId: auth.accountId,
    userId: auth.userId,
    userEmail: auth.email,
    businessId: body.business_id,
    action: 'bulk_import',
    tableName: 'employees',
    recordId: body.business_id,
    newValue: { imported: data.length },
    ipAddress: ip,
    userAgent,
  })

  return NextResponse.json({
    imported: data.length,
    skipped: errors.length,
    errors,
  }, { status: 201 })
}
