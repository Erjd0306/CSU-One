import { useId, type ReactNode } from 'react'
import { ChevronDown, type LucideIcon } from 'lucide-react'

/** Bordered container for collapsible profile sections. */
export function ProfileAccordion({ children }: { children: ReactNode }) {
  return <div className="panel divide-y overflow-hidden">{children}</div>
}

type SectionProps = {
  id: string
  title: string
  /** One short line shown under the title while collapsed */
  summary: string
  icon: LucideIcon
  open: boolean
  onToggle: (id: string) => void
  children: ReactNode
}

/** One collapsible section; closed unless `open` is true. */
export function ProfileAccordionSection({ id, title, summary, icon: Icon, open, onToggle, children }: SectionProps) {
  const panelId = `${useId()}-${id}`
  return (
    <section id={`section-${id}`} className="scroll-mt-24">
      <h2>
        <button
          type="button"
          onClick={() => onToggle(id)}
          aria-expanded={open}
          aria-controls={panelId}
          className="focusable flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50 active:bg-slate-100 sm:px-5"
        >
          <Icon size={18} className="shrink-0 text-slate-500" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block text-base font-semibold text-slate-900">{title}</span>
            <span className="block truncate text-xs text-slate-500">{summary}</span>
          </span>
          <ChevronDown size={18} aria-hidden className={`shrink-0 text-slate-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
        </button>
      </h2>
      <div id={panelId} hidden={!open} className="border-t bg-white px-4 py-4 sm:px-5">
        {children}
      </div>
    </section>
  )
}
