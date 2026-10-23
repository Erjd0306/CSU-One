// GENERATED from src/pages/admin/admin-report-drawer.html by scripts/templates.mjs. Do not edit: change the .html template instead.
import type { AdminReportDrawerViewProps } from '../../../pages/admin/ReportDrawer'
import { ConfirmDialog, DetailSection, Field, InternalNotes, MilestoneTracker, Modal, PhotoEvidence, ReportFacts, ReportFlags, ReportHeading, ReportLocation, ReportTimeline } from '../../../templates/components'
import { AssignControl } from '../../../pages/admin/AssignControl'
import { CircleCheck as Icon_CircleCheck, MessageCircleQuestion as Icon_MessageCircleQuestion, RotateCcw as Icon_RotateCcw, Send as Icon_Send } from 'lucide-react'

export function AdminReportDrawerView(props: AdminReportDrawerViewProps) {
  const { reportId, report, onClose, copy, openAction, closeAction, runAction, actionText, setActionText, confirmDisabled, actionTone, note, setNote, noteError, saveNote, describe } = props
  return (
    <>{(!report) ? (<Modal title="Report not found" onClose={onClose} size="sm">
<p className="report-drawer__missing">Report {reportId} was not found. It may have been deleted when the data was reset.</p>
</Modal>) : (<Modal title="Report details" description={`${report.id} · Submitted by ${report.reporterName}`} onClose={onClose} variant="drawer" footer={<>
<div className="report-drawer__footer">
<button className="btn-secondary" type="button" onClick={() => openAction('info')} disabled={report.status === 'Resolved'}>
<Icon_MessageCircleQuestion size={16} aria-hidden />Request info
        </button>
{(report.status === 'Resolved') ? (<button className="btn-danger" type="button" onClick={() => openAction('reopen')}><Icon_RotateCcw size={16} aria-hidden />Reopen</button>) : (<button className="btn-primary" type="button" onClick={() => openAction('resolve')}><Icon_CircleCheck size={16} aria-hidden />Resolve</button>)}
</div>
</>}>

<div className="report-drawer__body">
<ReportHeading report={report} />
<MilestoneTracker report={report} />
<ReportFlags report={report} />
<DetailSection title={report.assigneeId ? 'Assignment' : 'Assign to maintenance'}>
<AssignControl report={report} />
</DetailSection>
<DetailSection title="Description"><p className="report-drawer__description">{report.description}</p></DetailSection>
<DetailSection title="Photo evidence">
<div className="report-drawer__photos">
<PhotoEvidence src={report.photo} alt={`Photo of ${report.title} from the student`} />
{(report.completionPhoto) && (<PhotoEvidence src={report.completionPhoto} alt={`Completion photo for ${report.title}`} />)}</div>
</DetailSection>
<DetailSection title="Reporter and details"><ReportFacts report={report} /></DetailSection>
<DetailSection title="Map location"><ReportLocation report={report} /></DetailSection>
<DetailSection title="Status history"><ReportTimeline report={report} /></DetailSection>
<DetailSection title="Internal notes">
<InternalNotes report={report} />
<div className="report-drawer__note">
<Field id="admin-note" label="Add a note" error={noteError} hint="Only administrators and maintenance can see notes.">
<textarea className={`field ${noteError ? 'field-invalid' : ''}`} id="admin-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} aria-invalid={!!noteError} aria-describedby={describe('admin-note', noteError, 'hint')} maxLength={400} />
</Field>
<div className="report-drawer__note-actions">
<button className="btn-secondary btn-sm" type="button" onClick={saveNote}><Icon_Send size={14} aria-hidden />Add note</button>
</div>
</div>
</DetailSection>
</div>
{(copy) && (<ConfirmDialog title={copy.title} message={copy.message} confirmLabel={copy.label} tone={actionTone} confirmDisabled={confirmDisabled} onCancel={closeAction} onConfirm={runAction}>
<Field id="action-text" label={copy.field} required={copy.required}>
<textarea className="field" id="action-text" rows={3} value={actionText} onChange={(e) => setActionText(e.target.value)} maxLength={300} />
</Field>
</ConfirmDialog>)}</Modal>)}</>
  )
}
