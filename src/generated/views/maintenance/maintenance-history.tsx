// GENERATED from src/pages/maintenance/maintenance-history.html by scripts/templates.mjs. Do not edit: change the .html template instead.
import type { MaintenanceHistoryViewProps } from '../../../pages/maintenance/WorkHistory'
import { EmptyState, PageHeader, ReportCard, SearchInput, StatStrip } from '../../../templates/components'
import { History as Icon_History, X as Icon_X } from 'lucide-react'

export function MaintenanceHistoryView(props: MaintenanceHistoryViewProps) {
  const { stats, done, visible, query, setQuery, from, setFrom, to, setTo, filtered, clearFilters, resolvedLabel } = props
  return (
    <><div className="maintenance-history">
<PageHeader title="Work history" description="Tasks you have completed." />
<StatStrip items={stats} />
<section className="panel" aria-label="Completed tasks">
<div className="maintenance-history__filters">
<SearchInput label="Search completed tasks" placeholder="Search by title, ID, or location" value={query} onChange={(e) => setQuery(e.target.value)} />
<label className="maintenance-history__date">
<span className="sr-only">Resolved from</span>
<input className="field" type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} aria-label="Resolved from" title="Resolved from" />
</label>
<label className="maintenance-history__date">
<span className="sr-only">Resolved until</span>
<input className="field" type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} aria-label="Resolved until" title="Resolved until" />
</label>
</div>
<div className="maintenance-history__summary">
<p className="maintenance-history__count" aria-live="polite">{visible.length} of {done.length} completed</p>
{(filtered) && (<button className="btn-ghost btn-sm maintenance-history__clear" type="button" onClick={clearFilters}><Icon_X size={14} aria-hidden />Clear</button>)}</div>
{(visible.length) ? (<ul className="maintenance-history__list">
{(visible).map((r) => (<li key={r.id}><ReportCard report={r} to={`/maintenance/tasks/${r.id}`} meta={resolvedLabel(r)} /></li>))}
</ul>) : (<EmptyState icon={Icon_History} title={done.length ? 'No tasks match' : 'No completed tasks yet'} message={done.length ? 'Try a different search or date range.' : 'Tasks you resolve will be listed here.'} />)}
</section>
</div></>
  )
}
