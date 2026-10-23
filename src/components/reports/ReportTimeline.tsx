import { Check } from 'lucide-react'
import { formatDateTime } from '../../lib/format'
import type { Report, TimelineType } from '../../types'

const MILESTONES: { label: string; key: 'createdAt' | 'assignedAt' | 'startedAt' | 'resolvedAt' }[] = [
  { label: 'Submitted', key: 'createdAt' },
  { label: 'Assigned', key: 'assignedAt' },
  { label: 'Started', key: 'startedAt' },
  { label: 'Resolved', key: 'resolvedAt' },
]

/** Four-step progress summary: Submitted → Assigned → Started → Resolved. */
export function MilestoneTracker({ report }: { report: Report }) {
  return (
    <ol className="grid grid-cols-4 gap-1" aria-label="Repair progress">
      {MILESTONES.map((m, i) => {
        const at = report[m.key]
        const done = !!at
        return (
          <li key={m.key} className="relative flex flex-col items-center text-center">
            {i > 0 && <span aria-hidden className={`absolute right-1/2 top-3.5 h-0.5 w-full${done ? 'bg-brand-700' : 'bg-slate-200'}`} />}
            <span className={`relative z-10 grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ring-4 ring-white ${done ? 'bg-brand-700 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {done ? <Check size={14} aria-hidden /> : i + 1}
            </span>
            <span className={`mt-1.5 text-xs font-medium ${done ? 'text-slate-900' : 'text-slate-500'}`}>{m.label}</span>
            <span className="text-[10px] leading-tight text-slate-500">{at ? formatDateTime(at) : 'Pending'}</span>
            <span className="sr-only">{done ? 'completed' : 'not yet'}</span>
          </li>
        )
      })}
    </ol>
  )
}

const DOT: Partial<Record<TimelineType, string>> = {
  submitted: 'bg-rose-600',
  assigned: 'bg-navy-700',
  reassigned: 'bg-navy-700',
  started: 'bg-amber-500',
  resolved: 'bg-emerald-600',
  reopened: 'bg-rose-600',
  materials: 'bg-amber-500',
  info_requested: 'bg-navy-500',
}

/** Full activity history, oldest first. */
export function ReportTimeline({ report }: { report: Report }) {
  return (
    <ol className="relative space-y-4 border-l border-slate-200 pl-5">
      {report.timeline.map((e) => (
        <li key={e.id} className="relative">
          <span aria-hidden className={`absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${DOT[e.type] ?? 'bg-slate-400'}`} />
          <p className="text-sm font-medium text-slate-900">{e.label}</p>
          {e.detail && <p className="mt-0.5 whitespace-pre-line text-sm leading-relaxed text-slate-600">{e.detail}</p>}
          <p className="mt-0.5 text-xs text-slate-500">{formatDateTime(e.at)} · {e.by}</p>
        </li>
      ))}
    </ol>
  )
}
