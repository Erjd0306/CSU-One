import { useEffect, useState, type FormEvent } from 'react'
import { ROLE_LABEL } from '../../components/layout/navConfig'
import { TEAMS } from '../../data/mockData'
import { ChangePasswordView } from '../../generated/views/shared/profile-password'
import { ProfileView } from '../../generated/views/shared/profile'
import { navigate, useLocation } from '../../lib/router'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { useStore, useUser } from '../../state/AppStore'
import { useToast } from '../../state/Toast'
import type { NotificationPrefs, UserAccount } from '../../types'
import './profile.css'

const SECTION_IDS = ['personal', 'account', 'notifications', 'security'] as const
type SectionId = (typeof SECTION_IDS)[number]
const isSectionId = (v: string | null): v is SectionId => !!v && (SECTION_IDS as readonly string[]).includes(v)

type Row = { label: string; value: string }
type ToggleLabel = { title: string; desc: string }

function personalRows(user: UserAccount): Row[] {
  const rows: Row[] = [{ label: 'Full name', value: user.name }]
  if (user.role === 'student') rows.push({ label: 'Program', value: user.program ?? '—' }, { label: 'Year level', value: user.yearLevel ?? '—' })
  else rows.push({ label: 'Position', value: user.position ?? '—' })
  rows.push({ label: 'Email', value: user.email }, { label: 'Mobile number', value: user.phone })
  return rows
}

function accountRows(user: UserAccount): Row[] {
  const idLabel = user.role === 'student' ? 'Student ID' : user.role === 'maintenance' ? 'Personnel ID' : 'Employee ID'
  const rows: Row[] = [{ label: 'Role', value: ROLE_LABEL[user.role] }, { label: idLabel, value: user.idNumber }, { label: 'Login email', value: user.email }]
  if (user.role === 'maintenance') rows.push({ label: 'Assigned team', value: TEAMS.find((t) => t.id === user.teamId)?.name ?? '—' })
  if (user.office) rows.push({ label: 'Office', value: user.office })
  return rows
}

const STATUS_LABEL: Record<UserAccount['role'], ToggleLabel> = {
  student: { title: 'Report status updates', desc: 'When your report is assigned, started, or resolved.' },
  maintenance: { title: 'Task status updates', desc: 'When a task you handle changes status.' },
  admin: { title: 'Repair progress updates', desc: 'When personnel accept, start, or resolve tasks.' },
}

export type ProfileViewProps = {
  user: UserAccount
  roleLabel: string
  personalRows: Row[]
  accountRows: Row[]
  isOpen: (id: SectionId) => boolean
  toggle: (id: string) => void
  prefs: NotificationPrefs
  togglePref: (key: keyof NotificationPrefs, value: boolean) => void
  statusLabel: ToggleLabel
  /** Assignment notifications apply to staff only */
  assignPref: ToggleLabel | null
  resetOpen: boolean
  openReset: () => void
  closeReset: () => void
  confirmReset: () => void
}

/** Profile (all roles). Markup: profile.html + profile-password.html, styles: profile.css. */
export function ProfilePage() {
  useDocumentTitle('Profile')
  const user = useUser()
  const { prefs, updatePrefs, resetPrototype } = useStore()
  const toast = useToast()
  const { query } = useLocation()
  const requested = query.get('section')
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(isSectionId(requested) ? [requested] : []))
  const [resetOpen, setResetOpen] = useState(false)

  // "Account Settings" / "Notification Settings" in the profile menu open their section directly.
  useEffect(() => {
    if (!isSectionId(requested)) return
    setOpenIds((prev) => new Set(prev).add(requested))
    window.setTimeout(() => document.getElementById(`section-${requested}`)?.scrollIntoView({ block: 'start' }), 50)
  }, [requested])

  return (
    <ProfileView
      user={user}
      roleLabel={ROLE_LABEL[user.role]}
      personalRows={personalRows(user)}
      accountRows={accountRows(user)}
      isOpen={(id) => openIds.has(id)}
      toggle={(id) => setOpenIds((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })}
      prefs={prefs}
      togglePref={(key, value) => { updatePrefs({ ...prefs, [key]: value }); toast.success('Notification preferences saved') }}
      statusLabel={STATUS_LABEL[user.role]}
      assignPref={user.role === 'student' ? null : user.role === 'admin'
        ? { title: 'New reports and requests', desc: 'New reports, student replies, and material requests.' }
        : { title: 'New task assignments', desc: 'When a report is assigned to you.' }}
      resetOpen={resetOpen}
      openReset={() => setResetOpen(true)}
      closeReset={() => setResetOpen(false)}
      confirmReset={() => {
        setResetOpen(false)
        resetPrototype()
        navigate('/', { replace: true })
        toast.success('All data has been reset')
      }}
    />
  )
}

type PwField = 'current' | 'next' | 'confirm'
type PwErrors = Partial<Record<PwField, string>>

export type ChangePasswordViewProps = {
  current: string
  next: string
  confirm: string
  errors: PwErrors
  saving: boolean
  setField: (field: PwField, value: string) => void
  submit: (e: FormEvent) => void
}

/** Change-password form (Profile → Security). Markup: profile-password.html. */
export function ChangePassword() {
  const { changePassword } = useStore()
  const toast = useToast()
  const [values, setValues] = useState<Record<PwField, string>>({ current: '', next: '', confirm: '' })
  const [errors, setErrors] = useState<PwErrors>({})
  const [saving, setSaving] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const found: PwErrors = {}
    if (!values.current) found.current = 'Enter your current password.'
    if (values.next.length < 8 || !/[A-Za-z]/.test(values.next) || !/\d/.test(values.next)) found.next = 'Use at least 8 characters with letters and numbers.'
    if (values.confirm !== values.next) found.confirm = 'The passwords do not match.'
    setErrors(found)
    if (Object.keys(found).length) return
    setSaving(true)
    window.setTimeout(() => {
      const res = changePassword(values.current, values.next)
      setSaving(false)
      if (!res.ok) {
        setErrors(res.error.includes('current') ? { current: res.error } : { next: res.error })
        return
      }
      setValues({ current: '', next: '', confirm: '' })
      toast.success('Password updated. Use it the next time you log in.')
    }, 500)
  }

  return (
    <ChangePasswordView
      current={values.current}
      next={values.next}
      confirm={values.confirm}
      errors={errors}
      saving={saving}
      setField={(field, value) => { setValues((v) => ({ ...v, [field]: value })); setErrors((p) => ({ ...p, [field]: undefined })) }}
      submit={submit}
    />
  )
}
