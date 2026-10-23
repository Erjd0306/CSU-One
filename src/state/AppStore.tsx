import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ADMIN_ID, LEGACY_SAMPLE_REPORT_IDS, TEST_ACCOUNTS, maintenanceStaff } from '../data/mockData'
import { STORAGE_KEYS, clearAppStorage, readJSON, removeKey, writeJSON } from '../lib/storage'
import { initialsOf, uid } from '../lib/format'
import type {
  AppNotification, Availability, NewReportInput, NotificationPrefs, NotificationType, Personnel, Report,
  Session, TimelineEvent, TimelineType, UserAccount,
} from '../types'

export const DEFAULT_PREFS: NotificationPrefs = { statusUpdates: true, assignments: true, email: true, sms: false }

type Result = { ok: true } | { ok: false; error: string }

export type RegistrationInput = { name: string; idNumber: string; email: string; password: string }
export type RegistrationResult = { ok: true; account: UserAccount } | { ok: false; field: 'idNumber' | 'email'; error: string }

interface Store {
  user: UserAccount | null
  reports: Report[]
  notifications: AppNotification[]
  personnel: Personnel[]
  prefs: NotificationPrefs
  storageError: boolean
  login: (identifier: string, password: string, remember: boolean) => UserAccount | null
  /** Creates a student account (staff accounts are issued by the Facilities Office) and logs it in. */
  register: (input: RegistrationInput) => RegistrationResult
  logout: () => void
  submitReport: (input: NewReportInput) => Report | null
  assignReport: (reportId: string, personnelId: string) => Result
  acceptTask: (reportId: string) => Result
  startRepair: (reportId: string) => Result
  addProgressNote: (reportId: string, text: string) => Result
  addInternalNote: (reportId: string, text: string) => Result
  setCompletionPhoto: (reportId: string, photo: string) => Result
  reportMaterials: (reportId: string, text: string) => Result
  resolveReport: (reportId: string, note: string) => Result
  reopenReport: (reportId: string, reason: string) => Result
  requestInfo: (reportId: string, message: string) => Result
  provideInfo: (reportId: string, message: string) => Result
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  updatePrefs: (prefs: NotificationPrefs) => void
  changePassword: (current: string, next: string) => Result
  setAvailability: (personnelId: string, availability: Availability) => void
  resetPrototype: () => void
}

const StoreContext = createContext<Store | null>(null)

const STATUS_TYPES: NotificationType[] = ['assigned', 'accepted', 'started', 'resolved', 'reopened']
const ASSIGNMENT_TYPES: NotificationType[] = ['task_assigned', 'new_report', 'materials', 'info_provided']

function loadSession(): Session | null {
  return readJSON<Session | null>(STORAGE_KEYS.session, null, 'local') ?? readJSON<Session | null>(STORAGE_KEYS.session, null, 'session')
}

/**
 * Loads stored data. Sample records seeded by earlier versions (reports, their
 * notifications, fictional staff) are dropped; user-created data is kept.
 */
function loadData(): { reports: Report[]; notifications: AppNotification[]; personnel: Personnel[] } {
  const storedReports = readJSON<Report[] | null>(STORAGE_KEYS.reports, null)
  const storedNotifications = readJSON<AppNotification[] | null>(STORAGE_KEYS.notifications, null)
  const storedPersonnel = readJSON<Personnel[] | null>(STORAGE_KEYS.personnel, null)
  const availability = Object.fromEntries((Array.isArray(storedPersonnel) ? storedPersonnel : []).map((p) => [p.id, p.availability]))
  const personnel = maintenanceStaff(TEST_ACCOUNTS, availability)
  const staffIds = new Set(personnel.map((p) => p.id))

  const reports = (Array.isArray(storedReports) ? storedReports : [])
    .filter((r) => !LEGACY_SAMPLE_REPORT_IDS.has(r.id))
    // Active work assigned to a removed sample staff member goes back to Open for reassignment.
    .map((r): Report => (r.assigneeId && !staffIds.has(r.assigneeId) && r.status !== 'Resolved'
      ? { ...r, status: 'Open', assigneeId: undefined, accepted: false, assignedAt: undefined, startedAt: undefined }
      : r))
  const reportIds = new Set(reports.map((r) => r.id))
  const notifications = (Array.isArray(storedNotifications) ? storedNotifications : [])
    .filter((n) => !n.id.startsWith('seed-') && (!n.reportId || reportIds.has(n.reportId)))
  return { reports, notifications, personnel }
}

