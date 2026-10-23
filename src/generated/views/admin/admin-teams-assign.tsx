// GENERATED from src/pages/admin/admin-teams-assign.html by scripts/templates.mjs. Do not edit: change the .html template instead.
import type { AssignToPersonViewProps } from '../../../pages/admin/TeamsPage'
import { EmptyState, Modal, PriorityBadge, StatusBadge } from '../../../templates/components'

export function AssignToPersonView(props: AssignToPersonViewProps) {
  const { person, availabilityLabel, candidates, selected, setSelected, confirm, onClose } = props
  return (
    <><Modal title={`Assign a report to ${person.name}`} description={`${person.position} · ${availabilityLabel}`} onClose={onClose} footer={<>
<div className="teams-assign__footer">
<button className="btn-secondary" type="button" onClick={onClose}>Cancel</button>
<button className="btn-primary" type="button" disabled={!selected} onClick={confirm}>Assign report</button>
</div>
</>}>

{(candidates.length) ? (<fieldset>
<legend className="teams-assign__legend">Open reports are listed first. Choosing an assigned report reassigns it.</legend>
<ul className="teams-assign__list">
{(candidates).map((c) => (<li key={c.report.id}>
<label className={`teams-assign__option ${selected === c.report.id ? 'is-selected' : ''}`}>
<input className="teams-assign__radio" type="radio" name="assign-report" value={c.report.id} checked={selected === c.report.id} onChange={() => setSelected(c.report.id)} />
<span className="teams-assign__text">
<span className="teams-assign__title-row">
<span className="teams-assign__title">{c.report.title}</span>
<PriorityBadge priority={c.report.priority} />
<StatusBadge status={c.report.status} />
</span>
<span className="teams-assign__meta">{c.report.id} · {c.report.category} · {c.location}</span>
</span>
</label>
</li>))}
</ul>
</fieldset>) : (<EmptyState title="Nothing to assign" message="There are no open or active reports available." />)}
</Modal></>
  )
}
