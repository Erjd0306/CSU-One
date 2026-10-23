import { useEffect, useState, type ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'
import { AppShell } from './components/layout/AppShell'
import { HOME_ROUTE } from './components/layout/navConfig'
import { AppLogo } from './components/ui/Logo'
import { EmptyState } from './components/ui/Page'
import { Link, matchPath, navigate, useLocation } from './lib/router'
import { useDocumentTitle } from './lib/useDocumentTitle'
import { StoreProvider, useStore } from './state/AppStore'
import { ToastProvider } from './state/Toast'
import type { Role } from './types'
import { LandingPage } from './pages/landing/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { NotificationsPage } from './pages/shared/NotificationsPage'
import { ProfilePage } from './pages/shared/ProfilePage'
import { StudentHome } from './pages/student/StudentHome'
import { ReportIssue } from './pages/student/ReportIssue'
import { MyReports } from './pages/student/MyReports'
import { StudentReportDetail } from './pages/student/StudentReportDetail'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { ReportsManagement } from './pages/admin/ReportsManagement'
import { AdminMap } from './pages/admin/AdminMap'
import { TeamsPage } from './pages/admin/TeamsPage'
import { AnalyticsPage } from './pages/admin/AnalyticsPage'
import { AdminMore } from './pages/admin/AdminMore'
import { TasksPage } from './pages/maintenance/TasksPage'
import { TaskDetail } from './pages/maintenance/TaskDetail'
import { MaintenanceMap } from './pages/maintenance/MaintenanceMap'
import { WorkHistory } from './pages/maintenance/WorkHistory'

type RouteDef = { pattern: string; render: (params: Record<string, string>) => ReactNode }

const ROUTES: Record<Role, RouteDef[]> = {
  student: [
    { pattern: '/student', render: () => <StudentHome /> },
    { pattern: '/student/report', render: () => <ReportIssue /> },
    { pattern: '/student/reports', render: () => <MyReports /> },
    { pattern: '/student/reports/:id', render: (p) => <StudentReportDetail key={p.id} id={p.id} /> },
    { pattern: '/student/notifications', render: () => <NotificationsPage /> },
    { pattern: '/student/profile', render: () => <ProfilePage /> },
  ],
  admin: [
    { pattern: '/admin', render: () => <AdminDashboard /> },
    { pattern: '/admin/reports', render: () => <ReportsManagement /> },
    { pattern: '/admin/map', render: () => <AdminMap /> },
    { pattern: '/admin/teams', render: () => <TeamsPage /> },
    { pattern: '/admin/analytics', render: () => <AnalyticsPage /> },
    { pattern: '/admin/notifications', render: () => <NotificationsPage /> },
    { pattern: '/admin/profile', render: () => <ProfilePage /> },
    { pattern: '/admin/more', render: () => <AdminMore /> },
  ],
  maintenance: [
    { pattern: '/maintenance', render: () => <TasksPage /> },
    { pattern: '/maintenance/tasks/:id', render: (p) => <TaskDetail key={p.id} id={p.id} /> },
    { pattern: '/maintenance/map', render: () => <MaintenanceMap /> },
    { pattern: '/maintenance/history', render: () => <WorkHistory /> },
    { pattern: '/maintenance/notifications', render: () => <NotificationsPage /> },
    { pattern: '/maintenance/profile', render: () => <ProfilePage /> },
  ],
}

const ROLES: Role[] = ['student', 'admin', 'maintenance']

function Redirect({ to }: { to: string }) {
  useEffect(() => { navigate(to, { replace: true }) }, [to])
  return null
}

function NotFound({ home }: { home: string }) {
  useDocumentTitle('Page not found')
  return (
    <div className="panel">
      <EmptyState title="Page not found" message="The page you are looking for does not exist or has moved." action={<Link to={home} className="btn-secondary">Go to home</Link>} />
    </div>
  )
}

function Routes() {
  const { path } = useLocation()
  const { user } = useStore()

  // Logged-out visitors start on the landing page; logged-in users go straight to their dashboard.
  if (path === '/') return user ? <Redirect to={HOME_ROUTE[user.role]} /> : <LandingPage />
  if (path === '/login') return user ? <Redirect to={HOME_ROUTE[user.role]} /> : <LoginPage />
  if (path === '/register') return user ? <Redirect to={HOME_ROUTE[user.role]} /> : <RegisterPage />

  const section = path.split('/')[1] as Role
  if (!ROLES.includes(section)) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 p-4">
        <div className="w-full max-w-md"><NotFound home={user ? HOME_ROUTE[user.role] : '/'} /></div>
      </div>
    )
  }
  // Role guard: log in first, and only open your own role's workspace.
  if (!user) return <Redirect to={`/login?next=${encodeURIComponent(path)}`} />
  if (user.role !== section) return <Redirect to={HOME_ROUTE[user.role]} />

  for (const route of ROUTES[section]) {
    const params = matchPath(route.pattern, path)
    if (params) return <AppShell>{route.render(params)}</AppShell>
  }
  return <AppShell><NotFound home={HOME_ROUTE[user.role]} /></AppShell>
}

function BootScreen() {
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-slate-50" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-5">
        <AppLogo variant="badge" />
        <p className="flex items-center gap-2 text-sm text-slate-500"><LoaderCircle size={16} className="animate-spin" aria-hidden />Loading CSU-One…</p>
      </div>
    </div>
  )
}

export default function App() {
  const [booting, setBooting] = useState(true)
  useEffect(() => {
    const t = window.setTimeout(() => setBooting(false), 350)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <ToastProvider>
      <StoreProvider>
        {booting ? <BootScreen /> : <Routes />}
      </StoreProvider>
    </ToastProvider>
  )
}
