'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, Users, Clock, Calculator,
  FileText, Settings, Shield, LogOut, ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Businesses', href: '/businesses', icon: Building2 },
  { label: 'Employees', href: '/employees', icon: Users },
  { label: 'Hours', href: '/hours', icon: Clock },
  { label: 'Calculator', href: '/calculator', icon: Calculator },
  { label: 'Reports', href: '/reports', icon: FileText },
  { label: 'Audit Log', href: '/audit', icon: Shield },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    await supabase.auth.signOut()
    router.push('/login')
    toast.success('Logged out')
  }

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col min-h-screen flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CP</span>
          </div>
          <span className="text-white font-semibold text-lg">ClearPay</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
              ].join(' ')}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
              {active && <ChevronRight className="h-3 w-3 ml-auto opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </aside>
  )
}
