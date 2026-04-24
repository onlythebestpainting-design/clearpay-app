import 'server-only'
import { createHmac, randomBytes } from 'crypto'

// Sanitize user input — strip dangerous characters for XSS prevention
export function sanitize(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// CSRF token generation and validation (double-submit cookie pattern)
const CSRF_SECRET = process.env.APP_SECRET ?? 'fallback-secret-change-me'

export function generateCsrfToken(sessionId: string): string {
  const nonce = randomBytes(16).toString('hex')
  const signature = createHmac('sha256', CSRF_SECRET)
    .update(`${sessionId}:${nonce}`)
    .digest('hex')
  return `${nonce}.${signature}`
}

export function validateCsrfToken(token: string, sessionId: string): boolean {
  try {
    const [nonce, signature] = token.split('.')
    if (!nonce || !signature) return false
    const expected = createHmac('sha256', CSRF_SECRET)
      .update(`${sessionId}:${nonce}`)
      .digest('hex')
    return signature === expected
  } catch {
    return false
  }
}

// Strip sensitive fields before sending to client
export function stripSensitiveFields<T extends Record<string, unknown>>(
  obj: T,
  fields: string[],
): Partial<T> {
  const result = { ...obj }
  for (const field of fields) {
    delete result[field]
  }
  return result
}

// Validate that a UUID is valid format
export function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)
}

// Get authenticated user context from API route (attaches in middleware)
export function getAuthContext(request: Request): {
  userId: string
  email: string
  accountId: string
  role: string
} | null {
  const userId = request.headers.get('x-user-id')
  const email = request.headers.get('x-user-email')
  const accountId = request.headers.get('x-account-id')
  const role = request.headers.get('x-user-role')

  if (!userId || !email || !accountId || !role) return null
  return { userId, email, accountId, role }
}
