import { useState } from 'react'
import {
  CircleCheck, ClipboardCheck, FilePlus2, Inbox, MessageCircleQuestion, MessageSquareReply,
  PackageOpen, RotateCcw, UserCheck, Wrench, type LucideIcon,
} from 'lucide-react'
import { NotificationListView } from '../../generated/views/shared/notification-list'
import { NotificationsView } from '../../generated/views/shared/notifications'
import { timeAgo } from '../../lib/format'
import { navigate } from '../../lib/router'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { useMyNotifications, useStore } from '../../state/AppStore'
import { useToast } from '../../state/Toast'
import type { AppNotification, NotificationType, Role } from '../../types'
import './notification-list.css'
import './notifications.css'

type Tone = 'neutral' | 'danger' | 'navy' | 'warning' | 'success'

const ICONS: Record<NotificationType, { icon: LucideIcon; tone: Tone }> = {
  received: { icon: Inbox, tone: 'neutral' },
  new_report: { icon: FilePlus2, tone: 'danger' },
  assigned: { icon: UserCheck, tone: 'navy' },
  task_assigned: { icon: ClipboardCheck, tone: 'navy' },
  accepted: { icon: UserCheck, tone: 'navy' },
  started: { icon: Wrench, tone: 'warning' },
  resolved: { icon: CircleCheck, tone: 'success' },
  reopened: { icon: RotateCcw, tone: 'danger' },
  info_requested: { icon: MessageCircleQuestion, tone: 'navy' },
  info_provided: { icon: MessageSquareReply, tone: 'navy' },
  materials: { icon: PackageOpen, tone: 'warning' },
}

export function reportRoute(role: Role, reportId: string): string {
  if (role === 'student') return `/student/reports/${reportId}`
  if (role === 'maintenance') return `/maintenance/tasks/${reportId}`
  return `/admin/reports?id=${reportId}`
}

export type NotificationItem = {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  Icon: LucideIcon
  tone: Tone
  open: () => void
  markRead: () => void
}

export type NotificationListViewProps = { items: NotificationItem[]; compact: boolean }

/** Notification rows. Markup: notification-list.html, styles: notification-list.css. */
export function NotificationList({ items, compact = false }: { items: AppNotification[]; compact?: boolean }) {
  const { user, reports, markNotificationRead } = useStore()
  const open = (n: AppNotification) => {
    markNotificationRead(n.id)
    if (!user || !n.reportId) return
    // Maintenance can only open tasks still assigned to them.
    const r = reports.find((x) => x.id === n.reportId)
    if (user.role === 'maintenance' && r?.assigneeId !== user.id) return
    navigate(reportRoute(user.role, n.reportId))
  }
  const view: NotificationItem[] = items.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    time: timeAgo(n.createdAt),
    read: n.read,
    Icon: ICONS[n.type].icon,
    tone: ICONS[n.type].tone,
    open: () => open(n),
    markRead: () => markNotificationRead(n.id),
  }))
  return <NotificationListView items={view} compact={compact} />
}

export type NotificationsViewProps = {
  items: AppNotification[]
  visible: AppNotification[]
  view: 'All' | 'Unread'
  setView: (v: 'All' | 'Unread') => void
  unread: number
  markAll: () => void
}

/** Notifications page (all roles). Markup: notifications.html, styles: notifications.css. */
export function NotificationsPage() {
  useDocumentTitle('Notifications')
  const { markAllNotificationsRead } = useStore()
  const toast = useToast()
  const items = useMyNotifications()
  const [view, setView] = useState<'All' | 'Unread'>('All')
  const unread = items.filter((n) => !n.read).length

  return (
    <NotificationsView
      items={items}
      visible={view === 'Unread' ? items.filter((n) => !n.read) : items}
      view={view}
      setView={setView}
      unread={unread}
      markAll={() => { markAllNotificationsRead(); toast.success('All notifications marked as read') }}
    />
  )
}
