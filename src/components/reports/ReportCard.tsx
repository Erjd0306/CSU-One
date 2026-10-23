import { ChevronRight, MapPin, PackageOpen, MessageCircleQuestion } from 'lucide-react'
import { buildingName } from '../../data/campus'
import { categoryIcon } from '../../lib/meta'
import { timeAgo } from '../../lib/format'
import { Link } from '../../lib/router'
import type { Report } from '../../types'
import { PriorityBadge, StatusBadge } from '../ui/Badges'

type ReportCardProps = {
  report: Report
  /** Navigate to this route when the card is pressed */
  to?: string
  onSelect?: (r: Report) => void
  meta?: string
  showFlags?: boolean
}

/** A single report row. Rendered as a link or button so it is reachable by keyboard. */
export function ReportCard({ report, to, onSelect, meta, showFlags = false }: ReportCardProps) {
  const Icon = categoryIcon(report.category)
  const body = (
    <>
      <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md ${report.priority === 'Urgent' && report.status !== 'Resolved' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
        <Icon size={17} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-snug text-slate-900">{report.title}</span>
            <span className="mt-0.5 block text-xs text-slate-500">{report.id} · {report.category}</span>
          </span>
          <StatusBadge status={report.status} />
        </span>
        <span className="mt-1.5 flex items-start gap-1 text-xs text-slate-600">
          <MapPin size={13} className="mt-px shrink-0 text-slate-400" aria-hidden />
          <span className="min-w-0 break-words">{buildingName(report.buildingId)}{report.locationDetail ? ` · ${report.locationDetail}` : ''}</span>
        </span>
        <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <PriorityBadge priority={report.priority} />
          {showFlags && report.materialsNeeded && report.status !== 'Resolved' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800"><PackageOpen size={12} aria-hidden />Materials needed</span>
          )}
          {showFlags && report.pendingInfoRequest && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-navy-700"><MessageCircleQuestion size={12} aria-hidden />Info requested</span>
          )}
          <span className="ml-auto text-[11px] text-slate-500">{meta ?? timeAgo(report.updatedAt)}</span>
        </span>
      </span>
      <ChevronRight size={16} className="mt-2.5 hidden shrink-0 text-slate-400 sm:block" aria-hidden />
    </>
  )
  const cls = 'focusable flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50 active:bg-slate-100'
  if (to) return <Link to={to} className={cls}>{body}</Link>
  return <button type="button" onClick={() => onSelect?.(report)} className={cls}>{body}</button>
}
