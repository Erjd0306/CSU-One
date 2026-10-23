import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { CircleAlert, CircleCheck, X } from 'lucide-react'

type ToastKind = 'success' | 'error'
type Toast = { id: number; kind: ToastKind; message: string }
type ToastApi = { success: (message: string) => void; error: (message: string) => void }

const ToastContext = createContext<ToastApi | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), [])
  const push = useCallback((kind: ToastKind, message: string) => {
    const id = nextId.current++
    setToasts((prev) => [...prev.slice(-2), { id, kind, message }])
  }, [])

  const api = useRef<ToastApi>({ success: (m) => push('success', m), error: (m) => push('error', m) })

  return (
    <ToastContext.Provider value={api.current}>
      {children}
      <div aria-live="polite" aria-atomic="false" className="toast-offset pointer-events-none fixed inset-x-0 z-[70] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => <ToastItem key={t.id} toast={t} onDismiss={dismiss} />)}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), toast.kind === 'error' ? 5000 : 3200)
    return () => clearTimeout(t)
  }, [toast, onDismiss])
  const Icon = toast.kind === 'success' ? CircleCheck : CircleAlert
  return (
    <div role={toast.kind === 'error' ? 'alert' : 'status'} className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg bg-slate-900 py-3 pl-4 pr-2 text-sm text-white shadow-lg dark:bg-slate-200 dark:text-slate-900 dark:ring-1 dark:ring-slate-300">
      <Icon size={18} className={`mt-0.5 shrink-0 ${toast.kind === 'success' ? 'text-emerald-400' : 'text-rose-400'}`} aria-hidden />
      <p className="flex-1 font-medium leading-snug">{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} className="focusable -my-1 grid h-8 w-8 shrink-0 place-items-center rounded-md text-slate-300 hover:bg-white/10 hover:text-white dark:text-slate-600 dark:hover:bg-slate-300 dark:hover:text-slate-900" aria-label="Dismiss notification">
        <X size={16} />
      </button>
    </div>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
