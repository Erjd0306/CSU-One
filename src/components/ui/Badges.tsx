import { TriangleAlert } from 'lucide-react'
import { PRIORITY_STYLE, STATUS_DOT, STATUS_STYLE } from '../../lib/meta'
import type { Priority, Status } from '../../types'

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLE[status]}`}>
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {status}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${PRIORITY_STYLE[priority]}`}>
      {priority === 'Urgent' && <TriangleAlert size={11} aria-hidden />}
      {priority}
    </span>
  )
}

export function Avatar({ initials, size = 'md', tone = 'navy' }: { initials: string; size?: 'sm' | 'md' | 'lg'; tone?: 'navy' | 'light' }) {
  const sizes = { sm: 'h-8 w-8 text-[11px]', md: 'h-9 w-9 text-xs', lg: 'h-14 w-14 text-base' }
  const tones = { navy: 'bg-navy-900 text-white dark:text-slate-950', light: 'bg-white text-navy-900 ring-1 ring-slate-200' }
  return <span aria-hidden className={`grid shrink-0 place-items-center rounded-full font-semibold ${sizes[size]} ${tones[tone]}`}>{initials}</span>
}