export function personName(personnel: Personnel[], id?: string): string {
  return personnel.find((p) => p.id === id)?.name ?? 'Unassigned'
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(loadSession)
  const [initial] = useState(loadData)
  const [reports, setReports] = useState<Report[]>(initial.reports)
  const [notifications, setNotifications] = useState<AppNotification[]>(initial.notifications)
  const [personnel, setPersonnel] = useState<Personnel[]>(initial.personnel)
  const [prefsByUser, setPrefsByUser] = useState<Record<string, NotificationPrefs>>(() => readJSON(STORAGE_KEYS.prefs, {}))
  const [passwords, setPasswords] = useState<Record<string, string>>(() => readJSON(STORAGE_KEYS.passwords, {}))
  const [registered, setRegistered] = useState<UserAccount[]>(() => readJSON<UserAccount[]>(STORAGE_KEYS.accounts, []))
  const [storageError, setStorageError] = useState(false)
  const accounts = useMemo(() => [...TEST_ACCOUNTS, ...registered], [registered])

  const reportsRef = useRef(reports)
  reportsRef.current = reports
  const prefsRef = useRef(prefsByUser)
  prefsRef.current = prefsByUser

  // Persist every slice. A failed write (usually the storage quota) is surfaced to the UI.
  useEffect(() => { setStorageError(!writeJSON(STORAGE_KEYS.reports, reports)) }, [reports])
  useEffect(() => { writeJSON(STORAGE_KEYS.notifications, notifications) }, [notifications])
  useEffect(() => { writeJSON(STORAGE_KEYS.personnel, personnel) }, [personnel])
  useEffect(() => { writeJSON(STORAGE_KEYS.prefs, prefsByUser) }, [prefsByUser])
  useEffect(() => { writeJSON(STORAGE_KEYS.passwords, passwords) }, [passwords])
  useEffect(() => { writeJSON(STORAGE_KEYS.accounts, registered) }, [registered])

  // Keep other open tabs in sync so every dashboard reflects the latest status.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return
      try {
        if (e.key === STORAGE_KEYS.reports) setReports(JSON.parse(e.newValue) as Report[])
        if (e.key === STORAGE_KEYS.notifications) setNotifications(JSON.parse(e.newValue) as AppNotification[])
        if (e.key === STORAGE_KEYS.personnel) setPersonnel(JSON.parse(e.newValue) as Personnel[])
      } catch {
        /* ignore malformed values written by other tabs */
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const user = useMemo(() => {
    const account = accounts.find((a) => a.id === session?.userId)
    return account ? { ...account, password: passwords[account.id] ?? account.password } : null
  }, [session, passwords, accounts])

  const prefs = (user && prefsByUser[user.id]) || DEFAULT_PREFS

  const notify = (recipientId: string, report: Report, type: NotificationType, title: string, message: string) => {
    if (!recipientId) return
    const recipientPrefs = prefsRef.current[recipientId] ?? DEFAULT_PREFS
    if (STATUS_TYPES.includes(type) && !recipientPrefs.statusUpdates) return
    if (ASSIGNMENT_TYPES.includes(type) && !recipientPrefs.assignments) return
    setNotifications((prev) => [
      { id: uid('ntf'), recipientId, reportId: report.id, type, title, message, createdAt: new Date().toISOString(), read: false },
      ...prev,
    ])
  }

  const event = (type: TimelineType, label: string, detail?: string): TimelineEvent => ({
    id: uid('evt'), type, label, detail, at: new Date().toISOString(), by: user?.name ?? 'System',
  })

  /** Applies a change to one report and stamps updatedAt. */
  const patch = (reportId: string, change: (r: Report) => Partial<Report>, ...events: TimelineEvent[]) => {
    setReports((prev) => prev.map((r) => (r.id === reportId
      ? { ...r, ...change(r), updatedAt: new Date().toISOString(), timeline: [...r.timeline, ...events] }
      : r)))
  }

  const find = (reportId: string) => reportsRef.current.find((r) => r.id === reportId)
  const fail = (error: string): Result => ({ ok: false, error })
  const ok: Result = { ok: true }

  const requireRole = (...roles: UserAccount['role'][]) => !!user && roles.includes(user.role)

  const store: Store = {
    user,
    reports,
    notifications,
    personnel,
    prefs,
    storageError,

    login(identifier, password, remember) {
      const id = identifier.trim().toLowerCase()
      const account = accounts.find((a) => a.email.toLowerCase() === id || a.idNumber.toLowerCase() === id)
      if (!account || (passwords[account.id] ?? account.password) !== password) return null
      const next: Session = { userId: account.id, remember }
      removeKey(STORAGE_KEYS.session, 'local')
      removeKey(STORAGE_KEYS.session, 'session')
      writeJSON(STORAGE_KEYS.session, next, remember ? 'local' : 'session')
      setSession(next)
      return account
    },

    register({ name, idNumber, email, password }) {
      const cleanEmail = email.trim().toLowerCase()
      const cleanId = idNumber.trim()
      if (accounts.some((a) => a.email.toLowerCase() === cleanEmail)) return { ok: false, field: 'email', error: 'An account with this email already exists. Log in instead.' }
      if (accounts.some((a) => a.idNumber.toLowerCase() === cleanId.toLowerCase())) return { ok: false, field: 'idNumber', error: 'An account with this ID number already exists.' }
      const account: UserAccount = {
        id: uid('u-stu'),
        role: 'student',
        name: name.trim().replace(/\s+/g, ' '),
        initials: initialsOf(name),
        email: cleanEmail,
        idNumber: cleanId,
        password,
        phone: '—',
      }
      setRegistered((prev) => [...prev, account])
      // New accounts start a remembered session, like a freshly installed app.
      const next: Session = { userId: account.id, remember: true }
      removeKey(STORAGE_KEYS.session, 'session')
      writeJSON(STORAGE_KEYS.session, next, 'local')
      setSession(next)
      return { ok: true, account }
    },

    logout() {
      removeKey(STORAGE_KEYS.session, 'local')
      removeKey(STORAGE_KEYS.session, 'session')
      setSession(null)
    },

    submitReport(input) {
      if (!user || user.role !== 'student') return null
      const maxId = reportsRef.current.reduce((m, r) => Math.max(m, Number(r.id.replace(/\D/g, '')) || 0), 1000)
      const now = new Date().toISOString()
      const report: Report = {
        ...input,
        id: `CSU-${maxId + 1}`,
        status: 'Open',
        reporterId: user.id,
        reporterName: user.name,
        reporterIdNumber: user.idNumber,
        accepted: false,
        createdAt: now,
        updatedAt: now,
        timeline: [{ id: uid('evt'), type: 'submitted', label: 'Report submitted', at: now, by: user.name }],
        notes: [],
      }
      setReports((prev) => [report, ...prev])
      notify(user.id, report, 'received', 'Report received', `${report.id} · ${report.title} was received by the Campus Facilities Office.`)
      notify(ADMIN_ID, report, 'new_report', 'New report submitted', `${report.id} · ${report.title} (${report.priority}) needs review.`)
      return report
    },

    assignReport(reportId, personnelId) {
      const r = find(reportId)
      if (!requireRole('admin')) return fail('Only administrators can assign reports.')
      if (!r) return fail('Report not found.')
      if (r.status === 'Resolved') return fail('Reopen the report before assigning it again.')
      if (r.assigneeId === personnelId) return fail('This report is already assigned to that person.')
      const name = personName(personnel, personnelId)
      const isReassign = !!r.assigneeId
      patch(reportId, () => ({ status: 'Assigned', assigneeId: personnelId, accepted: false, assignedAt: new Date().toISOString(), startedAt: undefined }),
        event(isReassign ? 'reassigned' : 'assigned', `${isReassign ? 'Reassigned' : 'Assigned'} to ${name}`))
      if (!isReassign) notify(r.reporterId, r, 'assigned', 'Report assigned', `${r.id} · ${r.title} was assigned to the maintenance team.`)
      notify(personnelId, r, 'task_assigned', 'New task assigned', `${r.id} · ${r.title} (${r.priority}) was assigned to you.`)
      return ok
    },

    acceptTask(reportId) {
      const r = find(reportId)
      if (!r || !user || r.assigneeId !== user.id) return fail('This task is not assigned to you.')
      if (r.status !== 'Assigned' || r.accepted) return fail('This task cannot be accepted right now.')
      patch(reportId, () => ({ accepted: true }), event('accepted', 'Task accepted'))
      notify(ADMIN_ID, r, 'accepted', 'Task accepted', `${user.name} accepted ${r.id} · ${r.title}.`)
      return ok
    },

    startRepair(reportId) {
      const r = find(reportId)
      if (!r || !user || r.assigneeId !== user.id) return fail('This task is not assigned to you.')
      if (r.status !== 'Assigned') return fail('Only assigned tasks can be started.')
      if (!r.accepted) return fail('Accept the task before starting the repair.')
      patch(reportId, () => ({ status: 'In Progress', startedAt: new Date().toISOString() }), event('started', 'Repair started'))
      notify(r.reporterId, r, 'started', 'Repair started', `Work has started on ${r.id} · ${r.title}.`)
      notify(ADMIN_ID, r, 'started', 'Repair started', `${user.name} started work on ${r.id}.`)
      return ok
    },

    addProgressNote(reportId, text) {
      const r = find(reportId)
      if (!r || !user || r.assigneeId !== user.id) return fail('This task is not assigned to you.')
      if (!text.trim()) return fail('Write a short progress note first.')
      patch(reportId, (cur) => ({ notes: [...cur.notes, { id: uid('note'), authorName: user.name, authorRole: user.role, text: text.trim(), at: new Date().toISOString() }] }),
        event('progress', 'Progress update', text.trim()))
      return ok
    },

    addInternalNote(reportId, text) {
      if (!requireRole('admin', 'maintenance') || !user) return fail('Only staff can add internal notes.')
      if (!text.trim()) return fail('Write a note first.')
      patch(reportId, (cur) => ({ notes: [...cur.notes, { id: uid('note'), authorName: user.name, authorRole: user.role, text: text.trim(), at: new Date().toISOString() }] }))
      return ok
    },

    setCompletionPhoto(reportId, photo) {
      const r = find(reportId)
      if (!r || !user || r.assigneeId !== user.id) return fail('This task is not assigned to you.')
      patch(reportId, () => ({ completionPhoto: photo }), event('completion_photo', 'Completion photo added'))
      return ok
    },

    reportMaterials(reportId, text) {
      const r = find(reportId)
      if (!r || !user || r.assigneeId !== user.id) return fail('This task is not assigned to you.')
      if (!text.trim()) return fail('List the materials that are needed.')
      patch(reportId, () => ({ materialsNeeded: text.trim() }), event('materials', 'Additional materials needed', text.trim()))
      notify(ADMIN_ID, r, 'materials', 'Materials requested', `${user.name} needs materials for ${r.id}: ${text.trim()}`)
      return ok
    },

    resolveReport(reportId, note) {
      const r = find(reportId)
      if (!r || !user) return fail('Report not found.')
      const isAssignee = user.role === 'maintenance' && r.assigneeId === user.id
      if (!isAssignee && user.role !== 'admin') return fail('You cannot resolve this report.')
      if (isAssignee && r.status !== 'In Progress') return fail('Start the repair before marking it as resolved.')
      if (r.status === 'Resolved') return fail('This report is already resolved.')
      patch(reportId, () => ({ status: 'Resolved', resolvedAt: new Date().toISOString(), materialsNeeded: undefined, pendingInfoRequest: undefined }),
        event('resolved', 'Marked as resolved', note.trim() || undefined))
      notify(r.reporterId, r, 'resolved', 'Report resolved', `${r.id} · ${r.title} has been fixed. Thank you for reporting.`)
      if (isAssignee) notify(ADMIN_ID, r, 'resolved', 'Task resolved', `${user.name} resolved ${r.id} · ${r.title}.`)
      return ok
    },

    reopenReport(reportId, reason) {
      const r = find(reportId)
      if (!requireRole('admin')) return fail('Only administrators can reopen reports.')
      if (!r || r.status !== 'Resolved') return fail('Only resolved reports can be reopened.')
      if (!reason.trim()) return fail('Give a reason for reopening.')
      patch(reportId, () => ({ status: 'Open', assigneeId: undefined, accepted: false, resolvedAt: undefined, startedAt: undefined, assignedAt: undefined }),
        event('reopened', 'Report reopened', reason.trim()))
      notify(r.reporterId, r, 'reopened', 'Report reopened', `${r.id} · ${r.title} was reopened: ${reason.trim()}`)
      return ok
    },

    requestInfo(reportId, message) {
      const r = find(reportId)
      if (!requireRole('admin')) return fail('Only administrators can request information.')
      if (!r) return fail('Report not found.')
      if (!message.trim()) return fail('Write what information you need.')
      patch(reportId, () => ({ pendingInfoRequest: message.trim() }), event('info_requested', 'Additional information requested', message.trim()))
      notify(r.reporterId, r, 'info_requested', 'More information requested', `${r.id}: ${message.trim()}`)
      return ok
    },

    provideInfo(reportId, message) {
      const r = find(reportId)
      if (!r || !user || r.reporterId !== user.id) return fail('You can only respond to your own reports.')
      if (!message.trim()) return fail('Write your response first.')
      patch(reportId, () => ({ pendingInfoRequest: undefined }), event('info_provided', 'Information provided by student', message.trim()))
      notify(ADMIN_ID, r, 'info_provided', 'Student responded', `${user.name} replied on ${r.id}: ${message.trim()}`)
      return ok
    },

    markNotificationRead(id) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    },

    markAllNotificationsRead() {
      if (!user) return
      setNotifications((prev) => prev.map((n) => (n.recipientId === user.id ? { ...n, read: true } : n)))
    },

    updatePrefs(next) {
      if (!user) return
      setPrefsByUser((prev) => ({ ...prev, [user.id]: next }))
    },

    changePassword(current, next) {
      if (!user) return fail('You are not logged in.')
      if (current !== user.password) return fail('Your current password is incorrect.')
      if (next.length < 8 || !/[A-Za-z]/.test(next) || !/\d/.test(next)) return fail('Use at least 8 characters with letters and numbers.')
      if (next === current) return fail('Choose a password different from your current one.')
      setPasswords((prev) => ({ ...prev, [user.id]: next }))
      return ok
    },

    setAvailability(personnelId, availability) {
      setPersonnel((prev) => prev.map((p) => (p.id === personnelId ? { ...p, availability } : p)))
    },

    resetPrototype() {
      clearAppStorage()
      setReports([])
      setNotifications([])
      setPersonnel(maintenanceStaff(TEST_ACCOUNTS))
      setPrefsByUser({})
      setPasswords({})
      setRegistered([])
      setSession(null)
    },
  }

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

/** The current user, for pages that are only rendered behind the role guard. */
export function useUser(): UserAccount {
  const { user } = useStore()
  if (!user) throw new Error('useUser requires a logged-in user')
  return user
}

export function useMyNotifications() {
  const { notifications, user } = useStore()
  return useMemo(() => notifications.filter((n) => n.recipientId === user?.id), [notifications, user])
}
