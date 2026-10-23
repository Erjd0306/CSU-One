import type { ReactNode } from 'react'
import { useProfileActions, type ProfileAction } from '../../components/layout/ProfileMenu'
import { ROLE_LABEL } from '../../components/layout/navConfig'
import { AdminMoreView } from '../../generated/views/admin/admin-more'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { useMyNotifications, useUser } from '../../state/AppStore'
import type { UserAccount } from '../../types'
import './admin-more.css'

export type AdminMoreViewProps = {
  user: UserAccount
  roleLabel: string
  unread: number
  run: (action: ProfileAction) => void
  dialogs: ReactNode
}

/** Administrator's mobile "More" tab. Markup: admin-more.html, styles: admin-more.css. */
export function AdminMore() {
  useDocumentTitle('More')
  const user = useUser()
  const { run, dialogs } = useProfileActions()
  const unread = useMyNotifications().filter((n) => !n.read).length
  return <AdminMoreView user={user} roleLabel={ROLE_LABEL[user.role]} unread={unread} run={run} dialogs={dialogs} />
}
