// GENERATED from src/pages/student/student-reports.html by scripts/templates.mjs. Do not edit: change the .html template instead.
import type { StudentReportsViewProps } from '../../../pages/student/MyReports'
import { AppSelect, ChipGroup, EmptyState, Link, PageHeader, ReportCard, SearchInput } from '../../../templates/components'
import { ClipboardList as Icon_ClipboardList } from 'lucide-react'

export function StudentReportsView(props: StudentReportsViewProps) {
  const { mine, visible, query, setQuery, category, setCategory, categoryOptions, sort, setSort, sortOptions, status, setStatus, statusOptions, counts, filtered, clearFilters, submittedLabel } = props
  return (
    <><div className="student-reports">
<PageHeader title="My reports" description="Everything you reported and where it stands." actions={<><Link className="btn-primary" to="/student/report">Report an Issue</Link></>} />
<section className="panel" aria-label="Your reports">
<div className="student-reports__filters">
<div className="student-reports__controls">
<SearchInput label="Search your reports" placeholder="Search by title, ID, or location" value={query} onChange={(e) => setQuery(e.target.value)} />
<AppSelect ariaLabel="Filter by category" value={category} options={categoryOptions} onChange={setCategory} />
<AppSelect ariaLabel="Sort reports" value={sort} options={sortOptions} onChange={setSort} />
</div>
<ChipGroup label="Filter by status" options={statusOptions} value={status} onChange={setStatus} counts={counts} />
</div>
<p className="student-reports__count" aria-live="polite">
        {visible.length} of {mine.length} report{mine.length === 1 ? '' : 's'}
      </p>
{(visible.length) ? (<ul className="student-reports__list">
{(visible).map((r) => (<li key={r.id}>
<ReportCard report={r} to={`/student/reports/${r.id}`} meta={submittedLabel(r)} showFlags />
</li>))}
</ul>) : ((mine.length) ? (<EmptyState title="No matching reports" message="Try a different search, status, or category." action={<>
{(filtered) && (<button className="btn-secondary" type="button" onClick={clearFilters}>Clear filters</button>)}</>} />) : (<EmptyState icon={Icon_ClipboardList} title="No reports yet" message="See something broken on campus? Report it in a minute." action={<><Link className="btn-primary" to="/student/report">Report an Issue</Link></>} />))}
</section>
</div></>
  )
}
