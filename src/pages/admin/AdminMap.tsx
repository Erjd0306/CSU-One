import { useMemo, useState } from 'react'
import type { SelectOption } from '../../components/ui/select/AppSelect'
import { categoryOptions, priorityOptions } from '../../components/ui/select/options'
import { AdminMapView } from '../../generated/views/admin/admin-map'
import { STATUSES } from '../../lib/meta'
import { sortReports } from '../../lib/filters'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { useStore } from '../../state/AppStore'
import type { Category, Priority, Report, Status } from '../../types'
import './admin-map.css'

type StatusFilter = Status | 'All' | 'Active'

const PRIORITY_OPTIONS = priorityOptions()
const CATEGORY_OPTIONS = categoryOptions()
const STATUS_OPTIONS = ['Active', 'All', ...STATUSES] as const

export type AdminMapViewProps = {
  status: StatusFilter
  setStatus: (s: StatusFilter) => void
  statusOptions: typeof STATUS_OPTIONS
  priority: Priority | 'All'
  setPriority: (p: Priority | 'All') => void
  priorityOptions: SelectOption<Priority | 'All'>[]
  category: Category | 'All'
  setCategory: (c: Category | 'All') => void
  categoryOptions: SelectOption<Category | 'All'>[]
  visible: Report[]
  hasReports: boolean
  openId: string | null
  setOpenId: (id: string | null) => void
}

/** Admin Campus Map. Markup: admin-map.html, styles: admin-map.css. */
export function AdminMap() {
  useDocumentTitle('Campus map')
  const { reports } = useStore()
  const [status, setStatus] = useState<StatusFilter>('Active')
  const [priority, setPriority] = useState<Priority | 'All'>('All')
  const [category, setCategory] = useState<Category | 'All'>('All')
  const [openId, setOpenId] = useState<string | null>(null)

  const visible = useMemo(() => sortReports(reports.filter((r) =>
    (status === 'All' || (status === 'Active' ? r.status !== 'Resolved' : r.status === status)) &&
    (priority === 'All' || r.priority === priority) &&
    (category === 'All' || r.category === category)), 'priority'), [reports, status, priority, category])

  return (
    <AdminMapView
      status={status}
      setStatus={setStatus}
      statusOptions={STATUS_OPTIONS}
      priority={priority}
      setPriority={setPriority}
      priorityOptions={PRIORITY_OPTIONS}
      category={category}
      setCategory={setCategory}
      categoryOptions={CATEGORY_OPTIONS}
      visible={visible}
      hasReports={reports.length > 0}
      openId={openId}
      setOpenId={setOpenId}
    />
  )
}
