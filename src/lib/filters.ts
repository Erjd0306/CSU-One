import { buildingName } from '../data/campus'
import { PRIORITY_ORDER, STATUS_ORDER } from './meta'
import type { Category, Priority, Report, Status } from '../types'

export type ReportFilters = {
  query: string
  status: Status | 'All'
  priority: Priority | 'All'
  category: Category | 'All'
  buildingId: string | 'All'
  from: string
  to: string
}

export const EMPTY_FILTERS: ReportFilters = { query: '', status: 'All', priority: 'All', category: 'All', buildingId: 'All', from: '', to: '' }

export type SortKey = 'newest' | 'oldest' | 'priority' | 'updated'

export const SORT_LABELS: Record<SortKey, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  priority: 'Priority',
  updated: 'Recently updated',
}

/** Free-text search across ID, title, reporter, location, and category. */
export function matchesQuery(r: Report, query: string, extra = ''): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [r.id, r.title, r.reporterName, r.reporterIdNumber, buildingName(r.buildingId), r.locationDetail, r.category, extra]
    .join(' ')
    .toLowerCase()
    .includes(q)
}

export function filterReports(reports: Report[], f: ReportFilters, extraText?: (r: Report) => string): Report[] {
  const from = f.from ? new Date(`${f.from}T00:00:00`).getTime() : -Infinity
  const to = f.to ? new Date(`${f.to}T23:59:59`).getTime() : Infinity
  return reports.filter((r) => {
    const created = new Date(r.createdAt).getTime()
    return (
      (f.status === 'All' || r.status === f.status) &&
      (f.priority === 'All' || r.priority === f.priority) &&
      (f.category === 'All' || r.category === f.category) &&
      (f.buildingId === 'All' || r.buildingId === f.buildingId) &&
      created >= from && created <= to &&
      matchesQuery(r, f.query, extraText?.(r))
    )
  })
}

export function sortReports(reports: Report[], key: SortKey): Report[] {
  const list = [...reports]
  switch (key) {
    case 'newest': return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    case 'oldest': return list.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    case 'updated': return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    case 'priority':
      return list.sort((a, b) =>
        (a.status === 'Resolved' ? 1 : 0) - (b.status === 'Resolved' ? 1 : 0) ||
        PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
        STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
        b.createdAt.localeCompare(a.createdAt))
  }
}

export const countActiveFilters = (f: ReportFilters) =>
  [f.status !== 'All', f.priority !== 'All', f.category !== 'All', f.buildingId !== 'All', !!f.from, !!f.to].filter(Boolean).length
