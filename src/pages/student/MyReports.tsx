import { useMemo, useState } from 'react'
import { categoryOptions, sortOptions } from '../../components/ui/select/options'
import type { SelectOption } from '../../components/ui/select/AppSelect'
import { StudentReportsView } from '../../generated/views/student/student-reports'
import { STATUSES } from '../../lib/meta'
import { EMPTY_FILTERS, filterReports, sortReports, type SortKey } from '../../lib/filters'
import { formatDate } from '../../lib/format'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { useStore, useUser } from '../../state/AppStore'
import type { Category, Report, Status } from '../../types'
import './student-reports.css'

const CATEGORY_OPTIONS = categoryOptions()
const SORT_OPTIONS = sortOptions(['newest', 'oldest', 'updated'])
const STATUS_OPTIONS = ['All', ...STATUSES] as const

export type StudentReportsViewProps = {
  mine: Report[]
  visible: Report[]
  query: string
  setQuery: (q: string) => void
  category: Category | 'All'
  setCategory: (c: Category | 'All') => void
  categoryOptions: SelectOption<Category | 'All'>[]
  sort: SortKey
  setSort: (s: SortKey) => void
  sortOptions: SelectOption<SortKey>[]
  status: Status | 'All'
  setStatus: (s: Status | 'All') => void
  statusOptions: typeof STATUS_OPTIONS
  counts: Partial<Record<Status | 'All', number>>
  filtered: boolean
  clearFilters: () => void
  submittedLabel: (r: Report) => string
}

/** My Reports. Markup: student-reports.html, styles: student-reports.css. */
export function MyReports() {
  useDocumentTitle('My reports')
  const user = useUser()
  const { reports } = useStore()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<Status | 'All'>('All')
  const [category, setCategory] = useState<Category | 'All'>('All')
  const [sort, setSort] = useState<SortKey>('newest')

  // Students only ever see reports they submitted.
  const mine = useMemo(() => reports.filter((r) => r.reporterId === user.id), [reports, user.id])
  const visible = useMemo(
    () => sortReports(filterReports(mine, { ...EMPTY_FILTERS, query, status, category }), sort),
    [mine, query, status, category, sort],
  )
  const counts = useMemo(() => {
    const c: Partial<Record<Status | 'All', number>> = { All: mine.length }
    for (const s of STATUSES) c[s] = mine.filter((r) => r.status === s).length
    return c
  }, [mine])

  return (
    <StudentReportsView
      mine={mine}
      visible={visible}
      query={query}
      setQuery={setQuery}
      category={category}
      setCategory={setCategory}
      categoryOptions={CATEGORY_OPTIONS}
      sort={sort}
      setSort={setSort}
      sortOptions={SORT_OPTIONS}
      status={status}
      setStatus={setStatus}
      statusOptions={STATUS_OPTIONS}
      counts={counts}
      filtered={!!query || status !== 'All' || category !== 'All'}
      clearFilters={() => { setQuery(''); setStatus('All'); setCategory('All') }}
      submittedLabel={(r) => `Submitted ${formatDate(r.createdAt)}`}
    />
  )
}
