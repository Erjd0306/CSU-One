import {
  BarChart3, Bell, ClipboardList, History, House, LayoutDashboard, Map, Menu, CirclePlus, User, Users, Wrench, type LucideIcon,
} from 'lucide-react'
import type { Role } from '../../types'

export type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  /** Extra path prefixes that should highlight this item */
  also?: string[]
  exact?: boolean
  badge?: 'notifications'
  prominent?: boolean
  /** Sidebar group: account items sit at the bottom next to Log Out */
  section?: 'account'
  /** Mobile only: opens the profile menu sheet instead of navigating */
  opensMenu?: boolean
}

export const HOME_ROUTE: Record<Role, string> = {
  student: '/student',
  admin: '/admin',
  maintenance: '/maintenance',
}

export const ROLE_LABEL: Record<Role, string> = {
  student: 'Student',
  admin: 'Administrator',
  maintenance: 'Maintenance',
}

const studentNav: NavItem[] = [
  { to: '/student', label: 'Home', icon: House, exact: true },
  { to: '/student/report', label: 'Report', icon: CirclePlus, prominent: true },
  { to: '/student/reports', label: 'My Reports', icon: ClipboardList },
  { to: '/student/notifications', label: 'Notifications', icon: Bell, badge: 'notifications', section: 'account' },
  { to: '/student/profile', label: 'Profile', icon: User, section: 'account' },
]

const maintenanceNav: NavItem[] = [
  { to: '/maintenance', label: 'Tasks', icon: Wrench, exact: true, also: ['/maintenance/tasks'] },
  { to: '/maintenance/map', label: 'Map', icon: Map },
  { to: '/maintenance/history', label: 'History', icon: History },
  { to: '/maintenance/notifications', label: 'Notifications', icon: Bell, badge: 'notifications', section: 'account' },
  { to: '/maintenance/profile', label: 'Profile', icon: User, section: 'account' },
]

/**
 * Bottom-bar version of a sidebar list: "Notifications" is shortened to "Alerts",
 * and Profile opens the account menu sheet rather than the full Profile page.
 */
const mobileItems = (items: NavItem[]): NavItem[] =>
  items.map((item) => {
    if (item.badge === 'notifications') return { ...item, label: 'Alerts' }
    if (item.to.endsWith('/profile')) return { ...item, opensMenu: true }
    return item
  })

export const NAV: Record<Role, { sidebar: NavItem[]; mobile: NavItem[] }> = {
  student: { sidebar: studentNav, mobile: mobileItems(studentNav) },
  maintenance: { sidebar: maintenanceNav, mobile: mobileItems(maintenanceNav) },
  admin: {
    sidebar: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { to: '/admin/reports', label: 'Reports', icon: ClipboardList },
      { to: '/admin/map', label: 'Campus Map', icon: Map },
      { to: '/admin/teams', label: 'Teams', icon: Users },
      { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/admin/notifications', label: 'Notifications', icon: Bell, badge: 'notifications', section: 'account' },
      { to: '/admin/profile', label: 'Profile', icon: User, section: 'account' },
    ],
    mobile: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { to: '/admin/reports', label: 'Reports', icon: ClipboardList },
      { to: '/admin/map', label: 'Map', icon: Map },
      { to: '/admin/teams', label: 'Teams', icon: Users },
      { to: '/admin/more', label: 'More', icon: Menu, badge: 'notifications', also: ['/admin/analytics', '/admin/notifications', '/admin/profile'] },
    ],
  },
}

export function isActive(item: NavItem, path: string): boolean {
  const hit = (p: string, exact?: boolean) => (exact ? path === p : path === p || path.startsWith(`${p}/`))
  return hit(item.to, item.exact) || (item.also ?? []).some((p) => hit(p))
}
