import { CATEGORIES, PRIORITIES, STATUSES, STATUS_DOT } from '../../../lib/meta'
import { SORT_LABELS, type SortKey } from '../../../lib/filters'
import type { Category, Priority, Status } from '../../../types'
import type { SelectOption } from './AppSelect'

/** Shared option lists so every filter in the app reads and looks the same. */
export const statusOptions = (allLabel = 'All statuses'): SelectOption<Status | 'All'>[] => [
  { value: 'All', label: allLabel },
  ...STATUSES.map((s) => ({ value: s, label: s, dot: STATUS_DOT[s] })),
]

export const priorityOptions = (allLabel = 'All priorities'): SelectOption<Priority | 'All'>[] => [
  { value: 'All', label: allLabel },
  ...PRIORITIES.map((p) => ({ value: p, label: p })),
]

export const categoryOptions = (allLabel = 'All categories'): SelectOption<Category | 'All'>[] => [
  { value: 'All', label: allLabel },
  ...CATEGORIES.map((c) => ({ value: c.value, label: c.value, icon: c.icon })),
]

export const sortOptions = (keys: SortKey[] = Object.keys(SORT_LABELS) as SortKey[]): SelectOption<SortKey>[] =>
  keys.map((k) => ({ value: k, label: SORT_LABELS[k] }))

export type DatePreset = 'any' | '7' | '30' | '90' | 'custom'

export const DATE_PRESETS: SelectOption<DatePreset>[] = [
  { value: 'any', label: 'Any time' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'custom', label: 'Custom range' },
]

/** YYYY-MM-DD for "n days ago" in local time, matching <input type="date"> values. */
export function daysAgoISO(days: number, now = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
