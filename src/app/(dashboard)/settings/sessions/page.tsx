'use client'

import { useState, useEffect } from 'react'
import { Monitor, Smartphone, Globe, Trash2, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/Spinner'
import { formatDateTime } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Session {
  id: string
  created_at: string
  last_active_at: string
  ip_address: string
  user_agent: string
  is_current: boolean
}

function getDeviceIcon(userAgent: string) {
  const ua = userAgent.toLowerCase()
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return <Smartphone className="h-5 w-5 text-slate-500" />
  }
  if (ua.includes('mozilla') || ua.includes('chrome') || ua.includes('safari')) {
    return <Globe className="h-5 w-5 text-slate-500" />
  }
  return <Monitor className="h-5 w-5 text-slate-500" />
}

function getBrowserName(userAgent: string) {
  const ua = userAgent
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Edge')) return 'Edge'
  return 'Unknown browser'
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/settings/sessions')
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions ?? []))
      .finally(() => setLoading(false))
  }, [])

  async function handleRevoke(sessionId: string) {
    setRevoking(sessionId)
    try {
      const res = await fetch(`/api/settings/sessions?session_id=${sessionId}`, { method: 'DELETE' })
      if (!res.ok) { toast.error('Failed to revoke session'); return }
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      toast.success('Session revoked')
    } finally {
      setRevoking(null)
    }
  }

  async function handleRevokeAll() {
    if (!confirm('Revoke all other sessions? You will remain logged in on this device.')) return
    setRevoking('all')
    try {
      const res = await fetch('/api/settings/sessions?all=true', { method: 'DELETE' })
      if (!res.ok) { toast.error('Failed to revoke sessions'); return }
      setSessions((prev) => prev.filter((s) => s.is_current))
      toast.success('All other sessions revoked')
    } finally {
      setRevoking(null)
    }
  }

  if (loading) return <PageLoader />

  const otherSessions = sessions.filter((s) => !s.is_current)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Active Sessions</h1>
          <p className="text-sm text-slate-500">{sessions.length} active session{sessions.length !== 1 ? 's' : ''}</p>
        </div>
        {otherSessions.length > 0 && (
          <Button variant="danger" size="sm" onClick={handleRevokeAll} loading={revoking === 'all'}>
            <LogOut className="h-4 w-4" /> Revoke All Others
          </Button>
        )}
      </div>

      <Card padding={false}>
        <div className="divide-y divide-slate-50">
          {sessions.length === 0 ? (
            <p className="py-12 text-center text-slate-400 text-sm">No active sessions found</p>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    {getDeviceIcon(session.user_agent)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-800">
                        {getBrowserName(session.user_agent)}
                      </p>
                      {session.is_current && (
                        <span className="inline-flex px-1.5 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {session.ip_address} · Last active {formatDateTime(session.last_active_at)}
                    </p>
                    <p className="text-xs text-slate-400">
                      Signed in {formatDateTime(session.created_at)}
                    </p>
                  </div>
                </div>
                {!session.is_current && (
                  <button
                    onClick={() => handleRevoke(session.id)}
                    disabled={revoking === session.id}
                    className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    {revoking === session.id ? 'Revoking…' : 'Revoke'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <p className="text-xs text-slate-500">
          Sessions expire after 8 hours of inactivity. Revoking a session immediately signs that device out.
          If you see a session you don't recognize, revoke it and change your password immediately.
        </p>
      </Card>
    </div>
  )
}
