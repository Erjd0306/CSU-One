// GENERATED from src/pages/shared/profile-password.html by scripts/templates.mjs. Do not edit: change the .html template instead.
import type { ChangePasswordViewProps } from '../../../pages/shared/ProfilePage'
import { PasswordField, PrimaryButton } from '../../../templates/components'
import { KeyRound as Icon_KeyRound } from 'lucide-react'

export function ChangePasswordView(props: ChangePasswordViewProps) {
  const { current, next, confirm, errors, saving, setField, submit } = props
  return (
    <><form className="profile-password" onSubmit={submit} noValidate>
<PasswordField id="pw-current" label="Current password" value={current} onChange={(e) => setField('current', e.target.value)} error={errors.current} autoComplete="current-password" disabled={saving} />
<div className="profile-password__pair">
<PasswordField id="pw-next" label="New password" value={next} onChange={(e) => setField('next', e.target.value)} error={errors.next} hint="At least 8 characters, letters and numbers." autoComplete="new-password" disabled={saving} />
<PasswordField id="pw-confirm" label="Confirm new password" value={confirm} onChange={(e) => setField('confirm', e.target.value)} error={errors.confirm} autoComplete="new-password" disabled={saving} />
</div>
<div className="profile-password__actions">
<PrimaryButton type="submit" icon={Icon_KeyRound} loading={saving} loadingText="Updating…" disabled={!current || !next || !confirm}>Update password</PrimaryButton>
</div>
</form></>
  )
}
