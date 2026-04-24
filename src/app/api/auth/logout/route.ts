import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const sessionId = request.headers.get('x-session-id')
    const serviceClient = createServiceClient()

    if (sessionId) {
      await serviceClient.from('sessions').delete().eq('id', sessionId).eq('user_id', user.id)
    } else {
      // Logout from all sessions for this user
      await serviceClient.from('sessions').delete().eq('user_id', user.id)
    }
  }

  await supabase.auth.signOut()

  return NextResponse.json({ message: 'Logged out' })
}
