import { useState, type ReactNode } from 'react'
import { BarChart3, Table2 } from 'lucide-react'
import { STATUS_HEX } from '../../lib/meta'
import type { Status } from '../../types'

export type Datum = { label: string; value: number; display?: string }

type ChartPanelProps = {
  title: string
  description?: string
  rows: Datum[]
  valueLabel: string
  children: ReactNode
}

/** Panel with a chart/table toggle so every chart has an accessible data view. */
export function ChartPanel({ title, description, rows, valueLabel, children }: ChartPanelProps) {
  const [table, setTable] = useState(false)
  return (
    <section className="panel" aria-label={title}>
      <div className="panel-header">
        <div className="min-w-0">
          <h2 className="panel-title">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </div>
        <button type="button" className="btn-ghost btn-sm -mr-2 shrink-0" onClick={() => setTable((v) => !v)} aria-pressed={table}>
          {table ? <BarChart3 size={14} aria-hidden /> : <Table2 size={14} aria-hidden />}{table ? 'Chart' : 'Table'}
        </button>
      </div>
      <div className="p-4 sm:p-5">
        {table ? (
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b text-xs text-slate-500"><th scope="col" className="py-2 font-medium">Item</th><th scope="col" className="py-2 text-right font-medium">{valueLabel}</th></tr></thead>
            <tbody className="divide-y">
              {rows.map((r) => <tr key={r.label}><td className="py-2 text-slate-700">{r.label}</td><td className="py-2 text-right font-medium tabular-nums text-slate-900">{r.display ?? r.value}</td></tr>)}
            </tbody>
          </table>
        ) : children}
      </div>
    </section>
  )
}

/** Horizontal bars sorted by the caller. One hue; the value is printed beside each bar. */
export function BarList({ data, emptyText = 'No data yet' }: { data: Datum[]; emptyText?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  if (!data.some((d) => d.value > 0)) return <p className="py-6 text-center text-sm text-slate-500">{emptyText}</p>
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label} className="group" title={`${d.label}: ${d.display ?? d.value}`}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
            <span className="min-w-0 truncate font-medium text-slate-700">{d.label}</span>
            <span className="shrink-0 tabular-nums text-slate-600">{d.display ?? d.value}</span>
          </div>
          <div className="h-2 rounded-r bg-slate-100">
            <div className="h-full rounded-r bg-navy-700 transition-colors group-hover:bg-navy-900" style={{ width: `${(d.value / max) * 100}%`, minWidth: d.value > 0 ? 4 : 0 }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

/** One stacked bar of status counts with a labelled legend; status colors always ship with text. */
export function StatusBar({ counts }: { counts: Record<Status, number> }) {
  const entries = (Object.keys(counts) as Status[]).map((s) => ({ status: s, value: counts[s] }))
  const total = entries.reduce((a, b) => a + b.value, 0)
  if (!total) return <p className="py-6 text-center text-sm text-slate-500">No reports yet</p>
  return (
    <div>
      <div className="flex h-3 gap-0.5 overflow-hidden rounded" role="img" aria-label={entries.map((e) => `${e.status}: ${e.value}`).join(', ')}>
        {entries.filter((e) => e.value > 0).map((e) => (
          <div key={e.status} title={`${e.status}: ${e.value}`} style={{ width: `${(e.value / total) * 100}%`, background: STATUS_HEX[e.status] }} />
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {entries.map((e) => (
          <li key={e.status} className="flex items-start gap-2">
            <span aria-hidden className="mt-1 h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: STATUS_HEX[e.status] }} />
            <span>
              <span className="block text-xs text-slate-500">{e.status}</span>
              <span className="block text-base font-semibold tabular-nums text-slate-900">{e.value}<span className="ml-1 text-xs font-normal text-slate-500">{Math.round((e.value / total) * 100)}%</span></span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Vertical columns for a short time series (e.g. six months). */
export function ColumnChart({ data }: { data: Datum[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(1, ...data.map((d) => d.value))
  const top = Math.max(2, Math.ceil(max / 2) * 2)
  return (
    <div>
      <div className="relative h-44">
        {[1, 0.5, 0].map((f) => (
          <div key={f} className="absolute inset-x-0 flex items-center gap-2" style={{ bottom: `${f * 100}%` }}>
            <span className="w-5 -translate-y-px text-right text-[10px] tabular-nums text-slate-400">{Math.round(top * f)}</span>
            <span className={`h-px flex-1 ${f === 0 ? 'bg-slate-300' : 'bg-slate-100'}`} />
          </div>
        ))}
        <div className="absolute inset-y-0 left-7 right-0 flex items-end gap-2 sm:gap-4">
          {data.map((d, i) => (
            <div
              key={d.label}
              className="relative flex h-full flex-1 items-end justify-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
              tabIndex={0}
              aria-label={`${d.label}: ${d.value} reports`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
            >
              {hover === i && (
                <span className="absolute z-10 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[11px] font-medium text-white dark:bg-slate-200 dark:text-slate-900" style={{ bottom: `calc(${(d.value / top) * 100}% + 8px)` }}>
                  {d.label}: {d.value}
                </span>
              )}
              <div className={`w-full max-w-10 rounded-t transition-colors ${hover === i ? 'bg-navy-900' : 'bg-navy-700'}`} style={{ height: `${(d.value / top) * 100}%`, minHeight: d.value ? 4 : 0 }} />
            </div>
          ))}
        </div>
      </div>
      <div className="ml-7 mt-2 flex gap-2 sm:gap-4">
        {data.map((d) => <span key={d.label} className="flex-1 text-center text-[11px] text-slate-500">{d.label}</span>)}
      </div>
    </div>
  )
}
