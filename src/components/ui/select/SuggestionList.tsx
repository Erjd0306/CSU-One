import { useEffect, type CSSProperties, type ReactNode, type Ref } from 'react'
import { Check, LoaderCircle } from 'lucide-react'

export type ListItem = {
  /** Stable key, also used to build the DOM id for aria-activedescendant */
  key: string
  label: string
  description?: string
  leading?: ReactNode
  meta?: ReactNode
  disabled?: boolean
  /** Renders as a quiet action row (e.g. "Use pinned map location") */
  action?: boolean
}

type SuggestionListProps = {
  listId: string
  items: ListItem[]
  activeIndex: number
  selectedKey?: string | null
  /** Text to emphasise inside each label (typed search) */
  highlight?: string
  label: string
  style: CSSProperties
  panelRef: Ref<HTMLDivElement>
  onPick: (index: number) => void
  onHover: (index: number) => void
  loading?: boolean
  /** Shown above any items when there are no matching options */
  emptyMessage?: string
}

export const optionDomId = (listId: string, key: string) => `${listId}-opt-${key.replace(/[^A-Za-z0-9_-]/g, '_')}`

/** Wraps the first case-insensitive match of `query` in a medium-weight span. */
export function HighlightMatch({ text, query }: { text: string; query?: string }) {
  const q = query?.trim()
  if (!q) return <>{text}</>
  const tokens = q.toLowerCase().split(/\s+/).filter(Boolean).sort((a, b) => b.length - a.length)
  const lower = text.toLowerCase()
  for (const t of tokens) {
    const i = lower.indexOf(t)
    if (i >= 0) {
      return <>{text.slice(0, i)}<span className="font-medium text-slate-950">{text.slice(i, i + t.length)}</span>{text.slice(i + t.length)}</>
    }
  }
  return <>{text}</>
}

/**
 * The floating listbox shared by AppSelect and SearchableCombobox. Focus stays on
 * the field; the active row is exposed through aria-activedescendant.
 */
export function SuggestionList({
  listId, items, activeIndex, selectedKey, highlight, label, style, panelRef, onPick, onHover, loading = false, emptyMessage,
}: SuggestionListProps) {
  // Keep the active option visible while moving with the arrow keys.
  useEffect(() => {
    const item = items[activeIndex]
    if (item) document.getElementById(optionDomId(listId, item.key))?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, items, listId])

  const realOptions = items.filter((i) => !i.action)

  return (
    <div
      ref={panelRef}
      style={style}
      // Keep focus on the field so typing and keyboard navigation continue to work.
      onMouseDown={(e) => e.preventDefault()}
      className="z-[60] flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.12)]"
    >
      {loading ? (
        <p className="flex items-center gap-2 px-3 py-3 text-sm text-slate-500" role="status">
          <LoaderCircle size={15} className="animate-spin" aria-hidden />Loading options…
        </p>
      ) : (
        <>
          {realOptions.length === 0 && emptyMessage && <p className="px-3 pb-1 pt-3 text-sm text-slate-600">{emptyMessage}</p>}
          <ul id={listId} role="listbox" aria-label={label} className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1">
            {items.map((item, index) => {
              const active = index === activeIndex
              const selected = !item.action && item.key === selectedKey
              return (
                <li
                  key={item.key}
                  id={optionDomId(listId, item.key)}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={item.disabled || undefined}
                  onClick={() => { if (!item.disabled) onPick(index) }}
                  onPointerMove={() => { if (activeIndex !== index) onHover(index) }}
                  className={`flex min-h-11 cursor-pointer items-start gap-2.5 px-3 py-2 text-sm transition-colors ${
                    item.disabled ? 'cursor-not-allowed text-slate-400' : item.action ? 'font-medium text-brand-700' : 'text-slate-700'
                  } ${active && !item.disabled ? 'bg-slate-100' : ''}`}
                >
                  {item.leading && <span className="mt-0.5 shrink-0 text-slate-400">{item.leading}</span>}
                  <span className="min-w-0 flex-1">
                    <span className={`block break-words leading-snug ${selected ? 'font-medium text-slate-950' : ''}`}>
                      <HighlightMatch text={item.label} query={highlight} />
                    </span>
                    {item.description && <span className="mt-0.5 block text-xs leading-snug text-slate-500"><HighlightMatch text={item.description} query={highlight} /></span>}
                  </span>
                  {item.meta && <span className="mt-0.5 shrink-0 text-xs text-slate-500">{item.meta}</span>}
                  {selected && <Check size={16} className="mt-0.5 shrink-0 text-brand-700" aria-hidden />}
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
