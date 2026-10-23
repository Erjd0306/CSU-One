// GENERATED from src/pages/shared/notification-list.html by scripts/templates.mjs. Do not edit: change the .html template instead.
import type { NotificationListViewProps } from '../../../pages/shared/NotificationsPage'
import { EmptyState } from '../../../templates/components'
import { BellOff as Icon_BellOff } from 'lucide-react'

export function NotificationListView(props: NotificationListViewProps) {
  const { items, compact } = props
  return (
    <>{(items.length) ? (<ul className="notification-list">
{(items).map((item) => (<li className={`notification-list__item ${`${compact ? 'is-compact' : ''} ${item.read ? '' : 'is-unread'}`}`} key={item.id}>
<span className={`notification-list__icon notification-list__icon--${item.tone}`}><item.Icon size={15} aria-hidden /></span>
<button className="notification-list__body focusable" type="button" onClick={item.open}>
<span className="notification-list__heading">
<span className="notification-list__title">{item.title}</span>
{(!item.read) && (<span className="notification-list__dot" aria-label="Unread" />)}</span>
<span className="notification-list__message">{item.message}</span>
<span className="notification-list__time">{item.time}</span>
</button>
{(!item.read && !compact) && (<button className="btn-ghost btn-sm notification-list__mark" type="button" onClick={item.markRead} aria-label={`Mark "${item.title}" as read`}>
        Mark read
      </button>)}</li>))}
</ul>) : (<EmptyState icon={Icon_BellOff} title="No notifications" message="Updates about reports will appear here." />)}</>
  )
}
