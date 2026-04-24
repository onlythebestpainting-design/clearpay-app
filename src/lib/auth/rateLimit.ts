import 'server-only'
import { createServiceClient } from '@/lib/supabase/server'

const MAX_ATTEMPTS = 5
const WINDOW_MINUTES = 15

export async function checkLoginRateLimit(email: string, ip: string): Promise<boolean> {
  const supabase = createServiceClient()
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString()

  const { count } = await supabase
    .from('failed_login_attempts')
    .select('*', { count: 'exact', head: true })
    .or(`email.eq.${email},ip_address.eq.${ip}`)
    .gte('attempted_at', windowStart)

  return (count ?? 0) < MAX_ATTEMPTS
}

export async function recordFailedLogin(email: string, ip: string): Promise<void> {
  const supabase = createServiceClient()
  await supabase.from('failed_login_attempts').insert({ email, ip_address: ip })
}

export async function clearFailedLogins(email: string): Promise<void> {
  const supabase = createServiceClient()
  await supabase.from('failed_login_attempts').delete().eq('email', email)
}
