import { useMemo } from 'react'
import { MaintenanceMapView } from '../../generated/views/maintenance/maintenance-map'
import { sortReports } from '../../lib/filters'
import { navigate } from '../../lib/router'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import type { Report } from '../../types'
import { useMyTasks } from './TasksPage'
import './maintenance-map.css'

export type MaintenanceMapViewProps = { active: Report[]; openTask: (r: Report) => void }

/** Maintenance Task Map. Markup: maintenance-map.html, styles: maintenance-map.css. */
export function MaintenanceMap() {
  useDocumentTitle('Task map')
  const tasks = useMyTasks()
  const active = useMemo(() => sortReports(tasks.filter((r) => r.status !== 'Resolved'), 'priority'), [tasks])
  return <MaintenanceMapView active={active} openTask={(r) => navigate(`/maintenance/tasks/${r.id}`)} />
}
