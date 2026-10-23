import { useState } from 'react'
import { describedBy } from '../../components/ui/Form'
import { MaintenanceTaskDetailView } from '../../generated/views/maintenance/maintenance-task-detail'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { useStore, useUser } from '../../state/AppStore'
import { useToast } from '../../state/Toast'
import type { Report } from '../../types'
import './maintenance-task-detail.css'

type Dialog = 'note' | 'materials' | 'photo' | null
type TextCopy = { title: string; label: string; hint: string; button: string; done: string; placeholder: string }

const TEXT_COPY: Record<'note' | 'materials', TextCopy> = {
  note: { title: 'Add a progress note', label: 'Progress note', hint: 'Visible to administrators and in the report timeline.', button: 'Add note', done: 'Progress note added', placeholder: 'e.g. Replaced the ballast' },
  materials: { title: 'Additional materials needed', label: 'Materials and quantities', hint: 'The Facilities Office will be notified.', button: 'Send request', done: 'Materials request sent to the Facilities Office', placeholder: 'e.g. 2 pcs 40W LED tube' },
}

export type MaintenanceTaskDetailViewProps = {
  report: Report | undefined
  backTo: string
  backLabel: string
  canWork: boolean
  dialog: Dialog
  openDialog: (d: Exclude<Dialog, null>) => void
  closeDialog: () => void
  textCopy: TextCopy | null
  text: string
  setText: (v: string) => void
  textError: string
  saveText: () => void
  photo: string | undefined
  setPhoto: (v: string | undefined) => void
  savePhoto: () => void
  photoChanged: boolean
  describe: typeof describedBy
}

/** Maintenance task detail. Markup: maintenance-task-detail.html, styles: maintenance-task-detail.css. */
export function TaskDetail({ id }: { id: string }) {
  const user = useUser()
  const { reports, addProgressNote, reportMaterials, setCompletionPhoto } = useStore()
  const toast = useToast()
  const report = reports.find((r) => r.id === id && r.assigneeId === user.id)
  useDocumentTitle(report ? `${report.id} · ${report.title}` : 'Task not found')
  const [dialog, setDialog] = useState<Dialog>(null)
  const [text, setText] = useState('')
  const [textError, setTextError] = useState('')
  const [photo, setPhoto] = useState<string | undefined>(undefined)

  const openDialog = (d: Exclude<Dialog, null>) => {
    setDialog(d)
    setTextError('')
    setText(d === 'materials' ? report?.materialsNeeded ?? '' : '')
    setPhoto(report?.completionPhoto)
  }

  const saveText = () => {
    if (!report || (dialog !== 'note' && dialog !== 'materials')) return
    const res = dialog === 'note' ? addProgressNote(report.id, text) : reportMaterials(report.id, text)
    if (!res.ok) { setTextError(res.error); return }
    toast.success(TEXT_COPY[dialog].done)
    setDialog(null)
  }

  const savePhoto = () => {
    if (!report || !photo) return
    const res = setCompletionPhoto(report.id, photo)
    if (!res.ok) { toast.error(res.error); return }
    toast.success('Completion photo saved')
    setDialog(null)
  }

  const resolved = report?.status === 'Resolved'

  return (
    <MaintenanceTaskDetailView
      report={report}
      backTo={resolved ? '/maintenance/history' : '/maintenance'}
      backLabel={resolved ? 'Work history' : 'Assigned tasks'}
      canWork={report?.status === 'Assigned' || report?.status === 'In Progress'}
      dialog={dialog}
      openDialog={openDialog}
      closeDialog={() => setDialog(null)}
      textCopy={dialog === 'note' || dialog === 'materials' ? TEXT_COPY[dialog] : null}
      text={text}
      setText={(v) => { setText(v); setTextError('') }}
      textError={textError}
      saveText={saveText}
      photo={photo}
      setPhoto={setPhoto}
      savePhoto={savePhoto}
      photoChanged={!!photo && photo !== report?.completionPhoto}
      describe={describedBy}
    />
  )
}
