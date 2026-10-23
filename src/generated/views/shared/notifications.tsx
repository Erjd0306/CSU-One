// GENERATED from src/pages/shared/notifications.html by scripts/templates.mjs. Do not edit: change the .html template instead.
import type { NotificationsViewProps } from '../../../pages/shared/NotificationsPage'
import { ChipGroup, EmptyState, PageHeader } from '../../../templates/components'
import { NotificationList } from '../../../pages/shared/NotificationsPage'
import { CheckCheck as Icon_CheckCheck } from 'lucide-react'

export function NotificationsView(props: NotificationsViewProps) {
  const { items, visible, view, setView, unread, markAll } = props
  return (
    <><div className="notifications-page">
<PageHeader title="Notifications" description="Updates on your reports and tasks." actions={<>
<button className="btn-secondary" type="button" disabled={!unread} onClick={markAll}>
<Icon_CheckCheck size={16} aria-hidden />Mark all as read
        </button>
</>} />
<section className="panel" aria-label="Notification list">
<div className="notifications-page__filters">
<ChipGroup label="Show" options={['All', 'Unread'] as const} value={view} onChange={setView} counts={{ All: items.length, Unread: unread }} />
</div>
{(visible.length || view === 'All') ? (<NotificationList items={visible} />) : (<EmptyState icon={Icon_CheckCheck} title="You're all caught up" message="There are no unread notifications." />)}
</section>
</div></>
  )
}
