import { useMemo, useState } from 'react'
import type { StatItem } from '../../components/ui/Page'
import { MaintenanceHistoryView } from '../../generated/views/maintenance/maintenance-history'
import { avgResolutionHours } from '../../lib/analytics'
import { matchesQuery } from '../../lib/filters'
import { formatDate, formatDuration, hoursBetween } from '../../lib/format'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import type { Report } from '../../types'
import { useMyTasks } from './TasksPage'
import './maintenance-history.css'

export type MaintenanceHistoryViewProps = {
  stats: StatItem[]
  done: Report[]
  visible: Report[]
  query: string
  setQuery: (q: string) => void
  from: string
  setFrom: (v: string) => void
  to: string
  setTo: (v: string) => void
  filtered: boolean
  clearFilters: () => void
  resolvedLabel: (r: Report) => string
}

/** Maintenance Work History. Markup: maintenance-history.html, styles: maintenance-history.css. */
export function WorkHistory() {
  useDocumentTitle('Work history')
  const tasks = useMyTasks()
  const done = useMemo(() => tasks.filter((r) => r.status === 'Resolved' && r.resolvedAt).sort((a, b) => (b.resolvedAt ?? '').localeCompare(a.resolvedAt ?? '')), [tasks])
  const [query, setQuery] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const visible = useMemo(() => {
    const start = from ? new Date(`${from}T00:00:00`).getTime() : -Infinity
    const end = to ? new Date(`${to}T23:59:59`).getTime() : Infinity
    return done.filter((r) => {
      const t = new Date(r.resolvedAt as string).getTime()
      return t >= start && t <= end && matchesQuery(r, query)
    })
  }, [done, query, from, to])

  const repairHours = done.filter((r) => r.startedAt).map((r) => hoursBetween(r.startedAt as string, r.resolvedAt as string))
  const avgRepair = repairHours.length ? repairHours.reduce((a, b) => a + b, 0) / repairHours.length : 0

  return (
    <MaintenanceHistoryView
      stats={[
        { label: 'Completed', value: done.length, tone: 'success' },
        { label: 'Avg. repair time', value: formatDuration(avgRepair), note: 'Start to resolved' },
        { label: 'Avg. total time', value: formatDuration(avgResolutionHours(done)), note: 'Submitted to resolved' },
      ]}
      done={done}
      visible={visible}
      query={query}
      setQuery={setQuery}
      from={from}
      setFrom={setFrom}
      to={to}
      setTo={setTo}
      filtered={!!(query || from || to)}
      clearFilters={() => { setQuery(''); setFrom(''); setTo('') }}
      resolvedLabel={(r) => `Resolved ${formatDate(r.resolvedAt as string)}${r.startedAt ? ` · ${formatDuration(hoursBetween(r.startedAt, r.resolvedAt as string))} repair` : ''}`}
    />
  )
}
