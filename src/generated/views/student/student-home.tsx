// GENERATED from src/pages/student/student-home.html by scripts/templates.mjs. Do not edit: change the .html template instead.
import type { StudentHomeViewProps } from '../../../pages/student/StudentHome'
import { CampusMap, EmptyState, Link, MapLegend, PageHeader, ReportCard, StatStrip } from '../../../templates/components'
import { NotificationList } from '../../../pages/shared/NotificationsPage'
import { StudentTutorial } from '../../../pages/student/StudentHome'
import { ArrowRight as Icon_ArrowRight, CirclePlay as Icon_CirclePlay, CirclePlus as Icon_CirclePlus, ClipboardList as Icon_ClipboardList, ShieldAlert as Icon_ShieldAlert } from 'lucide-react'

export function StudentHomeView(props: StudentHomeViewProps) {
  const { firstName, stats, recent, updates, mine, openReport, tutorial, openTutorial, closeTutorial } = props
  return (
    <><div className="student-home">
<PageHeader title={`Hi, ${firstName}`} description="Report a campus problem or check on the ones you sent." actions={<>
<Link className="btn-primary student-home__report" to="/student/report"><Icon_CirclePlus size={17} aria-hidden />Report an issue</Link>
<button className="btn-secondary student-home__tour" type="button" onClick={openTutorial}><Icon_CirclePlay size={17} aria-hidden />How it works</button>
</>} />
<StatStrip items={stats} />
<div className="student-home__layout">
<div className="student-home__main">
<section className="panel" aria-labelledby="recent-reports">
<div className="panel-header">
<h2 className="panel-title" id="recent-reports">Recent reports</h2>
<Link className="link student-home__more" to="/student/reports">View all<Icon_ArrowRight size={14} aria-hidden /></Link>
</div>
{(recent.length) ? (<ul className="student-home__list">
{(recent).map((r) => (<li key={r.id}><ReportCard report={r} to={`/student/reports/${r.id}`} showFlags /></li>))}
</ul>) : (<EmptyState icon={Icon_ClipboardList} title="No reports yet" message="Reports you send will show up here so you can follow the repair." />)}
</section>
<section className="panel" aria-labelledby="latest-updates">
<div className="panel-header">
<h2 className="panel-title" id="latest-updates">Latest updates</h2>
<Link className="link student-home__more" to="/student/notifications">All alerts<Icon_ArrowRight size={14} aria-hidden /></Link>
</div>
<NotificationList items={updates} compact />
</section>
</div>
<aside className="student-home__side" aria-label="More information">
<section className="panel student-home__safety" aria-labelledby="safety">
<h2 className="student-home__safety-title" id="safety">
<Icon_ShieldAlert className="student-home__safety-icon" size={17} aria-hidden />Safety and emergencies
          </h2>
<p className="student-home__safety-text">
            Keep away from exposed wiring, broken glass, and flooded areas. CSU-One is for repairs. For fire, injuries, or immediate danger, call <a className="link" href="tel:911">911</a> and alert Campus Security.
          </p>
</section>
<section className="panel" aria-labelledby="map-preview">
<div className="panel-header"><h2 className="panel-title" id="map-preview">Your reports on the map</h2></div>
<div className="student-home__map">
<CampusMap label="Map of your reports at CSU Carig" reports={mine} onViewReport={openReport} className="student-home__map-canvas" />
<MapLegend />
</div>
</section>
</aside>
</div>
{(tutorial) && (<StudentTutorial onClose={closeTutorial} />)}</div></>
  )
}
