// GENERATED from src/pages/admin/admin-teams.html by scripts/templates.mjs. Do not edit: change the .html template instead.
import type { AdminTeamsViewProps } from '../../../pages/admin/TeamsPage'
import { AppSelect, Avatar, PageHeader, PriorityBadge, StatStrip, StatusBadge } from '../../../templates/components'
import { AssignControl } from '../../../pages/admin/AssignControl'
import { ReportDrawer } from '../../../pages/admin/ReportDrawer'
import { AssignToPersonModal } from '../../../pages/admin/TeamsPage'
import { ClipboardPlus as Icon_ClipboardPlus, Phone as Icon_Phone } from 'lucide-react'

export function AdminTeamsView(props: AdminTeamsViewProps) {
  const { stats, unassigned, teams, availabilityOptions, openReport, openId, closeDrawer, assignFor, closeAssign } = props
  return (
    <><div className="admin-teams">
<PageHeader title="Maintenance teams" description="Staff, availability, and workload. Assign reports from here." />
<StatStrip items={stats} />
{(unassigned.length) && (<section className="panel" aria-labelledby="unassigned">
<div className="panel-header">
<h2 className="panel-title" id="unassigned">Waiting for assignment</h2>
<span className="admin-teams__count">{unassigned.length} open</span>
</div>
<ul className="admin-teams__list">
{(unassigned).map((item) => (<li className="admin-teams__unassigned" key={item.report.id}>
<button className="admin-teams__report focusable" type="button" onClick={() => openReport(item.report.id)}>
<span className="admin-teams__report-title-row">
<span className="admin-teams__report-title">{item.report.title}</span>
<PriorityBadge priority={item.report.priority} />
</span>
<span className="admin-teams__report-meta">{item.report.id} · {item.report.category} · {item.location}</span>
</button>
<AssignControl report={item.report} />
</li>))}
</ul>
</section>)}{(teams).map((team) => (<section className="panel" key={team.id} aria-labelledby={`team-${team.id}`}>
<div className="panel-header">
<div>
<h2 className="panel-title" id={`team-${team.id}`}>{team.name}</h2>
<p className="admin-teams__focus">Handles {team.focus}</p>
</div>
</div>
{(!team.members.length) ? (<p className="admin-teams__empty">No staff in this team yet.</p>) : (<ul className="admin-teams__list">
{(team.members).map((m) => (<li className="admin-teams__person" key={m.person.id}>
<div className="admin-teams__person-row">
<div className="admin-teams__identity">
<Avatar initials={m.person.initials} />
<div className="admin-teams__identity-text">
<p className="admin-teams__name">{m.person.name}</p>
<p className="admin-teams__position">
                  {m.person.position}
                  <a className="admin-teams__phone focusable" href={m.tel}><Icon_Phone size={11} aria-hidden />{m.person.phone}</a>
</p>
</div>
</div>
<div className="admin-teams__controls">
<AppSelect ariaLabel={`Availability of ${m.person.name}`} value={m.person.availability} options={availabilityOptions} onChange={m.setAvailability} />
<div className="admin-teams__workload">
<div className="admin-teams__workload-row"><span>Workload</span><span className="admin-teams__workload-count">{m.active} active</span></div>
<div className="admin-teams__bar"><div className={`admin-teams__bar-fill ${m.overloaded ? 'is-overloaded' : ''}`} style={{ width: `${m.percent}%` }} /></div>
</div>
<button className="btn-secondary btn-sm" type="button" onClick={m.assign}><Icon_ClipboardPlus size={14} aria-hidden />Assign</button>
</div>
</div>
{(m.tasks.length) && (<ul className="admin-teams__tasks">
{(m.tasks).map((t) => (<li className="admin-teams__task" key={t.id}>
<button className="chip admin-teams__task-chip" type="button" onClick={() => openReport(t.id)}>
<span className="admin-teams__task-id">{t.id}</span>
<span className="admin-teams__task-title">{t.title}</span>
<StatusBadge status={t.status} />
</button>
</li>))}
</ul>)}</li>))}
</ul>)}
</section>))}
{(assignFor) && (<AssignToPersonModal person={assignFor} onClose={closeAssign} />)}{(openId) && (<ReportDrawer reportId={openId} onClose={closeDrawer} />)}</div></>
  )
}
