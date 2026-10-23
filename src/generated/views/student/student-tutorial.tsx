// GENERATED from src/pages/student/student-tutorial.html by scripts/templates.mjs. Do not edit: change the .html template instead.
import type { StudentTutorialViewProps } from '../../../pages/student/StudentHome'
import { Modal } from '../../../templates/components'

export function StudentTutorialView(props: StudentTutorialViewProps) {
  const { step, steps, index, next, back, skip } = props
  return (
    <><Modal title={step.title} description={step.text} onClose={skip} variant="alert" layout="compact" footer={<>
<div className="tutorial__footer">
{(index < steps.length - 1) ? (<button className="btn-ghost tutorial__skip" type="button" onClick={skip}>Skip</button>) : (<span />)}
<div className="tutorial__nav">
{(index > 0) && (<button className="btn-secondary" type="button" onClick={back}>Back</button>)}<button className="btn-primary" type="button" onClick={next}>{index === steps.length - 1 ? 'Got it' : 'Next'}</button>
</div>
</div>
</>}>
<div className="tutorial">
<div className="tutorial__cue">
<span className="tutorial__cue-icon"><step.icon size={20} aria-hidden /></span>
<span className="tutorial__cue-text">{step.cue}</span>
</div>
<div className="tutorial__progress">
<ol className="tutorial__dots" aria-hidden>
{(steps).map((s, i) => (<li className={`tutorial__dot ${i === index ? 'is-current' : ''}`} key={s.title} />))}
</ol>
<p className="tutorial__count">Step {index + 1} of {steps.length}</p>
</div>
</div>

</Modal></>
  )
}
