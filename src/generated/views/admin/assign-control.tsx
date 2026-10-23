// GENERATED from src/pages/admin/assign-control.html by scripts/templates.mjs. Do not edit: change the .html template instead.
import type { AssignControlViewProps } from '../../../pages/admin/AssignControl'
import { SearchableCombobox } from '../../../templates/components'
import { TriangleAlert as Icon_TriangleAlert, UserCheck as Icon_UserCheck, Users as Icon_Users } from 'lucide-react'

export function AssignControlView(props: AssignControlViewProps) {
  const { resolved, fieldId, isReassign, selected, setSelected, options, person, unavailable, availabilityLabel, assign } = props
  return (
    <>{(resolved) ? (<p className="assign-control__resolved">Resolved reports must be reopened before they can be assigned again.</p>) : (<div className="assign-control">
<label className="sr-only" htmlFor={fieldId}>{isReassign ? 'Reassign to' : 'Assign to'}</label>
<div className="assign-control__row">
<div className="assign-control__field">
<SearchableCombobox id={fieldId} value={selected} options={options} onChange={setSelected} placeholder={isReassign ? 'Search personnel to reassign' : 'Search by name, team, or skill'} icon={Icon_Users} emptyMessage="No matching maintenance personnel." resultsLabel={(n) => `${n} personnel found`} clearLabel="Clear selected personnel" />
</div>
<button className="btn-primary assign-control__button" type="button" onClick={assign} disabled={!person}>
<Icon_UserCheck size={16} aria-hidden />{unavailable ? 'Assign anyway' : isReassign ? 'Reassign' : 'Assign'}
      </button>
</div>
{(person && unavailable) && (<p className="assign-control__warning" role="alert">
<Icon_TriangleAlert className="assign-control__warning-icon" size={14} aria-hidden />
      {person?.name} is {availabilityLabel}. The task may be delayed. Choose someone else or assign anyway.
    </p>)}</div>)}</>
  )
}
