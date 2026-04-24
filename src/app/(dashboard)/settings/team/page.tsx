'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Trash2, Shield, Eye, Crown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/Spinner'
import toast from 'react-hot-toast'

interface TeamMember {
  id: string
  user_id: string
  role: string
  accepted_at: string | null
  created_at: string
  profiles: { email: string; full_name?: string } | null
}

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'viewer', label: 'Viewer' },
]

const roleIcon = (role: string) => {
  if (role === 'owner') return <Crown className="h-3.5 w-3.5 text-amber-500" />
  if (role === 'admin') return <Shield className="h-3.5 w-3.5 text-indigo-500" />
  return <Eye className="h-3.5 w-3.5 text-slate-400" />
}

const roleColors: Record<string, string> = {
  owner: 'bg-amber-50 text-amber-700',
  admin: 'bg-indigo-50 text-indigo-700',
  viewer: 'bg-slate-100 text-slate-600',
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('viewer')
  const [inviting, setInviting] = useState(false)
  const [myRole, setMyRole] = useState('')

  useEffect(() => {
    fetch('/api/settings/team')
      .then((r) => r.json())
      .then((d) => {
        setMembers(d.members ?? [])
        setMyRole(d.myRole ?? '')
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviting(true)
    try {
      const res = await fetch('/api/settings/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Invite failed'); return }
      toast.success('Invitation sent')
      setShowInvite(false)
      setInviteEmail('')
      setInviteRole('viewer')
      setMembers((prev) => [...prev, data.member])
    } finally {
      setInviting(false)
    }
  }

  async function handleRoleChange(memberId: string, role: string) {
    const res = await fetch(`/api/settings/team`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member_id: memberId, role }),
    })
    if (!res.ok) { toast.error('Failed to update role'); return }
    setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, role } : m))
    toast.success('Role updated')
  }

  async function handleRemove(memberId: string) {
    if (!confirm('Remove this team member?')) return
    const res = await fetch(`/api/settings/team?member_id=${memberId}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Failed to remove member'); return }
    setMembers((prev) => prev.filter((m) => m.id !== memberId))
    toast.success('Member removed')
  }

  if (loading) return <PageLoader />

  const isOwner = myRole === 'owner'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Members</h1>
          <p className="text-sm text-slate-500">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>
        {isOwner && (
          <Button onClick={() => setShowInvite(true)}>
            <Plus className="h-4 w-4" /> Invite Member
          </Button>
        )}
      </div>

      <Card padding={false}>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Users className="h-4 w-4 text-indigo-500" />
          <h2 className="font-semibold text-slate-800">Team Roster</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {members.length === 0 ? (
            <p className="py-12 text-center text-slate-400 text-sm">No team members yet</p>
          ) : (
            members.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                    {(m.profiles?.email ?? '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{m.profiles?.email ?? '—'}</p>
                    <p className="text-xs text-slate-400">
                      {m.accepted_at ? 'Active member' : 'Invite pending'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[m.role] ?? 'bg-slate-100 text-slate-600'}`}>
                    {roleIcon(m.role)} {m.role}
                  </span>
                  {isOwner && m.role !== 'owner' && (
                    <div className="flex items-center gap-2">
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        className="text-xs border border-slate-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                      >
                        <option value="admin">Admin</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <button
                        onClick={() => handleRemove(m.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-800 mb-3 text-sm">Role Permissions</h3>
        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex gap-3">
            <span className="font-semibold text-amber-600 w-14">Owner</span>
            <span>Full access — manage team, all businesses, delete account</span>
          </div>
          <div className="flex gap-3">
            <span className="font-semibold text-indigo-600 w-14">Admin</span>
            <span>All payroll actions — cannot manage team or delete account</span>
          </div>
          <div className="flex gap-3">
            <span className="font-semibold text-slate-500 w-14">Viewer</span>
            <span>Read-only — cannot create, edit, or delete any records</span>
          </div>
        </div>
      </Card>

      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite Team Member">
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            required
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <Select
            label="Role"
            options={ROLE_OPTIONS}
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
          />
          <p className="text-xs text-slate-500">
            An invitation email will be sent. They'll need to create an account if they don't have one.
          </p>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowInvite(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={inviting} className="flex-1">Send Invite</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
