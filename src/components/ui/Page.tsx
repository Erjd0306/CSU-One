import type { ReactNode } from 'react'
import { FileSearch, type LucideIcon } from 'lucide-react'

type PageHeaderProps = { title: string; description?: string; actions?: ReactNode; eyebrow?: string }

/** The page title is the most prominent text on every screen; actions sit to its right on larger screens. */
export function PageHeader({ title, description, actions, eyebrow }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-700">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 lg:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

type EmptyStateProps = { title: string; message: string; icon?: LucideIcon; action?: ReactNode }

export function EmptyState({ title, message, icon: Icon = FileSearch, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-500"><Icon size={20} aria-hidden /></span>
      <p className="mt-3 text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-slate-500">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading content">
      <div className="space-y-2"><div className="skeleton h-8 w-56" /><div className="skeleton h-4 w-80 max-w-full" /></div>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-slate-200 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="space-y-2 bg-white p-4"><div className="skeleton h-3 w-20" /><div className="skeleton h-7 w-12" /></div>)}
      </div>
      <div className="panel space-y-3 p-4">
        {[0, 1, 2, 3, 4].map((i) => <div key={i} className="flex items-center gap-3"><div className="skeleton h-9 w-9 shrink-0" /><div className="flex-1 space-y-2"><div className="skeleton h-3.5 w-2/3" /><div className="skeleton h-3 w-1/3" /></div></div>)}
      </div>
    </div>
  )
}

export type StatItem = { label: string; value: string | number; note?: string; tone?: 'default' | 'danger' | 'warning' | 'success' | 'navy' }

/** A divided stat strip: one bordered band instead of a grid of floating cards. */
export function StatStrip({ items }: { items: StatItem[] }) {
  const tones = { default: 'text-slate-950', danger: 'text-rose-700', warning: 'text-amber-700', success: 'text-emerald-700', navy: 'text-navy-800' }
  const cols = items.length >= 6 ? 'sm:grid-cols-3 xl:grid-cols-6' : items.length === 5 ? 'lg:grid-cols-5' : items.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
  return (
    <dl className={`grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-slate-200 ${cols}`}>
      {items.map((s, i) => (
        <div key={s.label} className={`bg-white px-4 py-3.5 ${items.length % 2 === 1 && i === items.length - 1 ? 'col-span-2 lg:col-span-1' : ''}`}>
          <dt className="text-xs font-medium text-slate-500">{s.label}</dt>
          <dd className={`mt-1 text-2xl font-semibold tabular-nums tracking-tight ${tones[s.tone ?? 'default']}`}>{s.value}</dd>
          {s.note && <dd className="mt-0.5 truncate text-xs text-slate-500">{s.note}</dd>}
        </div>
      ))}
    </dl>
  )
}
