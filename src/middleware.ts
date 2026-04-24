import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServiceClient } from '@/lib/supabase/server'

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/privacy',
  '/terms',
]

const API_PUBLIC_PATHS = [
  '/api/auth/signup',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/reset-password',
  '/api/webhooks/n8n',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  const isPublicPage = PUBLIC_PATHS.some((p) => pathname === p)
  const isPublicApi = API_PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  const isStaticAsset = pathname.startsWith('/_next') || pathname.startsWith('/favicon')

  if (isStaticAsset) return NextResponse.next()

  const { supabaseResponse, user } = await updateSession(request)

  // Unauthenticated user on protected route
  if (!user) {
    if (isPublicPage || isPublicApi) return supabaseResponse
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated user on auth pages — redirect to dashboard
  if (user && isPublicPage && pathname !== '/' && pathname !== '/privacy' && pathname !== '/terms') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Attach user context to request headers for API routes
  if (pathname.startsWith('/api/') && !isPublicApi) {
    try {
      // Get account membership using service client to bypass RLS for this lookup
      const serviceSupabase = createServiceClient()
      const { data: member } = await serviceSupabase
        .from('account_members')
        .select('account_id, role, assigned_businesses')
        .eq('user_id', user.id)
        .not('accepted_at', 'is', null)
        .single()

      if (!member) {
        return NextResponse.json({ error: 'Account not found' }, { status: 403 })
      }

      const requestWithAuth = new Request(request, {
        headers: new Headers({
          ...Object.fromEntries(request.headers.entries()),
          'x-user-id': user.id,
          'x-user-email': user.email ?? '',
          'x-account-id': member.account_id,
          'x-user-role': member.role,
          'x-assigned-businesses': JSON.stringify(member.assigned_businesses ?? []),
        }),
      })

      return NextResponse.next({ request: requestWithAuth })
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
