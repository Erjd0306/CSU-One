// GENERATED from src/pages/admin/assign-control-option.html by scripts/templates.mjs. Do not edit: change the .html template instead.
import type { AssignOptionPartProps } from '../../../pages/admin/AssignControl'

export function AssignOptionPart(props: AssignOptionPartProps) {
  const { part, initials, dot, availability, active } = props
  return (
    <>{(part === 'avatar') ? (<span className="assign-option__avatar">{initials}</span>) : (<span className="assign-option__meta">
<span className="assign-option__availability"><span className={`assign-option__dot ${dot}`} aria-hidden />{availability}</span>
<span>{active} active</span>
</span>)}</>
  )
}
