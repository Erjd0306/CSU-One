import { useMemo } from 'react'
import type { StatItem } from '../../components/ui/Page'
import { TEAMS } from '../../data/mockData'
import { AdminDashboardView } from '../../generated/views/admin/admin-dashboard'
import { timeAgo } from '../../lib/format'
import { navigate } from '../../lib/router'
import { sortReports } from '../../lib/filters'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { useStore } from '../../state/AppStore'
import type { Report } from '../../types'
import { useWorkload } from './AssignControl'
import './admin-dashboard.css'

type TeamLoad = { id: string; name: string; members: number; active: number; percent: number }

export type AdminDashboardViewProps = {
  stats: StatItem[]
  attention: Report[]
  active: Report[]
  openReport: (r: Report) => void
  teamLoad: TeamLoad[]
  recent: { report: Report; ago: string }[]
}

/** Admin Dashboard. Markup: admin-dashboard.html, styles: admin-dashboard.css. */
export function AdminDashboard() {
  useDocumentTitle('Dashboard')
  const { reports, personnel } = useStore()
  const workload = useWorkload()
  const count = (s: string) => reports.filter((r) => r.status === s).length
  const active = reports.filter((r) => r.status !== 'Resolved')
  const urgent = active.filter((r) => r.priority === 'Urgent').length

  // Urgent first, then anything still waiting for assignment or materials.
  const attention = useMemo(
    () => sortReports(reports.filter((r) => r.status === 'Open' || (r.status !== 'Resolved' && (r.priority === 'Urgent' || r.materialsNeeded))), 'priority').slice(0, 5),
    [reports],
  )
  const recent = useMemo(() => sortReports(reports, 'newest').slice(0, 5).map((r) => ({ report: r, ago: timeAgo(r.createdAt) })), [reports])

  const loads = TEAMS.map((t) => {
    const members = personnel.filter((p) => p.teamId === t.id)
    return { id: t.id, name: t.name, members: members.length, active: members.reduce((s, p) => s + (workload[p.id] ?? 0), 0) }
  })
  const maxLoad = Math.max(1, ...loads.map((t) => t.active))

  return (
    <AdminDashboardView
      stats={[
        { label: 'Urgent', value: urgent, note: 'Active urgent reports', tone: urgent ? 'danger' : 'default' },
        { label: 'Open', value: count('Open'), note: 'Awaiting assignment', tone: 'danger' },
        { label: 'Assigned', value: count('Assigned'), note: 'Waiting to start', tone: 'navy' },
        { label: 'In progress', value: count('In Progress'), note: 'Repairs underway', tone: 'warning' },
      ]}
      attention={attention}
      active={active}
      openReport={(r) => navigate(`/admin/reports?id=${r.id}`)}
      teamLoad={loads.map((t) => ({ ...t, percent: (t.active / maxLoad) * 100 }))}
      recent={recent}
    />
  )
}
