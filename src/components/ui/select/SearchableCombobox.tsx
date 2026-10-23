import { useCallback, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { LoaderCircle, X, type LucideIcon } from 'lucide-react'
import { SuggestionList, optionDomId, type ListItem } from './SuggestionList'
import { useAnchoredPanel, useOutsidePointer } from './useAnchoredPanel'

export type ComboOption = {
  value: string
  label: string
  description?: string
  /** Extra search terms: abbreviations, teams, skills, … */
  keywords?: string[]
  leading?: ReactNode
  meta?: ReactNode
  disabled?: boolean
}

export type ComboEmptyAction = { label: string; onSelect: () => void; disabled?: boolean }

type SearchableComboboxProps = {
  id: string
  value: string | null
  options: ComboOption[]
  onChange: (value: string | null) => void
  placeholder: string
  icon?: LucideIcon
  ariaLabel?: string
  error?: boolean
  describedBy?: string
  disabled?: boolean
  loading?: boolean
  emptyMessage: string
  emptyAction?: ComboEmptyAction
  /** e.g. (n) => `${n} locations found` — announced to screen readers */
  resultsLabel: (count: number) => string
  clearLabel?: string
}

const ROW = 52
const ACTION_KEY = '__action__'

/**
 * Case-insensitive, partial-word search over label, description and keywords.
 * Every typed word must appear somewhere; label prefix matches rank first.
 */
export function searchOptions(options: ComboOption[], query: string): ComboOption[] {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (!tokens.length) return options
  const scored: { o: ComboOption; score: number; i: number }[] = []
  options.forEach((o, i) => {
    const label = o.label.toLowerCase()
    const keywords = (o.keywords ?? []).map((k) => k.toLowerCase())
    const hay = [label, o.description?.toLowerCase() ?? '', ...keywords].join(' ')
    if (!tokens.every((t) => hay.includes(t))) return
    const q = tokens.join(' ')
    const score = label.startsWith(q) || keywords.some((k) => k === q) ? 0
      : label.split(/[\s/–-]+/).some((w) => w.startsWith(tokens[0])) || keywords.some((k) => k.startsWith(tokens[0])) ? 1
      : 2
    scored.push({ o, score, i })
  })
  return scored.sort((a, b) => a.score - b.score || a.i - b.i).map((s) => s.o)
}

/**
 * When the typed text matched an abbreviation or keyword rather than the name
 * (e.g. "cics"), show that keyword after the description so the match is visible.
 */
function describeMatch(o: ComboOption, query: string): string | undefined {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (!tokens.length) return o.description
  const inText = (s?: string) => !!s && tokens.some((t) => s.toLowerCase().includes(t))
  if (inText(o.label) || inText(o.description)) return o.description
  const keyword = o.keywords?.find((k) => inText(k))
  return keyword ? [o.description, keyword].filter(Boolean).join(' · ') : o.description
}

/**
 * Autocomplete field: type to filter, choose with mouse, touch or keyboard
 * (Arrow keys, Enter, Escape). Implements the ARIA combobox + listbox pattern.
 */
export function SearchableCombobox({
  id, value, options, onChange, placeholder, icon: Icon, ariaLabel, error = false, describedBy, disabled = false, loading = false,
  emptyMessage, emptyAction, resultsLabel, clearLabel = 'Clear selection',
}: SearchableComboboxProps) {
  const listId = `${id}-listbox`
  const liveId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [typing, setTyping] = useState(false)
  const [active, setActive] = useState(-1)
  const { style, container } = useAnchoredPanel(wrapRef, open, ROW * 6 + 8)

  const selected = options.find((o) => o.value === value) ?? null
  const results = useMemo(() => (typing ? searchOptions(options, query) : options), [typing, options, query])
  const showAction = !loading && results.length === 0 && !!emptyAction
  const items: ListItem[] = showAction && emptyAction
    ? [{ key: ACTION_KEY, label: emptyAction.label, action: true, disabled: emptyAction.disabled }]
    : results.map((o) => ({ key: o.value, label: o.label, description: describeMatch(o, typing ? query : ''), leading: o.leading, meta: o.meta, disabled: o.disabled }))

  const close = useCallback(() => { setOpen(false); setTyping(false) }, [])
  const refs = useMemo(() => [wrapRef, panelRef], [])
  useOutsidePointer(refs, open, close)

  const firstEnabled = (list: ListItem[]) => list.findIndex((i) => !i.disabled)

  const pick = (index: number) => {
    const item = items[index]
    if (!item || item.disabled) return
    if (item.key === ACTION_KEY) emptyAction?.onSelect()
    else onChange(item.key)
    close()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const move = (dir: 1 | -1) => {
      if (!open) { setOpen(true); setActive(firstEnabled(items)); return }
      if (!items.length) return
      let next = active
      for (let i = 0; i < items.length; i++) {
        next = (next + dir + items.length) % items.length
        if (!items[next].disabled) break
      }
      setActive(next)
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1) }
    else if (e.key === 'Enter') {
      if (open) {
        e.preventDefault()
        if (active >= 0) pick(active)
        else if (items.length === 1) pick(0)
      }
    } else if (e.key === 'Escape') {
      if (open) { e.preventDefault(); e.stopPropagation(); close() }
    } else if (e.key === 'Tab') close()
  }

  const inputText = typing ? query : selected?.label ?? ''

  return (
    <div ref={wrapRef} className="relative">
      {Icon && <Icon size={17} aria-hidden className="pointer-events-none absolute left-3 top-[22px] -translate-y-1/2 text-slate-400" />}
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && items[active] ? optionDomId(listId, items[active].key) : undefined}
        aria-label={ariaLabel}
        aria-invalid={error || undefined}
        aria-describedby={describedBy}
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        placeholder={placeholder}
        value={inputText}
        data-open={open || undefined}
        onFocus={(e) => {
          e.currentTarget.select()
          setActive(selected ? Math.max(0, options.indexOf(selected)) : -1)
          setOpen(true)
          // On phones, lift the field above the keyboard so suggestions stay visible.
          if (window.innerWidth < 768) {
            const el = e.currentTarget
            window.setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250)
          }
        }}
        onClick={() => setOpen(true)}
        onBlur={close}
        onChange={(e) => {
          const next = e.target.value
          setQuery(next)
          setTyping(true)
          setOpen(true)
          const matches = searchOptions(options, next)
          setActive(matches.length ? Math.max(0, matches.findIndex((o) => !o.disabled)) : emptyAction && !emptyAction.disabled ? 0 : -1)
        }}
        onKeyDown={onKeyDown}
        className={`field ${Icon ? 'pl-9' : ''} ${value || loading ? 'pr-11' : ''} ${error ? 'field-invalid' : ''}`}
      />
      {loading ? (
        <LoaderCircle size={16} aria-hidden className="absolute right-3.5 top-[22px] -translate-y-1/2 animate-spin text-slate-400" />
      ) : value && !disabled ? (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => { onChange(null); setQuery(''); setTyping(true); setOpen(true); inputRef.current?.focus() }}
          className="focusable absolute right-0 top-0 grid h-11 w-11 place-items-center rounded-r-lg text-slate-400 hover:text-slate-700"
          aria-label={clearLabel}
        >
          <X size={16} aria-hidden />
        </button>
      ) : null}
      <span id={liveId} className="sr-only" aria-live="polite">
        {open && !loading ? (results.length ? resultsLabel(results.length) : emptyMessage) : ''}
      </span>
      {open && container && createPortal(
        <SuggestionList
          listId={listId}
          items={items}
          activeIndex={active}
          selectedKey={value}
          highlight={typing ? query : undefined}
          label={ariaLabel ?? placeholder}
          style={style}
          panelRef={panelRef}
          onPick={pick}
          onHover={setActive}
          loading={loading}
          emptyMessage={results.length === 0 ? emptyMessage : undefined}
        />,
        container,
      )}
    </div>
  )
}
