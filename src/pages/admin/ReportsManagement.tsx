import { useMemo, useState } from 'react'
import { campusLocationOptions } from '../../components/reports/locationOptions'
import type { SelectOption } from '../../components/ui/select/AppSelect'
import type { ComboOption } from '../../components/ui/select/SearchableCombobox'
import { DATE_PRESETS, categoryOptions, daysAgoISO, priorityOptions, sortOptions, statusOptions, type DatePreset } from '../../components/ui/select/options'
import { buildingName } from '../../data/campus'
import { AdminReportsView } from '../../generated/views/admin/admin-reports'
import { EMPTY_FILTERS, SORT_LABELS, countActiveFilters, filterReports, sortReports, type ReportFilters, type SortKey } from '../../lib/filters'
import { formatDate, timeAgo } from '../../lib/format'
import { navigate, useLocation } from '../../lib/router'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { personName, useStore } from '../../state/AppStore'
import type { Category, Priority, Report, Status } from '../../types'
import './admin-reports.css'

const STATUS_OPTIONS = statusOptions()
const PRIORITY_OPTIONS = priorityOptions()
const CATEGORY_OPTIONS = categoryOptions()
const SORT_OPTIONS = sortOptions()

type Chip = { key: string; label: string; clear: () => void }
type Row = { report: Report; assignee: string | null; location: string; submitted: string; updated: string }
type SetFilter = <K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) => void

export type AdminReportsViewProps = {
  filters: ReportFilters
  set: SetFilter
  sort: SortKey
  setSort: (s: SortKey) => void
  sortOptions: SelectOption<SortKey>[]
  statusOptions: SelectOption<Status | 'All'>[]
  priorityOptions: SelectOption<Priority | 'All'>[]
  categoryOptions: SelectOption<Category | 'All'>[]
  areaOptions: ComboOption[]
  datePreset: DatePreset
  datePresets: SelectOption<DatePreset>[]
  applyPreset: (p: DatePreset) => void
  showFilters: boolean
  toggleFilters: () => void
  activeCount: number
  chips: Chip[]
  clearAll: () => void
  visible: Report[]
  total: number
  open: (r: Report) => void
  rows: Row[]
  openId: string | null
  closeDrawer: () => void
}

/** Admin Reports. Markup: admin-reports.html, styles: admin-reports.css. */
export function ReportsManagement() {
  useDocumentTitle('Reports')
  const { reports, personnel } = useStore()
  const { query } = useLocation()
  const openId = query.get('id')
  const [filters, setFilters] = useState<ReportFilters>(() => ({ ...EMPTY_FILTERS, status: (query.get('status') as ReportFilters['status']) || 'All' }))
  const [sort, setSort] = useState<SortKey>(() => {
    const requested = query.get('sort')
    return requested && requested in SORT_LABELS ? (requested as SortKey) : 'priority'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [datePreset, setDatePreset] = useState<DatePreset>('any')
  const areaOptions = useMemo(() => campusLocationOptions(), [])

  const visible = useMemo(
    () => sortReports(filterReports(reports, filters, (r) => personName(personnel, r.assigneeId)), sort),
    [reports, filters, sort, personnel],
  )
  const set: SetFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v }))
  const open = (r: Report) => navigate(`/admin/reports?id=${r.id}`)

  const applyPreset = (preset: DatePreset) => {
    setDatePreset(preset)
    if (preset === 'custom') return
    setFilters((f) => ({ ...f, from: preset === 'any' ? '' : daysAgoISO(Number(preset)), to: '' }))
  }

  // Removable chips for every active filter.
  const chips: Chip[] = []
  if (filters.status !== 'All') chips.push({ key: 'status', label: `Status: ${filters.status}`, clear: () => set('status', 'All') })
  if (filters.priority !== 'All') chips.push({ key: 'priority', label: `Priority: ${filters.priority}`, clear: () => set('priority', 'All') })
  if (filters.category !== 'All') chips.push({ key: 'category', label: `Category: ${filters.category}`, clear: () => set('category', 'All') })
  if (filters.buildingId !== 'All') chips.push({ key: 'area', label: buildingName(filters.buildingId), clear: () => set('buildingId', 'All') })
  if (filters.from || filters.to) {
    const label = datePreset !== 'custom' && datePreset !== 'any'
      ? DATE_PRESETS.find((p) => p.value === datePreset)?.label ?? 'Date range'
      : `${filters.from ? formatDate(`${filters.from}T00:00:00`) : 'Any'} – ${filters.to ? formatDate(`${filters.to}T00:00:00`) : 'Today'}`
    chips.push({ key: 'date', label, clear: () => applyPreset('any') })
  }

  const rows: Row[] = visible.map((r) => ({
    report: r,
    assignee: r.assigneeId ? personName(personnel, r.assigneeId) : null,
    location: buildingName(r.buildingId),
    submitted: formatDate(r.createdAt),
    updated: timeAgo(r.updatedAt),
  }))

  return (
    <AdminReportsView
      filters={filters}
      set={set}
      sort={sort}
      setSort={setSort}
      sortOptions={SORT_OPTIONS}
      statusOptions={STATUS_OPTIONS}
      priorityOptions={PRIORITY_OPTIONS}
      categoryOptions={CATEGORY_OPTIONS}
      areaOptions={areaOptions}
      datePreset={datePreset}
      datePresets={DATE_PRESETS}
      applyPreset={applyPreset}
      showFilters={showFilters}
      toggleFilters={() => setShowFilters((v) => !v)}
      activeCount={countActiveFilters(filters)}
      chips={chips}
      clearAll={() => { setFilters(EMPTY_FILTERS); setDatePreset('any') }}
      visible={visible}
      total={reports.length}
      open={open}
      rows={rows}
      openId={openId}
      closeDrawer={() => navigate('/admin/reports', { replace: true })}
    />
  )
}
