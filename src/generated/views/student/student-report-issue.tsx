// GENERATED from src/pages/student/student-report-issue.html by scripts/templates.mjs. Do not edit: change the .html template instead.
import type { StudentReportIssueViewProps } from '../../../pages/student/ReportIssue'
import { CampusMap, Field, Link, PageHeader, PhotoPicker, PrimaryButton, PriorityBadge, SearchableCombobox } from '../../../templates/components'
import { ArrowLeft as Icon_ArrowLeft, ArrowRight as Icon_ArrowRight, Check as Icon_Check, CircleCheck as Icon_CircleCheck, MapPin as Icon_MapPin, Pencil as Icon_Pencil, Search as Icon_Search, Send as Icon_Send } from 'lucide-react'

export function StudentReportIssueView(props: StudentReportIssueViewProps) {
  const { submitted, viewSubmitted, reportAnother, stage, stages, stageTitle, goTo, draft, errors, set, describe, categories, priorities, submitting, submit, location, locationName, pinLabel } = props
  return (
    <>{(submitted) ? (<div className="report-done">
<section className="panel report-done__panel" aria-live="polite">
<span className="report-done__icon"><Icon_CircleCheck size={26} aria-hidden /></span>
<h1 className="report-done__title">Report submitted</h1>
<p className="report-done__text">Your report ID is <span className="report-done__id">{submitted.id}</span>. We will notify you as it moves through each step.</p>
<ol className="report-done__steps">
<li className="report-done__step"><span className="report-done__step-number">1.</span>The Facilities Office reviews your report.</li>
<li className="report-done__step"><span className="report-done__step-number">2.</span>It is assigned to a maintenance team.</li>
<li className="report-done__step"><span className="report-done__step-number">3.</span>You are notified when it is repaired.</li>
</ol>
<div className="report-done__actions">
<button className="btn-primary" type="button" onClick={viewSubmitted}>View report</button>
<button className="btn-secondary" type="button" onClick={reportAnother}>Report another issue</button>
</div>
</section>
</div>) : (<div className="report-issue">
<PageHeader title="Report an issue" description="Tell us what&apos;s broken and where. Fields with * are required." />
<ol className="report-issue__progress" aria-label="Report progress">
{(stages).map((label, i) => (<li key={label}>
<button className={`report-issue__step focusable ${i === stage ? 'is-current' : i < stage ? 'is-done' : ''}`} type="button" onClick={() => { if (i !== stage) goTo(i) }} aria-current={i === stage ? 'step' : undefined}>
<span className="report-issue__step-bar" />
<span className="report-issue__step-label">
{(i < stage) && (<Icon_Check size={12} aria-hidden />)}<span className="report-issue__step-number">{i + 1}.</span> {label}
          </span>
</button>
</li>))}
</ol>
<section className="panel" aria-labelledby="stage-title">
<div className="panel-header">
<div>
<h2 className="panel-title" id="stage-title">{stageTitle}</h2>
<p className="report-issue__step-count">Step {stage + 1} of {stages.length}</p>
</div>
</div>
<div className="report-issue__body">

{(stage === 0) ? (<>
<fieldset aria-describedby={errors.category ? 'category-error' : undefined}>
<legend className="label">Category<span className="report-issue__required" aria-hidden>*</span></legend>
<div className="report-issue__categories">
{(categories).map((c) => (<label className={`report-issue__choice ${`${draft.category === c.value ? 'is-selected' : ''} ${errors.category ? 'is-invalid' : ''}`}`} key={c.value}>
<input className="sr-only" type="radio" name="category" value={c.value} checked={draft.category === c.value} onChange={() => set('category', c.value)} data-invalid={errors.category ? 'true' : undefined} />
<c.icon className="report-issue__choice-icon" size={18} aria-hidden />
<span className="report-issue__choice-text">
<span className="report-issue__choice-title">{c.value}</span>
<span className="report-issue__choice-help">{c.description}</span>
</span>
</label>))}
</div>
{(errors.category) && (<p className="error-text" id="category-error">{errors.category}</p>)}</fieldset>
<Field id="title" label="Short title" required error={errors.title} hint="For example: Broken chair in Room 204">
<input className={`field ${errors.title ? 'field-invalid' : ''}`} id="title" value={draft.title} maxLength={80} onChange={(e) => set('title', e.target.value)} aria-invalid={!!errors.title} aria-describedby={describe('title', errors.title, 'hint')} placeholder="What is the problem?" />
</Field>
</>) : ((stage === 1) ? (<>
<div>
<div className="report-issue__map-heading">
<p className="report-issue__map-label" id="pin-label">Pin the spot on the map{(!location.mapFailed) && (<span className="report-issue__required" aria-hidden>*</span>)}</p>
{(!location.mapFailed) && (<p className="report-issue__map-help">Tap to drop a pin, then drag to adjust. Zoom in for building names.</p>)}</div>
<div className={`report-issue__map-frame ${errors.pin ? 'is-invalid' : ''}`} data-invalid={errors.pin ? 'true' : undefined} tabIndex={errors.pin ? -1 : undefined} aria-describedby={errors.pin ? 'pin-error' : undefined}>
<CampusMap label="Choose the report location on the CSU Carig map" pick={draft.pin} onPick={location.pick} focusKey={location.focusKey} onLoadFailed={location.onMapFailed} className="report-issue__map-canvas" />
</div>
{(errors.pin) ? (<p className="error-text" id="pin-error">{errors.pin}</p>) : ((pinLabel) ? (<p className="report-issue__pinned"><Icon_MapPin className="report-issue__pinned-icon" size={13} aria-hidden />{pinLabel}</p>) : ((location.mapFailed) && (<p className="report-issue__pinned">The map is unavailable, so the building's mapped location will be used.</p>)))}</div>
<div>
<Field id="building" label="Building or area" required error={errors.buildingId} hint={location.hint}>
<SearchableCombobox id="building" value={draft.buildingId || null} options={location.options} onChange={location.chooseBuilding} placeholder="Search for a building or area" icon={Icon_Search} error={!!errors.buildingId} describedBy={describe('building', errors.buildingId, location.hint)} emptyMessage="No matching place found." emptyAction={location.emptyAction} resultsLabel={(n) => `${n} place${n === 1 ? '' : 's'} found`} clearLabel="Clear building or area" />
</Field>
{(location.suggestionName) && (<div className="report-issue__suggestion" role="status">
<p>Your pin is closest to <span className="report-issue__suggestion-name">{location.suggestionName}</span>.</p>
<div className="report-issue__suggestion-actions">
<button className="btn-secondary btn-sm" type="button" onClick={location.keepCurrent}>Keep current</button>
<button className="btn-primary btn-sm" type="button" onClick={location.useSuggestion}>Use this place</button>
</div>
</div>)}</div>
<Field id="detail" label="Room, floor, or landmark" hint="Optional, but it helps the team find it.">
<input className="field" id="detail" value={draft.locationDetail} maxLength={80} onChange={(e) => set('locationDetail', e.target.value)} placeholder="e.g. Room 204, 2nd floor" aria-describedby="detail-hint" />
</Field>
</>) : ((stage === 2) ? (<>
<Field id="description" label="Description" required error={errors.description} hint={`${draft.description.length}/500 characters. Include what you saw and any safety risk.`}>
<textarea className={`field report-issue__description ${errors.description ? 'field-invalid' : ''}`} id="description" rows={5} maxLength={500} value={draft.description} onChange={(e) => set('description', e.target.value)} aria-invalid={!!errors.description} aria-describedby={describe('description', errors.description, 'hint')} placeholder="What happened? When did you notice it?" />
</Field>
<PhotoPicker id="photo" value={draft.photo} onChange={(v) => set('photo', v)} label="Photo (optional)" />
<fieldset aria-describedby={errors.priority ? 'priority-error' : undefined}>
<legend className="label">Priority<span className="report-issue__required" aria-hidden>*</span></legend>
<div className="report-issue__priorities">
{(priorities).map((p) => (<label className={`report-issue__choice report-issue__choice--priority ${`${draft.priority === p.value ? 'is-selected' : ''} ${errors.priority ? 'is-invalid' : ''}`}`} key={p.value}>
<input className="report-issue__radio" type="radio" name="priority" value={p.value} checked={draft.priority === p.value} onChange={() => set('priority', p.value)} data-invalid={errors.priority ? 'true' : undefined} />
<span>
<span className="report-issue__priority-title">{p.value}</span>
<span className="report-issue__priority-help">{p.help}</span>
</span>
</label>))}
</div>
{(errors.priority) && (<p className="error-text" id="priority-error">{errors.priority}</p>)}</fieldset>
</>) : (<>
<dl className="report-issue__review">
<div className="report-issue__review-row">
<div className="report-issue__review-pair"><dt>Category</dt><dd>{draft.category}</dd></div>
<button className="btn-ghost btn-sm report-issue__edit" type="button" onClick={() => goTo(0)} aria-label="Edit category"><Icon_Pencil size={13} aria-hidden />Edit</button>
</div>
<div className="report-issue__review-row">
<div className="report-issue__review-pair"><dt>Title</dt><dd>{draft.title}</dd></div>
<button className="btn-ghost btn-sm report-issue__edit" type="button" onClick={() => goTo(0)} aria-label="Edit title"><Icon_Pencil size={13} aria-hidden />Edit</button>
</div>
<div className="report-issue__review-row">
<div className="report-issue__review-pair">
<dt>Location</dt>
<dd>{locationName}<span className="report-issue__review-sub">{pinLabel || 'Building location'}</span></dd>
</div>
<button className="btn-ghost btn-sm report-issue__edit" type="button" onClick={() => goTo(1)} aria-label="Edit location"><Icon_Pencil size={13} aria-hidden />Edit</button>
</div>
<div className="report-issue__review-row">
<div className="report-issue__review-pair"><dt>Description</dt><dd className="report-issue__review-description">{draft.description}</dd></div>
<button className="btn-ghost btn-sm report-issue__edit" type="button" onClick={() => goTo(2)} aria-label="Edit description"><Icon_Pencil size={13} aria-hidden />Edit</button>
</div>
<div className="report-issue__review-row">
<div className="report-issue__review-pair">
<dt>Priority</dt>
<dd>{(draft.priority) ? (<PriorityBadge priority={draft.priority} />) : (<>—</>)}</dd>
</div>
<button className="btn-ghost btn-sm report-issue__edit" type="button" onClick={() => goTo(2)} aria-label="Edit priority"><Icon_Pencil size={13} aria-hidden />Edit</button>
</div>
</dl>
<div>
<p className="label">Photo</p>
{(draft.photo) ? (<img className="report-issue__review-photo" src={draft.photo} alt="Attached photo of the problem" />) : (<p className="report-issue__muted">No photo attached.</p>)}
</div>
<p className="report-issue__notice">
            By submitting, you confirm the information is accurate. The Campus Facilities Office will review your report and assign it to a maintenance team.
          </p>
</>)))}
</div>
<div className="report-issue__footer">
{(stage > 0) ? (<button className="btn-secondary" type="button" onClick={() => goTo(stage - 1)} disabled={submitting}>
<Icon_ArrowLeft size={17} aria-hidden />Back
        </button>) : (<Link className="btn-ghost" to="/student">Cancel</Link>)}
{(stage < 3) ? (<button className="btn-primary" type="button" onClick={() => goTo(stage + 1)}>Continue<Icon_ArrowRight size={17} aria-hidden /></button>) : (<PrimaryButton onClick={submit} loading={submitting} loadingText="Submitting…" icon={Icon_Send}>Submit report</PrimaryButton>)}
</div>
</section>
</div>)}</>
  )
}
