import { NextRequest, NextResponse } from 'next/server'
import { n8nWebhookSchema } from '@/lib/validations/hours'
import { createServiceClient } from '@/lib/supabase/server'

// This endpoint receives parsed timecard data from n8n cloud automation
// n8n workflow: monitors email inbox → parses attachment → POSTs here
export async function POST(request: NextRequest) {
  // Validate webhook secret
  const secret = request.headers.get('x-n8n-secret')
  if (!secret || secret !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const parsed = n8nWebhookSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload schema', details: parsed.error.flatten() },
      { status: 422 },
    )
  }

  const supabase = createServiceClient()

  // Verify business exists and get account_id
  const { data: business } = await supabase
    .from('businesses')
    .select('id, account_id')
    .eq('id', parsed.data.business_id)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  const rows = parsed.data.entries.map((e) => ({
    employee_id: e.employee_id,
    business_id: business.id,
    account_id: business.account_id,
    pay_period_start: parsed.data.pay_period_start,
    pay_period_end: parsed.data.pay_period_end,
    regular_hours: e.regular_hours,
    overtime_hours: e.overtime_hours,
    source: 'n8n_webhook' as const,
  }))

  const { data, error } = await supabase.from('hours_entries').insert(rows).select()

  if (error) {
    return NextResponse.json({ error: 'Failed to insert hours' }, { status: 500 })
  }

  // Create notifications for managers assigned to this business
  const { data: managers } = await supabase
    .from('account_members')
    .select('user_id')
    .eq('account_id', business.account_id)
    .or(`role.eq.owner,assigned_businesses.cs.{${business.id}}`)

  if (managers && managers.length > 0) {
    await supabase.from('notifications').insert(
      managers.map((m) => ({
        account_id: business.account_id,
        user_id: m.user_id,
        type: 'payroll_ready',
        message: `Timecard received via email for business. ${data.length} employee records imported.`,
      })),
    )
  }

  return NextResponse.json({ success: true, imported: data.length })
}
