import { useState } from 'react'
import { StudentReportDetailView } from '../../generated/views/student/student-report-detail'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { useStore, useUser } from '../../state/AppStore'
import { useToast } from '../../state/Toast'
import type { Report } from '../../types'
import './student-report-detail.css'

export type StudentReportDetailViewProps = {
  report: Report | undefined
  showInfoRequest: boolean
  reply: string
  setReply: (v: string) => void
  error: string
  sending: boolean
  sendReply: () => void
}

/** Student report detail. Markup: student-report-detail.html, styles: student-report-detail.css. */
export function StudentReportDetail({ id }: { id: string }) {
  const user = useUser()
  const { reports, provideInfo } = useStore()
  const toast = useToast()
  const report = reports.find((r) => r.id === id && r.reporterId === user.id)
  useDocumentTitle(report ? `${report.id} · ${report.title}` : 'Report not found')
  const [reply, setReply] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const sendReply = () => {
    if (!report) return
    if (reply.trim().length < 3) { setError('Write a short response first.'); return }
    setSending(true)
    window.setTimeout(() => {
      const res = provideInfo(report.id, reply)
      setSending(false)
      if (!res.ok) { toast.error(res.error); return }
      setReply('')
      setError('')
      toast.success('Your response was sent to the Facilities Office')
    }, 400)
  }

  return (
    <StudentReportDetailView
      report={report}
      showInfoRequest={!!report?.pendingInfoRequest && report.status !== 'Resolved'}
      reply={reply}
      setReply={(v) => { setReply(v); setError('') }}
      error={error}
      sending={sending}
      sendReply={sendReply}
    />
  )
}
