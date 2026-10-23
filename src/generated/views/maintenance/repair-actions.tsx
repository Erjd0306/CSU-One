// GENERATED from src/pages/maintenance/repair-actions.html by scripts/templates.mjs. Do not edit: change the .html template instead.
import type { RepairActionsViewProps } from '../../../pages/maintenance/RepairActions'
import { ConfirmDialog, Field } from '../../../templates/components'
import { CircleCheck as Icon_CircleCheck, Hand as Icon_Hand, Wrench as Icon_Wrench } from 'lucide-react'

export function RepairActionsView(props: RepairActionsViewProps) {
  const { step, accept, start, openResolve, resolving, closeResolve, confirmResolve, note, setNote, showPhotoPrompt, addPhoto } = props
  return (
    <>{(step === 'done') ? (<p className="repair-actions__done"><Icon_CircleCheck size={16} aria-hidden />This repair has been completed.</p>) : (<>
<div className="repair-actions">
{(step === 'accept') ? (<p className="repair-actions__hint">Accept this task to confirm you will handle it.</p>) : ((step === 'start') ? (<p className="repair-actions__hint">Task accepted. Start the repair when you are on site.</p>) : (<p className="repair-actions__hint">Repair in progress. Mark it as resolved once the problem is fixed.</p>))}
<div className="repair-actions__action">
{(step === 'accept') ? (<button className="btn-primary repair-actions__button" type="button" onClick={accept}><Icon_Hand size={16} aria-hidden />Accept Task</button>) : ((step === 'start') ? (<button className="btn-primary repair-actions__button" type="button" onClick={start}><Icon_Wrench size={16} aria-hidden />Start Repair</button>) : (<button className="btn-primary repair-actions__button" type="button" onClick={openResolve}><Icon_CircleCheck size={16} aria-hidden />Mark as Resolved</button>))}
</div>
</div>
{(resolving) && (<ConfirmDialog title="Mark this task as resolved?" message="The student and the Facilities Office will be notified that the problem is fixed." confirmLabel="Mark as Resolved" onCancel={closeResolve} onConfirm={confirmResolve}>
<div className="repair-actions__resolve">
{(showPhotoPrompt) && (<div className="repair-actions__photo-prompt">
          No completion photo yet.
          <button className="link repair-actions__photo-link" type="button" onClick={addPhoto}>Add photo</button>
</div>)}<Field id="resolve-note" label="Completion note (optional)">
<textarea className="field" id="resolve-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="What was fixed?" />
</Field>
</div>
</ConfirmDialog>)}</>)}</>
  )
}
