import { useState } from 'react'
import { RepairActionsView } from '../../generated/views/maintenance/repair-actions'
import { useStore } from '../../state/AppStore'
import { useToast } from '../../state/Toast'
import type { Report } from '../../types'
import './repair-actions.css'

type RepairActionsProps = {
  report: Report
  /** Lets the resolve confirmation offer "Add photo" (Task Detail only) */
  onAddPhoto?: () => void
}

export type RepairActionsViewProps = {
  step: 'accept' | 'start' | 'resolve' | 'done'
  accept: () => void
  start: () => void
  openResolve: () => void
  resolving: boolean
  closeResolve: () => void
  confirmResolve: () => void
  note: string
  setNote: (v: string) => void
  showPhotoPrompt: boolean
  addPhoto: () => void
}

/**
 * The single next step in the repair workflow: Accept task, then Start repair, then Mark as resolved.
 * Used by the Tasks page ("Current task") and Task Detail. Markup: repair-actions.html, styles: repair-actions.css.
 */
export function RepairActions({ report, onAddPhoto }: RepairActionsProps) {
  const { acceptTask, startRepair, resolveReport } = useStore()
  const toast = useToast()
  const [resolving, setResolving] = useState(false)
  const [note, setNote] = useState('')

  const run = (result: { ok: boolean; error?: string }, success: string) => {
    if (result.ok) toast.success(success)
    else toast.error(result.error ?? 'Something went wrong')
  }

  const step: RepairActionsViewProps['step'] = report.status === 'Assigned' && !report.accepted ? 'accept'
    : report.status === 'Assigned' ? 'start'
    : report.status === 'In Progress' ? 'resolve'
    : 'done'

  const closeResolve = () => { setResolving(false); setNote('') }

  return (
    <RepairActionsView
      step={step}
      accept={() => run(acceptTask(report.id), 'Task accepted')}
      start={() => run(startRepair(report.id), 'Repair started. The student has been notified.')}
      openResolve={() => setResolving(true)}
      resolving={resolving}
      closeResolve={closeResolve}
      confirmResolve={() => {
        const res = resolveReport(report.id, note)
        if (!res.ok) { toast.error(res.error); return }
        toast.success(`${report.id} resolved. The student has been notified.`)
        closeResolve()
      }}
      note={note}
      setNote={setNote}
      showPhotoPrompt={!report.completionPhoto && !!onAddPhoto}
      addPhoto={() => { closeResolve(); onAddPhoto?.() }}
    />
  )
}
