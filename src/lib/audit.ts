import 'server-only'
import { createServiceClient } from '@/lib/supabase/server'

interface AuditParams {
  accountId: string
  userId: string
  userEmail: string
  businessId?: string | null
  action: string
  tableName: string
  recordId: string
  oldValue?: Record<string, unknown> | null
  newValue?: Record<string, unknown> | null
  ipAddress?: string
  userAgent?: string
}

export async function writeAuditLog(params: AuditParams): Promise<void> {
  try {
    const supabase = createServiceClient()
    await supabase.from('audit_log').insert({
      account_id: params.accountId,
      user_id: params.userId,
      user_email: params.userEmail,
      business_id: params.businessId ?? null,
      action: params.action,
      table_name: params.tableName,
      record_id: params.recordId,
      old_value: params.oldValue ?? null,
      new_value: params.newValue ?? null,
      ip_address: params.ipAddress ?? '',
      user_agent: params.userAgent ?? '',
    })
  } catch {
    // Audit log failure must never crash the main operation
  }
}

export function getRequestMeta(request: Request): { ip: string; userAgent: string } {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  const userAgent = request.headers.get('user-agent') ?? 'unknown'
  return { ip, userAgent }
}
