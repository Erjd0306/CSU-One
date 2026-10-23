// GENERATED from src/pages/admin/admin-dashboard.html by scripts/templates.mjs. Do not edit: change the .html template instead.
import type { AdminDashboardViewProps } from '../../../pages/admin/AdminDashboard'
import { CampusMap, EmptyState, Link, MapLegend, PageHeader, ReportCard, StatStrip, StatusBadge } from '../../../templates/components'
import { ArrowRight as Icon_ArrowRight, CircleCheck as Icon_CircleCheck, Inbox as Icon_Inbox } from 'lucide-react'

export function AdminDashboardView(props: AdminDashboardViewProps) {
  const { stats, attention, active, openReport, teamLoad, recent } = props
  return (
    <><div className="admin-dashboard">
<PageHeader title="Dashboard" description="What needs attention across CSU Carig today." actions={<>
<Link className="btn-primary admin-dashboard__manage" to="/admin/reports">Manage reports<Icon_ArrowRight size={16} aria-hidden /></Link>
</>} />
<StatStrip items={stats} />
<div className="admin-dashboard__layout">
<div className="admin-dashboard__main">
<section className="panel" aria-labelledby="attention">
<div className="panel-header">
<div className="admin-dashboard__heading">
<h2 className="panel-title" id="attention">Needs attention</h2>
<p className="admin-dashboard__subtitle">Urgent, unassigned, or waiting for materials</p>
</div>
<Link className="link admin-dashboard__more" to="/admin/reports">All<Icon_ArrowRight size={14} aria-hidden /></Link>
</div>
{(attention.length) ? (<ul className="admin-dashboard__list">
{(attention).map((r) => (<li key={r.id}><ReportCard report={r} to={`/admin/reports?id=${r.id}`} showFlags /></li>))}
</ul>) : (<EmptyState icon={Icon_CircleCheck} title="All clear" message="Nothing is urgent or waiting for assignment." />)}
</section>
<section className="panel" aria-labelledby="campus-map">
<div className="panel-header">
<h2 className="panel-title" id="campus-map">Campus issue map</h2>
<Link className="link admin-dashboard__more" to="/admin/map">Full map<Icon_ArrowRight size={14} aria-hidden /></Link>
</div>
<div className="admin-dashboard__map">
<CampusMap label="Map of active reports at CSU Carig" reports={active} onViewReport={openReport} className="admin-dashboard__map-canvas" />
<MapLegend />
</div>
</section>
</div>
<aside className="admin-dashboard__side" aria-label="Workload and recent reports">
<section className="panel" aria-labelledby="team-workload">
<div className="panel-header">
<h2 className="panel-title" id="team-workload">Maintenance workload</h2>
<Link className="link admin-dashboard__link" to="/admin/teams">Teams</Link>
</div>
<ul className="admin-dashboard__list">
{(teamLoad).map((t) => (<li className="admin-dashboard__team" key={t.id}>
<div className="admin-dashboard__team-row">
<span className="admin-dashboard__team-name">{t.name}</span>
<span className="admin-dashboard__team-count">{t.active} active · {t.members} staff</span>
</div>
<div className="admin-dashboard__bar"><div className="admin-dashboard__bar-fill" style={{ width: `${t.percent}%` }} /></div>
</li>))}
</ul>
</section>
<section className="panel" aria-labelledby="recent-reports">
<div className="panel-header">
<h2 className="panel-title" id="recent-reports">Recent reports</h2>
<Link className="link admin-dashboard__link" to="/admin/reports?sort=newest">View all</Link>
</div>
{(recent.length) ? (<ul className="admin-dashboard__list">
{(recent).map((item) => (<li key={item.report.id}>
<Link className="admin-dashboard__recent focusable" to={`/admin/reports?id=${item.report.id}`}>
<span className="admin-dashboard__recent-text">
<span className="admin-dashboard__recent-title">{item.report.title}</span>
<span className="admin-dashboard__recent-meta">{item.report.id} · {item.ago}</span>
</span>
<StatusBadge status={item.report.status} />
</Link>
</li>))}
</ul>) : (<EmptyState icon={Icon_Inbox} title="No reports yet" message="New reports from students will show up here." />)}
</section>
</aside>
</div>
</div></>
  )
}
