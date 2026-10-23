import { useMemo, useState } from 'react'
import type { SelectOption } from '../../components/ui/select/AppSelect'
import { priorityOptions } from '../../components/ui/select/options'
import { buildingName } from '../../data/campus'
import { MaintenanceTasksView } from '../../generated/views/maintenance/maintenance-tasks'
import { PRIORITY_ORDER } from '../../lib/meta'
import { matchesQuery, sortReports } from '../../lib/filters'
import { timeAgo } from '../../lib/format'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { useStore, useUser } from '../../state/AppStore'
import type { Priority, Report } from '../../types'
import './maintenance-tasks.css'

const FILTER_OPTIONS = ['Active', 'New', 'Assigned', 'In Progress'] as const
type TaskFilter = (typeof FILTER_OPTIONS)[number]

const PRIORITY_OPTIONS = priorityOptions()

const isNew = (r: Report) => r.status === 'Assigned' && !r.accepted
const matchesTaskFilter = (r: Report, f: TaskFilter) =>
  f === 'Active' ? true : f === 'New' ? isNew(r) : r.status === f

export function useMyTasks(): Report[] {
  const user = useUser()
  const { reports } = useStore()
  return useMemo(() => reports.filter((r) => r.assigneeId === user.id), [reports, user.id])
}

/** The task to work on now: a repair already underway, otherwise the most urgent accepted/assigned task. */
function pickCurrent(active: Report[]): Report | undefined {
  const stage = (r: Report) => (r.status === 'In Progress' ? 0 : r.accepted ? 1 : 2)
  return [...active].sort((a, b) => stage(a) - stage(b) || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || a.createdAt.localeCompare(b.createdAt))[0]
}

export type MaintenanceTasksViewProps = {
  activeCount: number
  urgent: number
  showUrgent: () => void
  current: Report | undefined
  currentLocation: string
  query: string
  setQuery: (q: string) => void
  priority: Priority | 'All'
  setPriority: (p: Priority | 'All') => void
  priorityOptions: SelectOption<Priority | 'All'>[]
  filter: TaskFilter
  setFilter: (f: TaskFilter) => void
  filterOptions: typeof FILTER_OPTIONS
  counts: Record<TaskFilter, number>
  visible: Report[]
  /** "New · assigned …" for tasks not yet accepted, otherwise undefined */
  newLabel: (r: Report) => string | undefined
  clearFilters: () => void
}

/** Maintenance Tasks. Markup: maintenance-tasks.html, styles: maintenance-tasks.css. */
export function TasksPage() {
  useDocumentTitle('Assigned tasks')
  const all = useMyTasks()
  const active = useMemo(() => all.filter((r) => r.status !== 'Resolved'), [all])
  const current = useMemo(() => pickCurrent(active), [active])
  const [query, setQuery] = useState('')
  const [priority, setPriority] = useState<Priority | 'All'>('All')
  const [filter, setFilter] = useState<TaskFilter>('Active')

  const visible = useMemo(
    () => sortReports(active.filter((r) => matchesQuery(r, query) && (priority === 'All' || r.priority === priority) && matchesTaskFilter(r, filter)), 'priority'),
    [active, query, priority, filter],
  )

  return (
    <MaintenanceTasksView
      activeCount={active.length}
      urgent={active.filter((r) => r.priority === 'Urgent').length}
      showUrgent={() => { setPriority('Urgent'); setFilter('Active') }}
      current={current}
      currentLocation={current ? `${buildingName(current.buildingId)}${current.locationDetail ? ` · ${current.locationDetail}` : ''}` : ''}
      query={query}
      setQuery={setQuery}
      priority={priority}
      setPriority={setPriority}
      priorityOptions={PRIORITY_OPTIONS}
      filter={filter}
      setFilter={setFilter}
      filterOptions={FILTER_OPTIONS}
      counts={{
        Active: active.length,
        New: active.filter(isNew).length,
        Assigned: active.filter((r) => r.status === 'Assigned').length,
        'In Progress': active.filter((r) => r.status === 'In Progress').length,
      }}
      visible={visible}
      newLabel={(r) => (isNew(r) ? `New · assigned ${timeAgo(r.assignedAt ?? r.updatedAt)}` : undefined)}
      clearFilters={() => { setQuery(''); setPriority('All'); setFilter('Active') }}
    />
  )
}
