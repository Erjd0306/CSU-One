// GENERATED from src/pages/admin/admin-map.html by scripts/templates.mjs. Do not edit: change the .html template instead.
import type { AdminMapViewProps } from '../../../pages/admin/AdminMap'
import { AppSelect, CampusMap, ChipGroup, EmptyState, MapLegend, PageHeader, ReportCard } from '../../../templates/components'
import { ReportDrawer } from '../../../pages/admin/ReportDrawer'

export function AdminMapView(props: AdminMapViewProps) {
  const { status, setStatus, statusOptions, priority, setPriority, priorityOptions, category, setCategory, categoryOptions, visible, hasReports, openId, setOpenId } = props
  return (
    <><div className="admin-map">
<PageHeader title="Campus map" description="Every report pinned on the CSU Carig Campus map." />
<section className="panel">
<div className="admin-map__filters">
<ChipGroup label="Filter by status" options={statusOptions} value={status} onChange={setStatus} />
<div className="admin-map__selects">
<AppSelect ariaLabel="Filter by priority" value={priority} options={priorityOptions} onChange={setPriority} />
<AppSelect ariaLabel="Filter by category" value={category} options={categoryOptions} onChange={setCategory} />
</div>
</div>
<div className="admin-map__legend-row">
<MapLegend />
<p className="admin-map__count" aria-live="polite">{visible.length} report{visible.length === 1 ? '' : 's'} shown</p>
</div>
<div className="admin-map__layout">
<div className="admin-map__canvas-wrap">
<CampusMap label="Map of campus reports" reports={visible} selectedId={openId ?? undefined} onViewReport={(r) => setOpenId(r.id)} className="admin-map__canvas" />
</div>
<div className="admin-map__list">
<h2 className="sr-only">Reports on the map</h2>
{(visible.length) ? (<ul className="admin-map__items">
{(visible).map((r) => (<li key={r.id}><ReportCard report={r} onSelect={(x) => setOpenId(x.id)} /></li>))}
</ul>) : (<EmptyState title={hasReports ? 'No reports match' : 'No reports yet'} message={hasReports ? 'Change the filters to see more pins.' : 'Reported problems will be pinned here.'} />)}
</div>
</div>
</section>
{(openId) && (<ReportDrawer reportId={openId} onClose={() => setOpenId(null)} />)}</div></>
  )
}
