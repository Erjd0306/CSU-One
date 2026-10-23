import { useMemo, useState } from 'react'
import type { ComboOption } from '../../components/ui/select/SearchableCombobox'
import { TEAMS } from '../../data/mockData'
import { AssignControlView } from '../../generated/views/admin/assign-control'
import { AssignOptionPart } from '../../generated/views/admin/assign-control-option'
import { availabilityMeta } from '../../lib/meta'
import { useStore } from '../../state/AppStore'
import { useToast } from '../../state/Toast'
import type { Personnel, Report } from '../../types'
import './assign-control.css'

/** Active (not yet resolved) task count per person. */
export function useWorkload(): Record<string, number> {
  const { reports } = useStore()
  return useMemo(() => {
    const load: Record<string, number> = {}
    for (const r of reports) {
      if (r.assigneeId && (r.status === 'Assigned' || r.status === 'In Progress')) load[r.assigneeId] = (load[r.assigneeId] ?? 0) + 1
    }
    return load
  }, [reports])
}

export type AssignOptionPartProps = { part: 'avatar' | 'meta'; initials: string; dot: string; availability: string; active: number }

/** Personnel as search suggestions; the team that handles this report's category is listed first. */
function personnelOptions(personnel: Personnel[], report: Report, workload: Record<string, number>): ComboOption[] {
  const teamOf = (p: Personnel) => TEAMS.find((t) => t.id === p.teamId)
  const recommended = (p: Personnel) => !!teamOf(p)?.focus.includes(report.category)
  return [...personnel]
    .sort((a, b) => Number(recommended(b)) - Number(recommended(a)) || (workload[a.id] ?? 0) - (workload[b.id] ?? 0))
    .map((p) => {
      const team = teamOf(p)
      const avail = availabilityMeta(p.availability)
      const parts = { initials: p.initials, dot: avail.dot, availability: avail.label, active: workload[p.id] ?? 0 }
      return {
        value: p.id,
        label: p.name,
        description: `${p.position} · ${team?.name ?? 'Maintenance'}${recommended(p) ? ' · Recommended' : ''}`,
        keywords: [team?.name ?? '', p.position, avail.label, ...(team?.focus ?? [])],
        leading: <AssignOptionPart part="avatar" {...parts} />,
        meta: <AssignOptionPart part="meta" {...parts} />,
        disabled: p.id === report.assigneeId,
      }
    })
}

export type AssignControlViewProps = {
  resolved: boolean
  fieldId: string
  isReassign: boolean
  selected: string | null
  setSelected: (id: string | null) => void
  options: ComboOption[]
  person: Personnel | undefined
  unavailable: boolean
  availabilityLabel: string
  assign: () => void
}

/** Assign or reassign a report. Markup: assign-control.html (+ assign-control-option.html), styles: assign-control.css. */
export function AssignControl({ report, onDone }: { report: Report; onDone?: () => void }) {
  const { personnel, assignReport } = useStore()
  const toast = useToast()
  const workload = useWorkload()
  const [selected, setSelected] = useState<string | null>(null)
  const options = useMemo(() => personnelOptions(personnel, report, workload), [personnel, report, workload])
  const isReassign = !!report.assigneeId
  const person = personnel.find((p) => p.id === selected)

  const assign = () => {
    if (!person) return
    const res = assignReport(report.id, person.id)
    if (!res.ok) { toast.error(res.error); return }
    toast.success(`${report.id} ${isReassign ? 'reassigned' : 'assigned'} to ${person.name}`)
    setSelected(null)
    onDone?.()
  }

  return (
    <AssignControlView
      resolved={report.status === 'Resolved'}
      fieldId={`assign-${report.id}`}
      isReassign={isReassign}
      selected={selected}
      setSelected={setSelected}
      options={options}
      person={person}
      unavailable={person ? !availabilityMeta(person.availability).assignable : false}
      availabilityLabel={person ? availabilityMeta(person.availability).label.toLowerCase() : ''}
      assign={assign}
    />
  )
}
