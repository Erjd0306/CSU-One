import type { ReactNode } from 'react'
import { MapPin, MessageCircleQuestion, PackageOpen } from 'lucide-react'
import { buildingName } from '../../data/campus'
import { formatDateTime } from '../../lib/format'
import { personName, useStore } from '../../state/AppStore'
import type { Report } from '../../types'
import { CampusMap } from '../map/CampusMap'
import { PriorityBadge, StatusBadge } from '../ui/Badges'

/** Title block used at the top of every report detail view. */
export function ReportHeading({ report }: { report: Report }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500">{report.id}</span>
        <PriorityBadge priority={report.priority} />
        <StatusBadge status={report.status} />
      </div>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{report.title}</h2>
      <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-600">
        <MapPin size={15} className="mt-0.5 shrink-0 text-brand-700" aria-hidden />
        <span>{buildingName(report.buildingId)}{report.locationDetail ? ` · ${report.locationDetail}` : ''}</span>
      </p>
    </div>
  )
}

export function DetailSection({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="border-t pt-5 first:border-t-0 first:pt-0">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {actions}
      </div>
      {children}
    </section>
  )
}

export function ReportFacts({ report, showReporter = true }: { report: Report; showReporter?: boolean }) {
  const { personnel } = useStore()
  const rows: [string, string][] = [
    ['Category', report.category],
    ['Priority', report.priority],
    ['Submitted', formatDateTime(report.createdAt)],
    ['Assigned to', report.assigneeId ? personName(personnel, report.assigneeId) : 'Not yet assigned'],
  ]
  if (report.assignedAt) rows.push(['Assigned on', formatDateTime(report.assignedAt)])
  if (showReporter) rows.push(['Reported by', `${report.reporterName} (${report.reporterIdNumber})`])
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm min-[400px]:grid-cols-2">
      {rows.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="text-xs text-slate-500">{k}</dt>
          <dd className="mt-0.5 break-words font-medium text-slate-800">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

export function ReportLocation({ report }: { report: Report }) {
  return (
    <div className="space-y-2">
      <CampusMap label={`Location of ${report.title}`} reports={[report]} selectedId={report.id} className="h-56" />
      <p className="text-xs text-slate-500">
        {report.locationSource === 'pin' ? 'Pinned at' : 'Building location (map was unavailable)'}: {report.lat.toFixed(6)}, {report.lng.toFixed(6)}
      </p>
    </div>
  )
}

/** Callouts for open requests that need someone's attention. */
export function ReportFlags({ report }: { report: Report }) {
  if (report.status === 'Resolved' || (!report.materialsNeeded && !report.pendingInfoRequest)) return null
  return (
    <div className="space-y-2">
      {report.pendingInfoRequest && (
        <div className="flex gap-2.5 rounded-md border border-navy-200 bg-navy-50 p-3 text-sm">
          <MessageCircleQuestion size={17} className="mt-0.5 shrink-0 text-navy-700" aria-hidden />
          <div><p className="font-medium text-navy-900">Additional information requested</p><p className="mt-0.5 text-navy-800">{report.pendingInfoRequest}</p></div>
        </div>
      )}
      {report.materialsNeeded && (
        <div className="flex gap-2.5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
          <PackageOpen size={17} className="mt-0.5 shrink-0 text-amber-700" aria-hidden />
          <div><p className="font-medium text-amber-950">Additional materials needed</p><p className="mt-0.5 text-amber-900">{report.materialsNeeded}</p></div>
        </div>
      )}
    </div>
  )
}

export function InternalNotes({ report }: { report: Report }) {
  if (!report.notes.length) return <p className="text-sm text-slate-500">No internal notes yet.</p>
  return (
    <ul className="space-y-3">
      {[...report.notes].reverse().map((n) => (
        <li key={n.id} className="rounded-md bg-slate-50 px-3 py-2.5">
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{n.text}</p>
          <p className="mt-1 text-xs text-slate-500">{n.authorName} · {n.authorRole === 'admin' ? 'Administrator' : 'Maintenance'} · {formatDateTime(n.at)}</p>
        </li>
      ))}
    </ul>
  )
}
