import { useState } from 'react'
import { describedBy } from '../../components/ui/Form'
import { AdminReportDrawerView } from '../../generated/views/admin/admin-report-drawer'
import { useStore } from '../../state/AppStore'
import { useToast } from '../../state/Toast'
import type { Report } from '../../types'
import './admin-report-drawer.css'

type Action = 'info' | 'resolve' | 'reopen'
type ActionCopy = { title: string; message: string; label: string; field: string; required: boolean }

export type AdminReportDrawerViewProps = {
  reportId: string
  report: Report | undefined
  onClose: () => void
  copy: ActionCopy | null
  openAction: (a: Action) => void
  closeAction: () => void
  runAction: () => void
  actionText: string
  setActionText: (v: string) => void
  confirmDisabled: boolean
  actionTone: 'danger' | 'primary'
  note: string
  setNote: (v: string) => void
  noteError: string
  saveNote: () => void
  describe: typeof describedBy
}

/** Administrator view of one report. Markup: admin-report-drawer.html, styles: admin-report-drawer.css. */
export function ReportDrawer({ reportId, onClose }: { reportId: string; onClose: () => void }) {
  const { reports, addInternalNote, requestInfo, resolveReport, reopenReport } = useStore()
  const toast = useToast()
  const report = reports.find((r) => r.id === reportId)
  const [action, setAction] = useState<Action | null>(null)
  const [actionText, setActionText] = useState('')
  const [note, setNote] = useState('')
  const [noteError, setNoteError] = useState('')

  const saveNote = () => {
    if (!report) return
    const res = addInternalNote(report.id, note)
    if (!res.ok) { setNoteError(res.error); return }
    setNote('')
    setNoteError('')
    toast.success('Internal note added')
  }

  const runAction = () => {
    if (!report || !action) return
    const res = action === 'info' ? requestInfo(report.id, actionText)
      : action === 'resolve' ? resolveReport(report.id, actionText)
      : reopenReport(report.id, actionText)
    if (!res.ok) { toast.error(res.error); return }
    toast.success(action === 'info' ? 'Information request sent to the student' : action === 'resolve' ? `${report.id} marked as resolved` : `${report.id} reopened`)
    setAction(null)
    setActionText('')
  }

  const actionCopy: Record<Action, ActionCopy> = {
    info: { title: 'Request more information', message: `Ask ${report?.reporterName ?? 'the student'} for details that will help the maintenance team.`, label: 'Send request', field: 'What do you need to know?', required: true },
    resolve: { title: 'Resolve this report?', message: 'Use this when the problem was fixed outside the normal workflow or is a duplicate. The student will be notified.', label: 'Mark as resolved', field: 'Resolution note (optional)', required: false },
    reopen: { title: 'Reopen this report?', message: 'The report returns to Open and must be assigned again. The student will be notified.', label: 'Reopen report', field: 'Reason for reopening', required: true },
  }
  const copy = action ? actionCopy[action] : null

  return (
    <AdminReportDrawerView
      reportId={reportId}
      report={report}
      onClose={onClose}
      copy={copy}
      openAction={setAction}
      closeAction={() => { setAction(null); setActionText('') }}
      runAction={runAction}
      actionText={actionText}
      setActionText={setActionText}
      confirmDisabled={!!copy?.required && actionText.trim().length < 3}
      actionTone={action === 'reopen' ? 'danger' : 'primary'}
      note={note}
      setNote={(v) => { setNote(v); setNoteError('') }}
      noteError={noteError}
      saveNote={saveNote}
      describe={describedBy}
    />
  )
}
