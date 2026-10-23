// GENERATED from src/pages/maintenance/maintenance-map.html by scripts/templates.mjs. Do not edit: change the .html template instead.
import type { MaintenanceMapViewProps } from '../../../pages/maintenance/MaintenanceMap'
import { CampusMap, EmptyState, MapLegend, PageHeader, ReportCard } from '../../../templates/components'

export function MaintenanceMapView(props: MaintenanceMapViewProps) {
  const { active, openTask } = props
  return (
    <><div className="maintenance-map">
<PageHeader title="Task map" description="Your active tasks on the campus map. Tap a pin to open it." />
<section className="panel">
<div className="maintenance-map__legend-row">
<MapLegend />
<p className="maintenance-map__count">{active.length} active task{active.length === 1 ? '' : 's'}</p>
</div>
<div className="maintenance-map__layout">
<div className="maintenance-map__canvas-wrap">
<CampusMap label="Map of your active tasks" reports={active} onMarkerSelect={openTask} className="maintenance-map__canvas" />
</div>
<div className="maintenance-map__list">
<h2 className="sr-only">Active tasks</h2>
{(active.length) ? (<ul className="maintenance-map__items">
{(active).map((r) => (<li key={r.id}><ReportCard report={r} to={`/maintenance/tasks/${r.id}`} /></li>))}
</ul>) : (<EmptyState title="No active tasks" message="Assigned tasks will appear on the map." />)}
</div>
</div>
</section>
</div></>
  )
}
