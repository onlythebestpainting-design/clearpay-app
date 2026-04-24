import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthContext, isValidUUID } from '@/lib/security'

export async function GET(request: NextRequest) {
  const auth = getAuthContext(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', auth.userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })

  const unreadCount = data?.filter((n) => !n.read).length ?? 0
  return NextResponse.json({ notifications: data, unreadCount })
}

export async function PATCH(request: NextRequest) {
  const auth = getAuthContext(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const supabase = await createClient()

  if (body?.markAllRead) {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', auth.userId)
    return NextResponse.json({ message: 'All marked as read' })
  }

  if (body?.id && isValidUUID(body.id)) {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', body.id)
      .eq('user_id', auth.userId)
    return NextResponse.json({ message: 'Marked as read' })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
