import { useCallback, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, LoaderCircle, type LucideIcon } from 'lucide-react'
import { SuggestionList, optionDomId, type ListItem } from './SuggestionList'
import { useAnchoredPanel, useOutsidePointer } from './useAnchoredPanel'

export type SelectOption<T extends string> = {
  value: T
  label: string
  description?: string
  icon?: LucideIcon
  /** Tailwind background class for a small status dot, e.g. "bg-emerald-600" */
  dot?: string
  disabled?: boolean
}

type AppSelectProps<T extends string> = {
  value: T
  options: SelectOption<T>[]
  onChange: (value: T) => void
  /** Use with an external <label htmlFor={id}> (e.g. Field) */
  id?: string
  /** Accessible name when there is no visible label */
  ariaLabel?: string
  placeholder?: string
  /** Optional prefix shown before the selected label, e.g. "Sort:" */
  prefix?: string
  error?: boolean
  describedBy?: string
  disabled?: boolean
  loading?: boolean
  className?: string
}

const ROW = 44

function OptionLeading({ option }: { option: SelectOption<string> }): ReactNode {
  if (option.dot) return <span aria-hidden className={`mt-1.5 block h-2 w-2 rounded-full ${option.dot}`} />
  if (option.icon) { const Icon = option.icon; return <Icon size={16} aria-hidden /> }
  return null
}

/**
 * Themed replacement for <select> on short lists (status, priority, category,
 * sort, availability). Implements the ARIA "select-only combobox" pattern: focus
 * stays on the button, the active option is announced via aria-activedescendant.
 */
export function AppSelect<T extends string>({
  value, options, onChange, id, ariaLabel, placeholder = 'Select…', prefix, error = false, describedBy, disabled = false, loading = false, className = '',
}: AppSelectProps<T>) {
  const autoId = useId()
  const buttonId = id ?? `sel-${autoId}`
  const listId = `${buttonId}-listbox`
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const typeahead = useRef({ text: '', at: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const { style, container } = useAnchoredPanel(buttonRef, open, ROW * 6 + 8)

  const selectedIndex = options.findIndex((o) => o.value === value)
  const selected = options[selectedIndex]
  const close = useCallback(() => setOpen(false), [])
  const refs = useMemo(() => [buttonRef, panelRef], [])
  useOutsidePointer(refs, open, close)

  const enabled = (i: number) => i >= 0 && i < options.length && !options[i].disabled
  const step = (from: number, dir: 1 | -1) => {
    for (let i = 1; i <= options.length; i++) {
      const next = (from + dir * i + options.length) % options.length
      if (enabled(next)) return next
    }
    return from
  }

  const openList = () => {
    setActive(enabled(selectedIndex) ? selectedIndex : step(-1, 1))
    setOpen(true)
  }
  const pick = (index: number) => {
    if (!enabled(index)) return
    onChange(options[index].value)
    setOpen(false)
    buttonRef.current?.focus()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!open) openList(); else setActive((a) => step(a, 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        if (!open) openList(); else setActive((a) => step(a, -1))
        break
      case 'Home':
        if (open) { e.preventDefault(); setActive(step(-1, 1)) }
        break
      case 'End':
        if (open) { e.preventDefault(); setActive(step(options.length, -1)) }
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (open) pick(active); else openList()
        break
      case 'Escape':
        if (open) { e.preventDefault(); e.stopPropagation(); setOpen(false) }
        break
      case 'Tab':
        setOpen(false)
        break
      default:
        // Type-ahead: jump to the first option starting with the typed letters.
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const now = Date.now()
          const t = typeahead.current
          t.text = now - t.at > 600 ? e.key.toLowerCase() : t.text + e.key.toLowerCase()
          t.at = now
          const hit = options.findIndex((o, i) => enabled(i) && o.label.toLowerCase().startsWith(t.text))
          if (hit >= 0) { if (!open) setOpen(true); setActive(hit) }
        }
    }
  }

  const items: ListItem[] = options.map((o) => ({
    key: o.value,
    label: o.label,
    description: o.description,
    disabled: o.disabled,
    leading: o.dot || o.icon ? <OptionLeading option={o} /> : undefined,
  }))

  return (
    <>
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && options[active] ? optionDomId(listId, options[active].value) : undefined}
        aria-label={ariaLabel}
        aria-invalid={error || undefined}
        aria-describedby={describedBy}
        disabled={disabled || loading}
        data-open={open || undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={`field select-field ${error ? 'field-invalid' : ''} ${className}`}
      >
        {selected && (selected.dot || selected.icon) && <span className="shrink-0 text-slate-500"><OptionLeading option={selected} /></span>}
        <span className={`min-w-0 flex-1 truncate text-left ${selected ? 'text-slate-800' : 'text-slate-400'}`}>
          {loading ? 'Loading options…' : selected ? <>{prefix && <span className="text-slate-500">{prefix} </span>}{selected.label}</> : placeholder}
        </span>
        {loading
          ? <LoaderCircle size={16} className="shrink-0 animate-spin text-slate-400" aria-hidden />
          : <ChevronDown size={16} aria-hidden className={`shrink-0 text-slate-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />}
      </button>
      {open && container && createPortal(
        <SuggestionList
          listId={listId}
          items={items}
          activeIndex={active}
          selectedKey={value}
          label={ariaLabel ?? 'Options'}
          style={style}
          panelRef={panelRef}
          onPick={pick}
          onHover={setActive}
        />,
        container,
      )}
    </>
  )
}
