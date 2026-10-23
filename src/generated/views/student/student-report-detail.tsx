// GENERATED from src/pages/student/student-report-detail.html by scripts/templates.mjs. Do not edit: change the .html template instead.
import type { StudentReportDetailViewProps } from '../../../pages/student/StudentReportDetail'
import { DetailSection, EmptyState, Field, Link, MilestoneTracker, PhotoEvidence, ReportFacts, ReportHeading, ReportLocation, ReportTimeline } from '../../../templates/components'
import { ArrowLeft as Icon_ArrowLeft, LoaderCircle as Icon_LoaderCircle, Send as Icon_Send } from 'lucide-react'

export function StudentReportDetailView(props: StudentReportDetailViewProps) {
  const { report, showInfoRequest, reply, setReply, error, sending, sendReply } = props
  return (
    <>{(!report) ? (<div className="panel">
<EmptyState title="Report not found" message="This report does not exist or belongs to another student." action={<><Link className="btn-secondary" to="/student/reports">Back to my reports</Link></>} />
</div>) : (<div className="student-report">
<Link className="btn-ghost student-report__back" to="/student/reports"><Icon_ArrowLeft size={17} aria-hidden />My reports</Link>
<div className="student-report__layout">
<article className="panel student-report__main">
<ReportHeading report={report} />
<MilestoneTracker report={report} />
{(showInfoRequest) && (<section className="student-report__request" aria-labelledby="info-request">
<h3 className="student-report__request-title" id="info-request">The Facilities Office needs more information</h3>
<p className="student-report__request-text">{report.pendingInfoRequest}</p>
<div className="student-report__reply">
<Field id="reply" label="Your response" error={error}>
<textarea className={`field student-report__reply-input ${error ? 'field-invalid' : ''}`} id="reply" rows={3} value={reply} onChange={(e) => setReply(e.target.value)} aria-invalid={!!error} aria-describedby={error ? 'reply-error' : undefined} maxLength={400} />
</Field>
<div className="student-report__reply-actions">
<button className="btn-primary" type="button" onClick={sendReply} disabled={sending}>
{(sending) ? (<Icon_LoaderCircle className="student-report__spinner" size={16} aria-hidden />) : (<Icon_Send size={16} aria-hidden />)}
                Send response
              </button>
</div>
</div>
</section>)}<DetailSection title="Description"><p className="student-report__description">{report.description}</p></DetailSection>
<DetailSection title="Details"><ReportFacts report={report} showReporter={false} /></DetailSection>
<DetailSection title="Photo"><PhotoEvidence src={report.photo} alt={`Photo of ${report.title}`} /></DetailSection>
{(report.completionPhoto) && (<DetailSection title="Completion photo">
<PhotoEvidence src={report.completionPhoto} alt={`Repair completed for ${report.title}`} />
</DetailSection>)}<DetailSection title="Location"><ReportLocation report={report} /></DetailSection>
</article>
<aside>
<section className="panel student-report__timeline" aria-labelledby="timeline">
<h2 className="panel-title student-report__timeline-title" id="timeline">Timeline</h2>
<ReportTimeline report={report} />
</section>
</aside>
</div>
</div>)}</>
  )
}
