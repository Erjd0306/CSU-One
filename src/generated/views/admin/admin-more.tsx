// GENERATED from src/pages/admin/admin-more.html by scripts/templates.mjs. Do not edit: change the .html template instead.
import type { AdminMoreViewProps } from '../../../pages/admin/AdminMore'
import { Avatar, Link, PageHeader, ProfileMenuItems } from '../../../templates/components'
import { BarChart3 as Icon_BarChart3, Bell as Icon_Bell, ChevronRight as Icon_ChevronRight } from 'lucide-react'

export function AdminMoreView(props: AdminMoreViewProps) {
  const { user, roleLabel, unread, run, dialogs } = props
  return (
    <><div className="admin-more">
<PageHeader title="More" />
<nav className="panel" aria-label="More pages">
<ul className="admin-more__list">
<li>
<Link className="admin-more__link focusable" to="/admin/analytics">
<Icon_BarChart3 className="admin-more__icon" size={18} aria-hidden />
<span className="admin-more__label">Analytics</span>
<Icon_ChevronRight className="admin-more__chevron" size={16} aria-hidden />
</Link>
</li>
<li>
<Link className="admin-more__link focusable" to="/admin/notifications">
<Icon_Bell className="admin-more__icon" size={18} aria-hidden />
<span className="admin-more__label">Notifications</span>
{(unread) && (<span className="admin-more__badge">{unread}<span className="sr-only"> unread</span></span>)}<Icon_ChevronRight className="admin-more__chevron" size={16} aria-hidden />
</Link>
</li>
</ul>
</nav>
<section className="panel admin-more__account" aria-labelledby="account-menu">
<div className="admin-more__identity">
<Avatar initials={user.initials} size="sm" />
<div className="admin-more__identity-text">
<h2 className="admin-more__name" id="account-menu">{user.name}</h2>
<p className="admin-more__role">{roleLabel}</p>
</div>
</div>
<ProfileMenuItems onSelect={run} />
</section>
    {dialogs}
  </div></>
  )
}
