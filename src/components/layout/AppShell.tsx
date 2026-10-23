import { useEffect, useState, type ReactNode } from 'react'
import { Bell, LogOut, Moon, Sun, TriangleAlert } from 'lucide-react'
import { Link, useLocation } from '../../lib/router'
import { useTheme, type Theme } from '../../lib/theme'
import { useMyNotifications, useStore, useUser } from '../../state/AppStore'
import type { Role } from '../../types'
import { AppLogo } from '../ui/Logo'
import { PageSkeleton } from '../ui/Page'
import { LogoutButton } from './LogoutButton'
import { LogoutProvider } from './LogoutConfirmationDialog'
import { MobileBottomNav } from './MobileBottomNav'
import { ProfileDropdown } from './ProfileMenu'
import { HOME_ROUTE, NAV, ROLE_LABEL, isActive, type NavItem } from './navConfig'
import { useSwipeNavigation } from './useSwipeNavigation'

export function AppShell({ children }: { children: ReactNode }) {
  const user = useUser()
  const { path } = useLocation()
  const { storageError } = useStore()
  const unread = useMyNotifications().filter((n) => !n.read).length
  const [ready, setReady] = useState(false)
  const { theme, toggle: toggleTheme } = useTheme()
  useSwipeNavigation(user.role, path)

  // Brief skeleton while the workspace "loads" after login or refresh.
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 450)
    return () => window.clearTimeout(t)
  }, [])

  // Move to the top of each new page.
  useEffect(() => { window.scrollTo(0, 0) }, [path])

  return (
    <LogoutProvider>
      <div className="safe-x min-h-screen bg-slate-50">
        <a href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus() }} className="focusable sr-only z-[80] rounded-md bg-white px-3 py-2 text-sm font-semibold text-brand-700 focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
          Skip to main content
        </a>
        <Sidebar role={user.role} path={path} unread={unread} />
        <div className="md:pl-20 lg:pl-60">
          <TopBar role={user.role} unread={unread} theme={theme} onToggleTheme={toggleTheme} />
          {storageError && (
            <div role="alert" className="flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900 sm:px-6 lg:px-8">
              <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden />
              Storage is full, so recent changes may be lost on refresh. Remove a large photo or reset your data in Profile.
            </div>
          )}
          <main id="main" tabIndex={-1} className="pb-bottom-nav mx-auto w-full max-w-7xl px-4 pt-4 outline-none sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
            {ready ? children : <PageSkeleton />}
          </main>
        </div>
        <MobileBottomNav role={user.role} path={path} unread={unread} />
      </div>
    </LogoutProvider>
  )
}

/** Tablet/desktop navigation: workspace pages at the top, account items and Log Out at the bottom. */
function Sidebar({ role, path, unread }: { role: Role; path: string; unread: number }) {
  const main = NAV[role].sidebar.filter((i) => i.section !== 'account')
  const account = NAV[role].sidebar.filter((i) => i.section === 'account')
  return (
    <aside className="safe-left fixed inset-y-0 left-0 z-30 hidden w-20 box-content flex-col border-r bg-white md:flex lg:w-60" aria-label="Main navigation">
      <div className="flex h-16 shrink-0 items-center justify-center border-b px-3 lg:justify-start lg:px-5">
        <Link to={HOME_ROUTE[role]} className="focusable rounded-md" aria-label="CSU-One home">
          <span className="lg:hidden"><AppLogo variant="mark" /></span>
          <span className="hidden lg:block"><AppLogo /></span>
        </Link>
      </div>
      <nav className="flex min-h-0 flex-1 flex-col justify-between overflow-y-auto px-2 py-4 lg:px-3" aria-label="Sections">
        <SidebarGroup label={`${ROLE_LABEL[role]} workspace`} items={main} path={path} unread={unread} />
        <div className="mt-6 border-t pt-4">
          <SidebarGroup label="Account" items={account} path={path} unread={unread} />
          <LogoutButton className="nav-item mt-1 w-full flex-col justify-center gap-1 px-1 text-[11px] text-rose-700 hover:bg-rose-50 hover:text-rose-800 active:bg-rose-100 lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:text-sm">
            <LogOut size={19} aria-hidden /><span>Log Out</span>
          </LogoutButton>
        </div>
      </nav>
    </aside>
  )
}

function SidebarGroup({ label, items, path, unread }: { label: string; items: NavItem[]; path: string; unread: number }) {
  return (
    <div>
      <p className="mb-2 hidden px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 lg:block">{label}</p>
      <ul className="space-y-1">
        {items.map((item) => <SidebarLink key={item.to} item={item} active={isActive(item, path)} unread={unread} />)}
      </ul>
    </div>
  )
}

function SidebarLink({ item, active, unread }: { item: NavItem; active: boolean; unread: number }) {
  const Icon = item.icon
  const count = item.badge === 'notifications' ? unread : 0
  return (
    <li>
      <Link
        to={item.to}
        aria-current={active ? 'page' : undefined}
        title={item.label}
        className={`nav-item relative flex-col justify-center gap-1 px-1 text-[11px] lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:text-sm ${active ? 'nav-item-active' : ''}`}
      >
        <Icon size={19} aria-hidden />
        <span className="max-w-full truncate">{item.label}</span>
        {count > 0 && (
          <span className="absolute right-3 top-1.5 min-w-[18px] rounded-full bg-brand-700 px-1 text-center text-[10px] font-semibold leading-[18px] text-white lg:static lg:ml-auto" aria-label={`${count} unread`}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </Link>
    </li>
  )
}

type TopBarProps = { role: Role; unread: number; theme: Theme; onToggleTheme: () => void }

function TopBar({ role, unread, theme, onToggleTheme }: TopBarProps) {
  const notificationsRoute = `${HOME_ROUTE[role]}/notifications`
  const dark = theme === 'dark'
  return (
    <header className="safe-top sticky top-0 z-20 box-content flex h-14 items-center justify-between gap-3 border-b bg-white px-4 sm:px-6 md:h-16 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Link to={HOME_ROUTE[role]} className="focusable rounded-md md:hidden" aria-label="CSU-One home"><AppLogo /></Link>
        <div className="hidden min-w-0 md:block">
          <p className="text-xs font-medium text-slate-500">Cagayan State University – Carig Campus</p>
          <p className="truncate text-sm font-semibold text-slate-900">CSU-One · {ROLE_LABEL[role]} portal</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button type="button" onClick={onToggleTheme} className="icon-btn" aria-pressed={dark} aria-label="Dark mode" title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
          {dark ? <Sun size={20} aria-hidden /> : <Moon size={20} aria-hidden />}
        </button>
        <Link to={notificationsRoute} className="icon-btn relative" aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}>
          <Bell size={20} aria-hidden />
          {unread > 0 && <span aria-hidden className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-brand-600 ring-2 ring-white" />}
        </Link>
        {/* Phones reach the account menu from the bottom navigation instead */}
        <div className="hidden md:block md:border-l md:pl-2">
          <ProfileDropdown />
        </div>
      </div>
    </header>
  )
}
