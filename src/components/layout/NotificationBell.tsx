'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface Notification {
  id: string
  type: string
  message: string
  read: boolean
  created_at: string
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => {
        setNotifications(d.notifications ?? [])
        setUnread(d.unreadCount ?? 0)
      })
  }, [])

  async function markAllRead() {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnread(0)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-80 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-800">Notifications</span>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-indigo-600 hover:text-indigo-800">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">No notifications</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-slate-50 ${n.read ? '' : 'bg-indigo-50/40'}`}
                  >
                    <p className="text-sm text-slate-700">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{formatDateTime(n.created_at)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
