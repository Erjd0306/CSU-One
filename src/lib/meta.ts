import {
  Armchair, Building2, CircleHelp, DoorOpen, Droplets, Footprints, Lightbulb, Trash2, Zap, type LucideIcon,
} from 'lucide-react'
import type { Availability, Category, Priority, Status } from '../types'

/** Personnel availability: label, status dot, and whether assigning needs a warning. */
export const AVAILABILITY: { value: Availability; label: string; dot: string; assignable: boolean }[] = [
  { value: 'Available', label: 'Available', dot: 'bg-emerald-600', assignable: true },
  { value: 'On site', label: 'On Site', dot: 'bg-navy-500', assignable: true },
  { value: 'Busy', label: 'Busy', dot: 'bg-amber-500', assignable: false },
  { value: 'Off duty', label: 'Off Duty', dot: 'bg-slate-400', assignable: false },
]
export const availabilityMeta = (a: Availability) => AVAILABILITY.find((x) => x.value === a) ?? AVAILABILITY[0]

export const STATUSES: Status[] = ['Open', 'Assigned', 'In Progress', 'Resolved']
export const PRIORITIES: Priority[] = ['Urgent', 'Normal', 'Low']

export const CATEGORIES: { value: Category; description: string; icon: LucideIcon }[] = [
  { value: 'Furniture', description: 'Broken chairs, desks, tables', icon: Armchair },
  { value: 'Lighting', description: 'Damaged or flickering lights', icon: Lightbulb },
  { value: 'Electrical', description: 'Unsafe wiring, outlets, fans', icon: Zap },
  { value: 'Plumbing', description: 'Leaking faucets, clogged drains', icon: Droplets },
  { value: 'Doors & Windows', description: 'Broken doors, locks, windows', icon: DoorOpen },
  { value: 'Pathways', description: 'Cracked walkways, stairs, ramps', icon: Footprints },
  { value: 'Facilities', description: 'Damaged rooms, ceilings, fixtures', icon: Building2 },
  { value: 'Cleanliness', description: 'Garbage, spills, unsanitary areas', icon: Trash2 },
  { value: 'Other', description: 'Any other physical problem', icon: CircleHelp },
]

export const categoryIcon = (c: Category): LucideIcon => CATEGORIES.find((x) => x.value === c)?.icon ?? CircleHelp

/** Badge classes. Each status also carries a text label, so color is never the only cue. */
export const STATUS_STYLE: Record<Status, string> = {
  Open: 'bg-rose-50 text-rose-800 ring-rose-200',
  Assigned: 'bg-navy-50 text-navy-800 ring-navy-200',
  'In Progress': 'bg-amber-50 text-amber-800 ring-amber-200',
  Resolved: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
}

export const STATUS_DOT: Record<Status, string> = {
  Open: 'bg-rose-600',
  Assigned: 'bg-navy-700',
  'In Progress': 'bg-amber-500',
  Resolved: 'bg-emerald-600',
}

/** Map pin colors: red open, navy assigned, amber in progress, green resolved. */
export const STATUS_HEX: Record<Status, string> = {
  Open: '#c81e3a',
  Assigned: '#243b53',
  'In Progress': '#d97706',
  Resolved: '#15803d',
}

export const PRIORITY_STYLE: Record<Priority, string> = {
  Urgent: 'bg-rose-700 text-white ring-rose-700',
  Normal: 'bg-white text-slate-700 ring-slate-300',
  Low: 'bg-slate-100 text-slate-600 ring-slate-200',
}

export const PRIORITY_ORDER: Record<Priority, number> = { Urgent: 0, Normal: 1, Low: 2 }
export const STATUS_ORDER: Record<Status, number> = { Open: 0, Assigned: 1, 'In Progress': 2, Resolved: 3 }
