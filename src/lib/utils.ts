import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  // Simple className merger without external dep
  return inputs
    .flat()
    .filter(Boolean)
    .join(' ')
    .trim()
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function generateColor(): string {
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
    '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#3b82f6', '#06b6d4',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export function getPeriodLabel(period: string): string {
  const map: Record<string, string> = {
    'weekly': 'Weekly',
    'bi-weekly': 'Bi-Weekly',
    'semi-monthly': 'Semi-Monthly',
    'monthly': 'Monthly',
  }
  return map[period] ?? period
}
