import { useMemo, useState } from 'react'
import { ClipboardList, CirclePlus, MapPin, Sparkles, type LucideIcon } from 'lucide-react'
import { StudentHomeView } from '../../generated/views/student/student-home'
import { StudentTutorialView } from '../../generated/views/student/student-tutorial'
import { navigate } from '../../lib/router'
import { STORAGE_KEYS, readJSON, writeJSON } from '../../lib/storage'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { useMyNotifications, useStore, useUser } from '../../state/AppStore'
import type { StatItem } from '../../components/ui/Page'
import type { AppNotification, Report } from '../../types'
import './student-home.css'
import './student-tutorial.css'

export type StudentHomeViewProps = {
  firstName: string
  stats: StatItem[]
  recent: Report[]
  updates: AppNotification[]
  mine: Report[]
  openReport: (report: Report) => void
  tutorial: boolean
  openTutorial: () => void
  closeTutorial: () => void
}

/** Student Home. Markup: student-home.html, styles: student-home.css. */
export function StudentHome() {
  useDocumentTitle('Home')
  const user = useUser()
  const { reports } = useStore()
  const notifications = useMyNotifications()
  const mine = useMemo(() => reports.filter((r) => r.reporterId === user.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [reports, user.id])
  const count = (...s: string[]) => mine.filter((r) => s.includes(r.status)).length
  // Shown automatically once per student; "How it works" replays it.
  const [tutorial, setTutorial] = useState(() => !readJSON<string[]>(STORAGE_KEYS.tutorialSeen, []).includes(user.id))

  const closeTutorial = () => {
    const seen = readJSON<string[]>(STORAGE_KEYS.tutorialSeen, [])
    if (!seen.includes(user.id)) writeJSON(STORAGE_KEYS.tutorialSeen, [...seen, user.id])
    setTutorial(false)
  }

  return (
    <StudentHomeView
      firstName={user.name.split(' ')[0]}
      stats={[
        { label: 'Open', value: count('Open', 'Assigned'), note: 'Waiting for repair', tone: 'danger' },
        { label: 'In progress', value: count('In Progress'), note: 'Being fixed', tone: 'warning' },
        { label: 'Resolved', value: count('Resolved'), note: 'Fixed and closed', tone: 'success' },
      ]}
      recent={mine.slice(0, 3)}
      updates={notifications.slice(0, 3)}
      mine={mine}
      openReport={(r) => navigate(`/student/reports/${r.id}`)}
      tutorial={tutorial}
      openTutorial={() => setTutorial(true)}
      closeTutorial={closeTutorial}
    />
  )
}

type TutorialStep = { title: string; text: string; cue: string; icon: LucideIcon }

const TUTORIAL_STEPS: TutorialStep[] = [
  { title: 'Welcome to CSU-One', text: 'Spot something broken on campus? Here’s how to report it and follow the repair.', cue: 'Takes less than a minute', icon: Sparkles },
  { title: 'Report an issue', text: 'Tap Report, choose what’s wrong, and give it a short title.', cue: 'The Report button', icon: CirclePlus },
  { title: 'Pin the location', text: 'Tap the spot on the campus map. Zoom in to see building names, then add a photo if you can.', cue: 'Campus map with building labels', icon: MapPin },
  { title: 'Check the status', text: 'My Reports shows each step: Open, Assigned, In Progress, Resolved. Alerts tell you when it changes.', cue: 'My Reports and Alerts', icon: ClipboardList },
]

export type StudentTutorialViewProps = {
  step: TutorialStep
  steps: TutorialStep[]
  index: number
  next: () => void
  back: () => void
  skip: () => void
}

/** Short walkthrough for students. Markup: student-tutorial.html, styles: student-tutorial.css. */
export function StudentTutorial({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0)
  const last = index === TUTORIAL_STEPS.length - 1
  return (
    <StudentTutorialView
      step={TUTORIAL_STEPS[index]}
      steps={TUTORIAL_STEPS}
      index={index}
      next={() => (last ? onClose() : setIndex(index + 1))}
      back={() => setIndex(Math.max(0, index - 1))}
      skip={onClose}
    />
  )
}
