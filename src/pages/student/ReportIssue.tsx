import { useMemo, useState } from 'react'
import { describedBy } from '../../components/ui/Form'
import type { ComboEmptyAction, ComboOption } from '../../components/ui/select/SearchableCombobox'
import { campusLocationOptions } from '../../components/reports/locationOptions'
import { CAMPUS_CENTER, OPEN_GROUNDS_ID, buildingById, buildingName, isInsideCampus, nearestBuildingId } from '../../data/campus'
import { StudentReportIssueView } from '../../generated/views/student/student-report-issue'
import { CATEGORIES, PRIORITIES } from '../../lib/meta'
import { navigate } from '../../lib/router'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { useStore } from '../../state/AppStore'
import { useToast } from '../../state/Toast'
import type { Category, LatLng, Priority, Report } from '../../types'
import './student-report-issue.css'

type Draft = {
  category: Category | ''
  title: string
  pin: LatLng | null
  buildingId: string
  /** How the building was set: chosen in search ('manual') or suggested from the pin */
  buildingSource: 'manual' | 'pin' | ''
  locationDetail: string
  description: string
  photo?: string
  priority: Priority | ''
}

type Errors = Partial<Record<'category' | 'title' | 'pin' | 'buildingId' | 'description' | 'priority', string>>
type SetField = <K extends keyof Draft>(key: K, value: Draft[K]) => void

const EMPTY: Draft = { category: '', title: '', pin: null, buildingId: '', buildingSource: '', locationDetail: '', description: '', priority: '' }
const STAGES = ['Issue', 'Location', 'Details', 'Review'] as const
const STAGE_TITLES = ['What is the problem?', 'Where is it?', 'Tell us more', 'Review your report']
const OUTSIDE_CAMPUS = 'That spot is outside CSU Carig Campus. Move the pin inside the dashed boundary.'

const PRIORITY_HELP: Record<Priority, string> = {
  Urgent: 'A safety risk or makes a room unusable, e.g. exposed wiring or flooding.',
  Normal: 'Needs repair soon but is not dangerous.',
  Low: 'A minor problem that can wait.',
}

function validateStage(stage: number, d: Draft, mapFailed: boolean): Errors {
  const e: Errors = {}
  if (stage === 0) {
    if (!d.category) e.category = 'Choose the category that best fits the problem.'
    if (d.title.trim().length < 5) e.title = 'Enter a short title of at least 5 characters.'
  }
  if (stage === 1) {
    if (!mapFailed && !d.pin) e.pin = 'Tap the map to pin where the problem is.'
    else if (d.pin && !isInsideCampus(d.pin)) e.pin = OUTSIDE_CAMPUS
    if (!d.buildingId || !buildingById(d.buildingId)) e.buildingId = 'Choose a location from the suggestions or pin it on the map.'
  }
  if (stage === 2) {
    if (d.description.trim().length < 15) e.description = 'Describe the problem in at least 15 characters.'
    if (!d.priority) e.priority = 'Choose a priority level.'
  }
  return e
}

export type LocationModel = {
  options: ComboOption[]
  hint: string
  chooseBuilding: (id: string | null) => void
  emptyAction: ComboEmptyAction
  suggestionName: string | null
  keepCurrent: () => void
  useSuggestion: () => void
  pick: (p: LatLng) => void
  focusKey: number
  mapFailed: boolean
  onMapFailed: () => void
}

export type StudentReportIssueViewProps = {
  submitted: Report | null
  viewSubmitted: () => void
  reportAnother: () => void
  stage: number
  stages: typeof STAGES
  stageTitle: string
  goTo: (stage: number) => void
  draft: Draft
  errors: Errors
  set: SetField
  describe: typeof describedBy
  categories: typeof CATEGORIES
  priorities: { value: Priority; help: string }[]
  submitting: boolean
  submit: () => void
  location: LocationModel
  locationName: string
  pinLabel: string | null
}

const PRIORITY_CHOICES = PRIORITIES.map((p) => ({ value: p, help: PRIORITY_HELP[p] }))

