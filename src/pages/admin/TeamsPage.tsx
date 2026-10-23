import { useMemo, useState } from 'react'
import type { StatItem } from '../../components/ui/Page'
import type { SelectOption } from '../../components/ui/select/AppSelect'
import { buildingName } from '../../data/campus'
import { TEAMS } from '../../data/mockData'
import { AdminTeamsView } from '../../generated/views/admin/admin-teams'
import { AssignToPersonView } from '../../generated/views/admin/admin-teams-assign'
import { sortReports } from '../../lib/filters'
import { AVAILABILITY, availabilityMeta } from '../../lib/meta'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { useStore } from '../../state/AppStore'
import { useToast } from '../../state/Toast'
import type { Availability, Personnel, Report } from '../../types'
import { useWorkload } from './AssignControl'
import './admin-teams.css'

const AVAILABILITY_OPTIONS: SelectOption<Availability>[] = AVAILABILITY.map((a) => ({ value: a.value, label: a.label, dot: a.dot }))
/** Active tasks at which the workload bar turns red */
const CAPACITY = 4

type Member = {
  person: Personnel
  tel: string
  active: number
  percent: number
  overloaded: boolean
  tasks: Report[]
  setAvailability: (v: Availability) => void
  assign: () => void
}
type TeamView = { id: string; name: string; focus: string; members: Member[] }
type ReportWithLocation = { report: Report; location: string }

export type AdminTeamsViewProps = {
  stats: StatItem[]
  unassigned: ReportWithLocation[]
  teams: TeamView[]
  availabilityOptions: SelectOption<Availability>[]
  openReport: (id: string) => void
  openId: string | null
  closeDrawer: () => void
  assignFor: Personnel | null
  closeAssign: () => void
}

/** Admin Teams. Markup: admin-teams.html (+ admin-teams-assign.html), styles: admin-teams.css. */
export function TeamsPage() {
  useDocumentTitle('Maintenance teams')
  const { personnel, reports, setAvailability } = useStore()
  const toast = useToast()
  const workload = useWorkload()
  const [assignFor, setAssignFor] = useState<Personnel | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const unassigned = useMemo(() => sortReports(reports.filter((r) => r.status === 'Open'), 'priority'), [reports])
  const activeTotal = Object.values(workload).reduce((a, b) => a + b, 0)

  const teams: TeamView[] = TEAMS.map((team) => ({
    id: team.id,
    name: team.name,
    focus: team.focus.join(', ').toLowerCase(),
    members: personnel.filter((p) => p.teamId === team.id).map((p) => {
      const active = workload[p.id] ?? 0
      return {
        person: p,
        tel: `tel:${p.phone.replace(/\s/g, '')}`,
        active,
        percent: Math.min(100, (active / CAPACITY) * 100),
        overloaded: active >= CAPACITY,
        tasks: reports.filter((r) => r.assigneeId === p.id && r.status !== 'Resolved'),
        setAvailability: (v: Availability) => { setAvailability(p.id, v); toast.success(`${p.name} is now ${availabilityMeta(v).label.toLowerCase()}`) },
        assign: () => setAssignFor(p),
      }
    }),
  }))

  return (
    <AdminTeamsView
      stats={[
        { label: 'Personnel', value: personnel.length, note: `${TEAMS.length} teams` },
        { label: 'Available now', value: personnel.filter((p) => p.availability === 'Available').length, tone: 'success' },
        { label: 'Active tasks', value: activeTotal, tone: 'warning' },
        { label: 'Unassigned', value: unassigned.length, note: 'Open reports', tone: unassigned.length ? 'danger' : 'default' },
      ]}
      unassigned={unassigned.map((r) => ({ report: r, location: buildingName(r.buildingId) }))}
      teams={teams}
      availabilityOptions={AVAILABILITY_OPTIONS}
      openReport={setOpenId}
      openId={openId}
      closeDrawer={() => setOpenId(null)}
      assignFor={assignFor}
      closeAssign={() => setAssignFor(null)}
    />
  )
}

export type AssignToPersonViewProps = {
  person: Personnel
  availabilityLabel: string
  candidates: ReportWithLocation[]
  selected: string
  setSelected: (id: string) => void
  confirm: () => void
  onClose: () => void
}

/** Pick an open or active report and assign it to the chosen person. Markup: admin-teams-assign.html. */
export function AssignToPersonModal({ person, onClose }: { person: Personnel; onClose: () => void }) {
  const { reports, assignReport } = useStore()
  const toast = useToast()
  const [selected, setSelected] = useState('')
  const candidates = sortReports(reports.filter((r) => r.status !== 'Resolved' && r.assigneeId !== person.id), 'priority')

  const confirm = () => {
    const res = assignReport(selected, person.id)
    if (!res.ok) { toast.error(res.error); return }
    toast.success(`${selected} assigned to ${person.name}`)
    onClose()
  }

  return (
    <AssignToPersonView
      person={person}
      availabilityLabel={availabilityMeta(person.availability).label}
      candidates={candidates.map((r) => ({ report: r, location: buildingName(r.buildingId) }))}
      selected={selected}
      setSelected={setSelected}
      confirm={confirm}
      onClose={onClose}
    />
  )
}
