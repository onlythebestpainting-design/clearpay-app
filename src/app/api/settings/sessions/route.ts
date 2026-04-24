import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthContext, isValidUUID } from '@/lib/security'

export async function GET(request: NextRequest) {
  const auth = getAuthContext(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', auth.userId)
    .order('last_active', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  return NextResponse.json({ sessions: data })
}

export async function DELETE(request: NextRequest) {
  const auth = getAuthContext(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const sessionId = searchParams.get('id')

  const supabase = await createClient()

  if (sessionId && isValidUUID(sessionId)) {
    await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', auth.userId)
  } else {
    // Revoke all sessions
    await supabase.from('sessions').delete().eq('user_id', auth.userId)
  }

  return NextResponse.json({ message: 'Session(s) revoked' })
}
