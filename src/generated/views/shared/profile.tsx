// GENERATED from src/pages/shared/profile.html by scripts/templates.mjs. Do not edit: change the .html template instead.
import type { ProfileViewProps } from '../../../pages/shared/ProfilePage'
import { Avatar, ConfirmDialog, LogoutButton, PageHeader, ProfileAccordion, ProfileAccordionSection, Toggle } from '../../../templates/components'
import { ChangePassword } from '../../../pages/shared/ProfilePage'
import { Bell as Icon_Bell, IdCard as Icon_IdCard, RotateCcw as Icon_RotateCcw, ShieldCheck as Icon_ShieldCheck, UserRound as Icon_UserRound } from 'lucide-react'

export function ProfileView(props: ProfileViewProps) {
  const { user, roleLabel, personalRows, accountRows, isOpen, toggle, prefs, togglePref, statusLabel, assignPref, resetOpen, openReset, closeReset, confirmReset } = props
  return (
    <><div className="profile-page">
<PageHeader title="Profile" />
<div className="profile-page__identity">
<Avatar initials={user.initials} size="lg" />
<div className="profile-page__identity-text">
<p className="profile-page__name">{user.name}</p>
<p className="profile-page__role">{roleLabel}</p>
</div>
</div>
<ProfileAccordion>
<ProfileAccordionSection id="personal" title="Personal Information" summary={`${user.name} · ${user.email}`} icon={Icon_UserRound} open={isOpen('personal')} onToggle={toggle}>
<dl className="profile-page__rows">
{(personalRows).map((row) => (<div className="profile-page__row" key={row.label}>
<dt>{row.label}</dt>
<dd>{row.value}</dd>
</div>))}
</dl>
<p className="profile-page__note">To correct your details, contact the Registrar or the Human Resource Office.</p>
</ProfileAccordionSection>
<ProfileAccordionSection id="account" title="Account Information" summary={`${roleLabel} · ${user.idNumber}`} icon={Icon_IdCard} open={isOpen('account')} onToggle={toggle}>
<div className="profile-page__account">
<dl className="profile-page__rows">
{(accountRows).map((row) => (<div className="profile-page__row" key={row.label}>
<dt>{row.label}</dt>
<dd>{row.value}</dd>
</div>))}
</dl>
<div className="profile-page__reset">
<p className="profile-page__reset-text">Your reports and settings are saved in this browser only. Reset to clear them.</p>
<button className="btn-secondary profile-page__reset-button" type="button" onClick={openReset}><Icon_RotateCcw size={16} aria-hidden />Reset data</button>
</div>
</div>
</ProfileAccordionSection>
<ProfileAccordionSection id="notifications" title="Notifications" summary={`${prefs.statusUpdates ? 'Status updates on' : 'Status updates off'}`} icon={Icon_Bell} open={isOpen('notifications')} onToggle={toggle}>
<div className="profile-page__toggles">
<Toggle id="pref-status" label={statusLabel.title} description={statusLabel.desc} checked={prefs.statusUpdates} onChange={(v) => togglePref('statusUpdates', v)} />
{(assignPref) && (<Toggle id="pref-assign" label={assignPref.title} description={assignPref.desc} checked={prefs.assignments} onChange={(v) => togglePref('assignments', v)} />)}<Toggle id="pref-email" label="Email copies" description="Not sent yet in this prototype." checked={prefs.email} onChange={(v) => togglePref('email', v)} />
<Toggle id="pref-sms" label="SMS alerts for urgent items" description="Not sent yet in this prototype." checked={prefs.sms} onChange={(v) => togglePref('sms', v)} />
</div>
</ProfileAccordionSection>
<ProfileAccordionSection id="security" title="Security" summary="Change your password" icon={Icon_ShieldCheck} open={isOpen('security')} onToggle={toggle}>
<ChangePassword />
</ProfileAccordionSection>
</ProfileAccordion>
<div className="profile-page__logout">
<div>
<h2 className="profile-page__logout-title">Log out</h2>
<p className="profile-page__logout-text">End your session on this device.</p>
</div>
<LogoutButton className="btn-danger profile-page__logout-button" />
</div>
{(resetOpen) && (<ConfirmDialog title="Reset all data?" message="This deletes every report, notification, and new account saved in this browser. You will be logged out." confirmLabel="Reset data" tone="danger" onCancel={closeReset} onConfirm={confirmReset} />)}</div></>
  )
}
