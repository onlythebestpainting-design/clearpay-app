'use client'

import { NotificationBell } from './NotificationBell'
import { getInitials } from '@/lib/utils'

interface TopBarProps {
  userEmail: string
  companyName: string
}

export function TopBar({ userEmail, companyName }: TopBarProps) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
      <div>
        <span className="text-sm text-slate-500">{companyName}</span>
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">{getInitials(userEmail)}</span>
          </div>
          <span className="text-sm text-slate-600 hidden sm:block">{userEmail}</span>
        </div>
      </div>
    </header>
  )
}