/** Report an Issue. Markup: student-report-issue.html, styles: student-report-issue.css. */
export function ReportIssue() {
  useDocumentTitle('Report an issue')
  const { submitReport } = useStore()
  const toast = useToast()
  const [stage, setStage] = useState(0)
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [mapFailed, setMapFailed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<Report | null>(null)
  const [focusKey, setFocusKey] = useState(0)
  /** Nearest building to a moved pin, when it differs from a location the student chose by hand */
  const [pinSuggestion, setPinSuggestion] = useState<string | null>(null)
  const locationOptions = useMemo(() => campusLocationOptions(draft.pin), [draft.pin])

  const set: SetField = (key, value) => {
    setDraft((d) => ({ ...d, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const goTo = (target: number) => {
    // Moving forward validates every stage in between.
    for (let s = 0; s < target; s++) {
      const found = validateStage(s, draft, mapFailed)
      if (Object.keys(found).length) {
        setStage(s)
        setErrors(found)
        window.setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]')?.focus(), 0)
        return
      }
    }
    setErrors({})
    setStage(target)
    window.scrollTo({ top: 0 })
  }

  const submit = () => {
    const building = buildingById(draft.buildingId)
    if (!draft.category || !draft.priority || !building) return goTo(3)
    const position = draft.pin ?? { lat: building.lat, lng: building.lng }
    setSubmitting(true)
    window.setTimeout(() => {
      const report = submitReport({
        title: draft.title.trim(),
        category: draft.category as Category,
        description: draft.description.trim(),
        priority: draft.priority as Priority,
        buildingId: draft.buildingId,
        locationDetail: draft.locationDetail.trim(),
        lat: position.lat,
        lng: position.lng,
        locationSource: draft.pin ? 'pin' : 'building',
        photo: draft.photo,
      })
      setSubmitting(false)
      if (!report) {
        toast.error('The report could not be submitted. Please try again.')
        return
      }
      toast.success(`Report ${report.id} submitted`)
      setSubmitted(report)
      window.scrollTo({ top: 0 })
    }, 600)
  }

  // Pin moved on the map: suggest the closest verified location without overriding a manual choice.
  const pick = (p: LatLng) => {
    const nearest = nearestBuildingId(p)
    const keepManual = draft.buildingSource === 'manual' && draft.buildingId !== '' && draft.buildingId !== nearest
    setDraft((d) => (keepManual ? { ...d, pin: p } : { ...d, pin: p, buildingId: nearest, buildingSource: 'pin' }))
    setPinSuggestion(keepManual ? nearest : null)
    setErrors((e) => ({ ...e, pin: isInsideCampus(p) ? undefined : OUTSIDE_CAMPUS, buildingId: undefined }))
  }

  // Location chosen from search: move the pin there and center the map on it.
  const chooseBuilding = (id: string | null) => {
    setPinSuggestion(null)
    if (!id) {
      setDraft((d) => ({ ...d, buildingId: '', buildingSource: '' }))
      return
    }
    const b = buildingById(id)
    if (!b) return
    const target = id === OPEN_GROUNDS_ID ? draft.pin ?? { lat: b.lat, lng: b.lng } : { lat: b.lat, lng: b.lng }
    setDraft((d) => ({ ...d, buildingId: id, buildingSource: 'manual', pin: mapFailed ? null : target }))
    setErrors((e) => ({ ...e, buildingId: undefined, pin: undefined }))
    if (!mapFailed) setFocusKey((k) => k + 1)
  }

  const applyPinnedLocation = () => {
    if (!draft.pin) return
    setDraft((d) => ({ ...d, buildingId: nearestBuildingId(d.pin ?? CAMPUS_CENTER), buildingSource: 'pin' }))
    setPinSuggestion(null)
    setErrors((e) => ({ ...e, buildingId: undefined }))
  }

  const location: LocationModel = {
    options: locationOptions,
    hint: draft.buildingSource === 'pin' && draft.buildingId
      ? 'Filled in from your pin. Search to change it.'
      : 'Filled in when you pin the map, or search here.',
    chooseBuilding,
    emptyAction: {
      label: draft.pin ? 'Use pinned map location' : 'Use pinned map location (pin the map first)',
      onSelect: applyPinnedLocation,
      disabled: !draft.pin,
    },
    suggestionName: pinSuggestion ? buildingName(pinSuggestion) : null,
    keepCurrent: () => setPinSuggestion(null),
    useSuggestion: () => {
      if (!pinSuggestion) return
      setDraft((d) => ({ ...d, buildingId: pinSuggestion, buildingSource: 'pin' }))
      setPinSuggestion(null)
    },
    pick,
    focusKey,
    mapFailed,
    onMapFailed: () => setMapFailed(true),
  }

  return (
    <StudentReportIssueView
      submitted={submitted}
      viewSubmitted={() => { if (submitted) navigate(`/student/reports/${submitted.id}`) }}
      reportAnother={() => { setSubmitted(null); setDraft(EMPTY); setStage(0) }}
      stage={stage}
      stages={STAGES}
      stageTitle={STAGE_TITLES[stage]}
      goTo={goTo}
      draft={draft}
      errors={errors}
      set={set}
      describe={describedBy}
      categories={CATEGORIES}
      priorities={PRIORITY_CHOICES}
      submitting={submitting}
      submit={submit}
      location={location}
      locationName={`${buildingName(draft.buildingId)}${draft.locationDetail ? ` · ${draft.locationDetail}` : ''}`}
      pinLabel={draft.pin ? `Pinned at ${draft.pin.lat.toFixed(6)}, ${draft.pin.lng.toFixed(6)}` : null}
    />
  )
}
