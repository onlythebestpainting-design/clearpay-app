interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
  size?: 'sm' | 'md'
}

const variants = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  purple: 'bg-indigo-100 text-indigo-700',
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
}

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeProps['variant']> = {
    ready: 'success',
    active: 'success',
    pending: 'warning',
    blocked: 'danger',
    under_review: 'info',
    inactive: 'default',
    locked: 'purple',
    approved: 'success',
  }
  return <Badge variant={map[status] ?? 'default'}>{status.replace('_', ' ')}</Badge>
}
