// GENERATED from src/pages/admin/admin-reports.html by scripts/templates.mjs. Do not edit: change the .html template instead.
import type { AdminReportsViewProps } from '../../../pages/admin/ReportsManagement'
import { AppSelect, EmptyState, PageHeader, PriorityBadge, ReportCard, SearchInput, SearchableCombobox, StatusBadge } from '../../../templates/components'
import { ReportDrawer } from '../../../pages/admin/ReportDrawer'
import { ChevronRight as Icon_ChevronRight, Inbox as Icon_Inbox, MapPin as Icon_MapPin, SlidersHorizontal as Icon_SlidersHorizontal, X as Icon_X } from 'lucide-react'

export function AdminReportsView(props: AdminReportsViewProps) {
  const { filters, set, sort, setSort, sortOptions, statusOptions, priorityOptions, categoryOptions, areaOptions, datePreset, datePresets, applyPreset, showFilters, toggleFilters, activeCount, chips, clearAll, visible, total, open, rows, openId, closeDrawer } = props
  return (
    <><div className="admin-reports">
<PageHeader title="Reports" description="Search, filter, and manage every campus report." />
<section className="panel" aria-label="Reports list">
<div className="admin-reports__toolbar">
<div className="admin-reports__search-row">
<SearchInput className="admin-reports__search" label="Search reports" placeholder="Search by report ID, student, title, or location" value={filters.query} onChange={(e) => set('query', e.target.value)} />
<div className="admin-reports__search-actions">
<button className={`btn-secondary admin-reports__filters-toggle ${activeCount ? 'is-active' : ''}`} type="button" onClick={toggleFilters} aria-expanded={showFilters} aria-controls="report-filters">
<Icon_SlidersHorizontal size={16} aria-hidden />Filters{activeCount ? ` (${activeCount})` : ''}
            </button>
<div className="admin-reports__sort">
<AppSelect ariaLabel="Sort reports" prefix="Sort:" value={sort} options={sortOptions} onChange={setSort} />
</div>
</div>
</div>
<div className={`admin-reports__filters ${showFilters ? 'is-open' : ''}`} id="report-filters">
<AppSelect ariaLabel="Status" value={filters.status} options={statusOptions} onChange={(v) => set('status', v)} />
<AppSelect ariaLabel="Priority" value={filters.priority} options={priorityOptions} onChange={(v) => set('priority', v)} />
<AppSelect ariaLabel="Category" value={filters.category} options={categoryOptions} onChange={(v) => set('category', v)} />
<SearchableCombobox id="filter-area" ariaLabel="Campus area" value={filters.buildingId === 'All' ? null : filters.buildingId} options={areaOptions} onChange={(v) => set('buildingId', v ?? 'All')} placeholder="All campus areas" icon={Icon_MapPin} emptyMessage="No matching campus location found." resultsLabel={(n) => `${n} campus location${n === 1 ? '' : 's'} found`} clearLabel="Show all campus areas" />
<AppSelect ariaLabel="Date submitted" value={datePreset} options={datePresets} onChange={applyPreset} />
{(datePreset === 'custom') && (<div className="admin-reports__dates">
<label className="admin-reports__date">
<span className="admin-reports__date-label">From</span>
<input className="field" type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => set('from', e.target.value)} />
</label>
<label className="admin-reports__date">
<span className="admin-reports__date-label">Until</span>
<input className="field" type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => set('to', e.target.value)} />
</label>
</div>)}</div>
{(chips.length) && (<ul className="admin-reports__chips" aria-label="Active filters">
{(chips).map((c) => (<li key={c.key}>
<button className="chip admin-reports__chip" type="button" onClick={c.clear} aria-label={`Remove filter ${c.label}`}>
<span className="admin-reports__chip-label">{c.label}</span><Icon_X className="admin-reports__chip-x" size={13} aria-hidden />
</button>
</li>))}
</ul>)}</div>
<div className="admin-reports__summary">
<p className="admin-reports__count" aria-live="polite">{visible.length} of {total} reports</p>
{(activeCount > 0 || filters.query) && (<button className="btn-ghost btn-sm admin-reports__clear" type="button" onClick={clearAll}>
<Icon_X size={14} aria-hidden />Clear filters
        </button>)}</div>
{(visible.length === 0) ? (<EmptyState icon={total ? undefined : Icon_Inbox} title={total ? 'No reports match' : 'No reports yet'} message={total ? 'Try a different search or clear some filters.' : 'Reports from students will appear here.'} />) : (<>

<ul className="admin-reports__cards">
{(rows).map((row) => (<li key={row.report.id}>
<ReportCard report={row.report} onSelect={open} showFlags meta={row.assignee ?? 'Unassigned'} />
</li>))}
</ul>

<div className="admin-reports__table-wrap">
<table className="admin-reports__table">
<thead>
<tr>
<th className="admin-reports__col-report" scope="col">Report</th>
<th className="admin-reports__col-location" scope="col">Location</th>
<th className="admin-reports__col-reporter" scope="col">Reporter</th>
<th className="admin-reports__col-priority" scope="col">Priority</th>
<th className="admin-reports__col-status" scope="col">Status</th>
<th className="admin-reports__col-assignee" scope="col">Assigned to</th>
<th className="admin-reports__col-open" scope="col"><span className="sr-only">Open</span></th>
</tr>
</thead>
<tbody>
{(rows).map((row) => (<tr className="admin-reports__row" key={row.report.id} onClick={() => open(row.report)}>
<td className="admin-reports__cell-report">
<button className="admin-reports__title focusable" type="button" onClick={(e) => { e.stopPropagation(); open(row.report) }}>{row.report.title}</button>
<p className="admin-reports__sub">{row.report.id} · {row.report.category} · {row.submitted}</p>
</td>
<td className="admin-reports__cell-muted"><span className="admin-reports__clamp">{row.location}</span></td>
<td className="admin-reports__cell-muted admin-reports__truncate">{row.report.reporterName}</td>
<td className="admin-reports__cell"><PriorityBadge priority={row.report.priority} /></td>
<td className="admin-reports__cell"><StatusBadge status={row.report.status} /></td>
<td className="admin-reports__cell-muted">
{(row.assignee) ? (<span className="admin-reports__assignee">{row.assignee}</span>) : (<span className="admin-reports__assignee admin-reports__unassigned">Unassigned</span>)}
<span className="admin-reports__updated">{row.updated}</span>
</td>
<td className="admin-reports__cell-chevron"><Icon_ChevronRight size={16} aria-hidden /></td>
</tr>))}
</tbody>
</table>
</div>
</>)}
</section>
{(openId) && (<ReportDrawer reportId={openId} onClose={closeDrawer} />)}</div></>
  )
}
