import type { InputHTMLAttributes, ReactNode } from 'react'
import { CircleAlert, Search } from 'lucide-react'

type FieldProps = { id: string; label: string; error?: string; hint?: string; required?: boolean; children: ReactNode; action?: ReactNode }

/** Label + control + hint/error with consistent spacing. The control must use `id` and aria-describedby from here. */
export function Field({ id, label, error, hint, required, children, action }: FieldProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="label">
          {label}
          {required && <span className="ml-0.5 text-rose-700" aria-hidden>*</span>}
        </label>
        {action}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="error-text"><CircleAlert size={13} aria-hidden />{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="hint">{hint}</p>
      ) : null}
    </div>
  )
}

export const describedBy = (id: string, error?: string, hint?: string) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined)

type SearchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: string }

export function SearchInput({ label, className = '', ...rest }: SearchProps) {
  return (
    <div className={`relative ${className}`}>
      <Search size={17} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input type="search" aria-label={label} className="field pl-9" {...rest} />
    </div>
  )
}

type ToggleProps = { id: string; label: string; description?: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }

export function Toggle({ id, label, description, checked, onChange, disabled }: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-slate-800">{label}</label>
        {description && <p id={`${id}-desc`} className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? `${id}-desc` : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`focusable relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition disabled:cursor-not-allowed disabled:opacity-50 ${checked ? 'bg-brand-700' : 'bg-slate-300'}`}
      >
        <span className={`h-6 w-6 rounded-full bg-white shadow-sm transition-transform dark:bg-slate-800 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

type ChipGroupProps<T extends string> = { label: string; options: readonly T[]; value: T; onChange: (v: T) => void; counts?: Partial<Record<T, number>> }

/** Single-select filter chips. Wraps instead of scrolling horizontally. */
export function ChipGroup<T extends string>({ label, options, value, onChange, counts }: ChipGroupProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button key={o} type="button" aria-pressed={value === o} onClick={() => onChange(o)} className={`chip ${value === o ? 'chip-active' : ''}`}>
          {o}
          {counts?.[o] !== undefined && <span className="tabular-nums text-slate-400">{counts[o]}</span>}
        </button>
      ))}
    </div>
  )
}
