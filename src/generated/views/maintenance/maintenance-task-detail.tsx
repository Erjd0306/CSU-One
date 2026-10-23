// GENERATED from src/pages/maintenance/maintenance-task-detail.html by scripts/templates.mjs. Do not edit: change the .html template instead.
import type { MaintenanceTaskDetailViewProps } from '../../../pages/maintenance/TaskDetail'
import { DetailSection, EmptyState, Field, InternalNotes, Link, MilestoneTracker, Modal, ModalCancelButton, PhotoEvidence, PhotoPicker, ReportFacts, ReportFlags, ReportHeading, ReportLocation, ReportTimeline } from '../../../templates/components'
import { RepairActions } from '../../../pages/maintenance/RepairActions'
import { ArrowLeft as Icon_ArrowLeft, Camera as Icon_Camera, MessageSquarePlus as Icon_MessageSquarePlus, PackageOpen as Icon_PackageOpen } from 'lucide-react'

export function MaintenanceTaskDetailView(props: MaintenanceTaskDetailViewProps) {
  const { report, backTo, backLabel, canWork, dialog, openDialog, closeDialog, textCopy, text, setText, textError, saveText, photo, setPhoto, savePhoto, photoChanged, describe } = props
  return (
    <>{(!report) ? (<div className="panel">
<EmptyState title="Task not found" message="This task does not exist or is no longer assigned to you." action={<><Link className="btn-secondary" to="/maintenance">Back to tasks</Link></>} />
</div>) : (<div className="task-detail">
<Link className="btn-ghost task-detail__back" to={backTo}><Icon_ArrowLeft size={17} aria-hidden />{backLabel}</Link>
<div className="task-detail__layout">
<article className="panel task-detail__main">
<ReportHeading report={report} />
<MilestoneTracker report={report} />
<ReportFlags report={report} />

<section className="task-detail__progress" aria-labelledby="next-step">
<h3 className="task-detail__progress-title" id="next-step">Repair progress</h3>
<RepairActions report={report} onAddPhoto={() => openDialog('photo')} />
{(canWork) && (<div className="task-detail__tools">
<button className="btn-secondary btn-sm" type="button" onClick={() => openDialog('note')}><Icon_MessageSquarePlus size={14} aria-hidden />Progress note</button>
<button className="btn-secondary btn-sm" type="button" onClick={() => openDialog('photo')}><Icon_Camera size={14} aria-hidden />{report.completionPhoto ? 'Replace photo' : 'Completion photo'}</button>
<button className="btn-secondary btn-sm" type="button" onClick={() => openDialog('materials')}><Icon_PackageOpen size={14} aria-hidden />Need materials</button>
</div>)}</section>
<DetailSection title="Student's description"><p className="task-detail__description">{report.description}</p></DetailSection>
<DetailSection title="Exact location"><ReportLocation report={report} /></DetailSection>
<DetailSection title="Photo evidence">
<div className="task-detail__photos">
<div><p className="task-detail__photo-label">From the student</p><PhotoEvidence src={report.photo} alt={`Photo of ${report.title}`} /></div>
<div><p className="task-detail__photo-label">Completion photo</p><PhotoEvidence src={report.completionPhoto} alt={`Completion photo for ${report.title}`} emptyLabel="No completion photo yet" /></div>
</div>
</DetailSection>
<DetailSection title="Details"><ReportFacts report={report} /></DetailSection>
<DetailSection title="Internal maintenance notes"><InternalNotes report={report} /></DetailSection>
</article>
<aside>
<section className="panel task-detail__timeline" aria-labelledby="timeline">
<h2 className="panel-title task-detail__timeline-title" id="timeline">Timeline</h2>
<ReportTimeline report={report} />
</section>
</aside>
</div>

{(textCopy) && (<Modal title={textCopy.title} description={`${report.id} · ${report.title}`} onClose={closeDialog} size="sm" footer={<>
<div className="task-detail__dialog-actions">
<ModalCancelButton />
<button className="btn-primary" type="button" onClick={saveText} disabled={!text.trim()}>{textCopy.button}</button>
</div>
</>}>

<Field id="action-text" label={textCopy.label} required error={textError} hint={textCopy.hint}>
<textarea className={`field ${textError ? 'field-invalid' : ''}`} id="action-text" rows={4} value={text} onChange={(e) => setText(e.target.value)} aria-invalid={!!textError} aria-describedby={describe('action-text', textError, textCopy.hint)} maxLength={400} placeholder={textCopy.placeholder} />
</Field>
</Modal>)}{(dialog === 'photo') && (<Modal title="Completion photo" description="Show the finished repair." onClose={closeDialog} size="sm" footer={<>
<div className="task-detail__dialog-actions">
<ModalCancelButton />
<button className="btn-primary" type="button" onClick={savePhoto} disabled={!photoChanged}>Save photo</button>
</div>
</>}>

<PhotoPicker id="completion-photo" value={photo} onChange={setPhoto} label="Photo of the completed repair" />
</Modal>)}</div>)}</>
  )
}
