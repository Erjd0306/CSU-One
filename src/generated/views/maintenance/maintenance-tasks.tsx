// GENERATED from src/pages/maintenance/maintenance-tasks.html by scripts/templates.mjs. Do not edit: change the .html template instead.
import type { MaintenanceTasksViewProps } from '../../../pages/maintenance/TasksPage'
import { AppSelect, ChipGroup, EmptyState, Link, PageHeader, PriorityBadge, ReportCard, SearchInput, StatusBadge } from '../../../templates/components'
import { RepairActions } from '../../../pages/maintenance/RepairActions'
import { ArrowRight as Icon_ArrowRight, ClipboardCheck as Icon_ClipboardCheck, MapPin as Icon_MapPin, TriangleAlert as Icon_TriangleAlert } from 'lucide-react'

export function MaintenanceTasksView(props: MaintenanceTasksViewProps) {
  const { activeCount, urgent, showUrgent, current, currentLocation, query, setQuery, priority, setPriority, priorityOptions, filter, setFilter, filterOptions, counts, visible, newLabel, clearFilters } = props
  return (
    <><div className="maintenance-tasks">
<PageHeader title="Assigned tasks" description={`${activeCount} active task${activeCount === 1 ? '' : 's'}, most urgent first.`} />
{(urgent > 0) && (<div className="maintenance-tasks__urgent" role="status">
<Icon_TriangleAlert className="maintenance-tasks__urgent-icon" size={18} aria-hidden />
<p className="maintenance-tasks__urgent-text">
<span className="maintenance-tasks__urgent-count">{urgent} urgent task{urgent === 1 ? '' : 's'}</span> {urgent === 1 ? 'needs' : 'need'} attention first.
      </p>
<button className="btn-ghost btn-sm maintenance-tasks__urgent-button" type="button" onClick={showUrgent}>Show urgent</button>
</div>)}{(current) && (<section className="panel" aria-labelledby="current-task">
<div className="panel-header">
<h2 className="panel-title" id="current-task">Current task</h2>
<Link className="link maintenance-tasks__details" to={`/maintenance/tasks/${current?.id}`}>Details<Icon_ArrowRight size={14} aria-hidden /></Link>
</div>
{(current) && (<div className="maintenance-tasks__current">
<div>
<div className="maintenance-tasks__badges">
<span className="maintenance-tasks__id">{current.id}</span>
<PriorityBadge priority={current.priority} />
<StatusBadge status={current.status} />
</div>
<p className="maintenance-tasks__title">{current.title}</p>
<p className="maintenance-tasks__location">
<Icon_MapPin className="maintenance-tasks__location-icon" size={15} aria-hidden />
<span>{currentLocation}</span>
</p>
</div>
<div className="maintenance-tasks__next">
<RepairActions report={current} />
</div>
</div>)}</section>)}<section className="panel" aria-labelledby="task-list">
<div className="panel-header"><h2 className="panel-title" id="task-list">All assigned tasks</h2></div>
<div className="maintenance-tasks__filters">
<div className="maintenance-tasks__controls">
<SearchInput label="Search tasks" placeholder="Search tasks" value={query} onChange={(e) => setQuery(e.target.value)} />
<AppSelect ariaLabel="Filter by priority" value={priority} options={priorityOptions} onChange={setPriority} />
</div>
<ChipGroup label="Filter by status" options={filterOptions} value={filter} onChange={setFilter} counts={counts} />
</div>
<p className="maintenance-tasks__count" aria-live="polite">{visible.length} task{visible.length === 1 ? '' : 's'}</p>
{(visible.length) ? (<ul className="maintenance-tasks__list">
{(visible).map((r) => (<li className="maintenance-tasks__item" key={r.id}>
{(newLabel(r)) && (<span className="maintenance-tasks__new-marker" aria-hidden />)}<ReportCard report={r} to={`/maintenance/tasks/${r.id}`} showFlags meta={newLabel(r)} />
</li>))}
</ul>) : ((activeCount) ? (<EmptyState title="No tasks match" message="Try a different search or filter." action={<><button className="btn-secondary" type="button" onClick={clearFilters}>Clear filters</button></>} />) : (<EmptyState icon={Icon_ClipboardCheck} title="No active tasks" message="New assignments from the Facilities Office will appear here." />))}
</section>
</div></>
  )
}
