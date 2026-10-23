import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { LoaderCircle, X } from 'lucide-react'

type ModalVariant = 'dialog' | 'drawer' | 'sheet' | 'alert'

type ModalProps = {
  title: string
  description?: string
  onClose: () => void
  children?: ReactNode
  footer?: ReactNode
  /**
   * dialog: full-screen on phones, centered from `sm`.
   * drawer: full-screen on phones, right-hand panel from `sm`.
   * sheet: compact bottom sheet on phones, small centered dialog from `sm`.
   * alert: small dialog centered on every screen size (confirmations).
   * Defaults to `sheet` for size "sm", otherwise `dialog`.
   */
  variant?: ModalVariant
  size?: 'sm' | 'md' | 'lg'
  /** compact: title, message and actions in one padded block (confirmations) */
  layout?: 'standard' | 'compact'
}

const ModalCloseContext = createContext<() => void>(() => {})

/** Closes the nearest modal with its exit animation. */
export const useModalClose = () => useContext(ModalCloseContext)

const EXIT_MS = 150

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Native modal dialogs keep the page inert but let Tab leave for the browser UI.
 * Wrap focus between the first and last focusable controls instead.
 */
function trapTab(e: KeyboardEvent, dialog: HTMLDialogElement) {
  const items = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement)
  if (!items.length) return
  const first = items[0]
  const last = items[items.length - 1]
  if (e.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

/**
 * Accessible modal built on the native <dialog> element: focus moves inside and
 * is trapped, the page behind becomes inert and stops scrolling, Escape and a
 * backdrop click close it, and focus returns to the trigger afterwards.
 * Render it conditionally.
 */
export function Modal({ title, description, onClose, children, footer, variant, size = 'md', layout = 'standard' }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descId = useId()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const closingRef = useRef(false)
  const exitTimer = useRef<number | undefined>(undefined)
  const [closing, setClosing] = useState(false)
  const resolved: ModalVariant = variant ?? (size === 'sm' ? 'sheet' : 'dialog')

  const requestClose = useCallback(() => {
    if (closingRef.current) return
    closingRef.current = true
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onCloseRef.current()
      return
    }
    setClosing(true)
    exitTimer.current = window.setTimeout(() => onCloseRef.current(), EXIT_MS)
  }, [])

  useEffect(() => {
    const dialog = ref.current
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    if (dialog && !dialog.open) dialog.showModal()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      // If the modal is removed mid-exit (e.g. the user navigated away), never run a stale onClose.
      window.clearTimeout(exitTimer.current)
      dialog?.close()
      document.body.style.overflow = prevOverflow
      if (previouslyFocused?.isConnected) previouslyFocused.focus()
    }
  }, [])

  const widths = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' }
  const placement: Record<ModalVariant, string> = {
    dialog: `inset-0 h-full max-h-none w-full max-w-none sm:m-auto sm:h-fit sm:max-h-[88dvh] sm:rounded-lg sm:border ${widths[size]}`,
    drawer: 'inset-0 h-full max-h-none w-full max-w-none sm:ml-auto sm:mr-0 sm:max-w-xl sm:border-l',
    sheet: `inset-x-0 bottom-0 top-auto h-auto max-h-[90dvh] w-full max-w-none rounded-t-xl border-t sm:inset-0 sm:m-auto sm:h-fit sm:max-h-[85dvh] sm:rounded-lg sm:border ${size === 'sm' ? 'sm:max-w-sm' : widths[size]}`,
    alert: 'inset-0 m-auto h-fit max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-[380px] rounded-xl border',
  }

  // Portal to <body> so parent spacing utilities (e.g. space-y-*) never offset the dialog.
  return createPortal(
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      data-variant={resolved}
      data-closing={closing || undefined}
      onCancel={(e) => { e.preventDefault(); requestClose() }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) requestClose() }}
      onKeyDown={(e) => { if (e.key === 'Tab') trapTab(e.nativeEvent, e.currentTarget) }}
      className={`csu-modal fixed m-0 overflow-hidden border-slate-200 bg-white p-0 text-slate-800 ${placement[resolved]}`}
    >
      <ModalCloseContext.Provider value={requestClose}>
        {layout === 'compact' ? (
          <div className={`max-h-[inherit] overflow-y-auto ${resolved === 'alert' ? 'p-5' : 'sheet-pad px-5 pt-5 sm:px-6 sm:pt-6'}`}>
            <h2 id={titleId} className="text-lg font-semibold text-slate-900">{title}</h2>
            {description && <p id={descId} className="mt-1.5 text-sm leading-relaxed text-slate-600">{description}</p>}
            {children && <div className="mt-4">{children}</div>}
            {footer && <div className="mt-6">{footer}</div>}
          </div>
        ) : (
          <div className="flex h-full max-h-[inherit] flex-col">
            <header className="csu-modal__header flex shrink-0 items-start justify-between gap-3 border-b px-4 py-3 sm:px-5">
              <div className="min-w-0 pt-1.5">
                <h2 id={titleId} className="text-base font-semibold text-slate-900">{title}</h2>
                {description && <p id={descId} className="mt-0.5 text-sm text-slate-500">{description}</p>}
              </div>
              <button type="button" onClick={requestClose} className="icon-btn -mr-2" aria-label="Close">
                <X size={20} />
              </button>
            </header>
            <div className={`min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 ${footer ? '' : 'csu-modal__body-last'}`}>{children}</div>
            {footer && <footer className="sheet-footer shrink-0 border-t bg-white px-4 pt-3 sm:px-5">{footer}</footer>}
          </div>
        )}
      </ModalCloseContext.Provider>
    </dialog>,
    document.body,
  )
}

/** Neutral button that closes the surrounding modal (with its exit animation). */
export function ModalCancelButton({ label = 'Cancel', autoFocus = false }: { label?: string; autoFocus?: boolean }) {
  const close = useModalClose()
  return <button type="button" className="btn-secondary" onClick={close} autoFocus={autoFocus}>{label}</button>
}

type ConfirmProps = {
  title: string
  message: string
  confirmLabel: string
  tone?: 'danger' | 'primary'
  onConfirm: () => void
  onCancel: () => void
  confirmDisabled?: boolean
  loading?: boolean
  children?: ReactNode
}

/** Small confirmation, centered on every screen size with a dimmed page behind it. */
export function ConfirmDialog({ title, message, confirmLabel, tone = 'primary', onConfirm, onCancel, confirmDisabled, loading, children }: ConfirmProps) {
  return (
    <Modal
      title={title}
      description={message}
      onClose={onCancel}
      size="sm"
      variant="alert"
      layout="compact"
      footer={
        <div className="grid grid-cols-2 gap-3">
          <ModalCancelButton autoFocus />
          <button type="button" className={tone === 'danger' ? 'btn-danger-solid' : 'btn-primary'} onClick={onConfirm} disabled={confirmDisabled || loading}>
            {loading && <LoaderCircle size={16} className="animate-spin" aria-hidden />}
            {confirmLabel}
          </button>
        </div>
      }
    >
      {children}
    </Modal>
  )
}
