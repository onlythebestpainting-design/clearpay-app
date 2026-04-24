import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthContext, isValidUUID } from '@/lib/security'

export async function GET(request: NextRequest) {
  const auth = getAuthContext(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const businessId = searchParams.get('business_id')
  const action = searchParams.get('action')
  const userId = searchParams.get('user_id')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)
  const offset = (page - 1) * limit

  const supabase = await createClient()
  let query = supabase
    .from('audit_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (businessId && isValidUUID(businessId)) query = query.eq('business_id', businessId)
  if (action) query = query.eq('action', action)
  if (userId && isValidUUID(userId)) query = query.eq('user_id', userId)
  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', to)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 })

  return NextResponse.json({ entries: data, total: count, page, limit })
}
