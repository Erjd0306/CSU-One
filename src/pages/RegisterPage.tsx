import { useState, type FormEvent } from 'react'
import { AuthHeader } from '../components/auth/AuthHeader'
import { AuthLayout } from '../components/auth/AuthLayout'
import { PrimaryButton } from '../components/ui/Button'
import { PasswordField, TextField } from '../components/ui/TextField'
import { Link, navigate } from '../lib/router'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { useStore } from '../state/AppStore'
import { useToast } from '../state/Toast'

type Fields = { name: string; idNumber: string; email: string; password: string; confirm: string }
type Errors = Partial<Record<keyof Fields, string>>

const EMPTY: Fields = { name: '', idNumber: '', email: '', password: '', confirm: '' }

function validate(f: Fields): Errors {
  const e: Errors = {}
  if (f.name.trim().split(/\s+/).filter(Boolean).length < 2) e.name = 'Enter your first and last name.'
  if (!/^\d{2}-\d{5}$/.test(f.idNumber.trim())) e.idNumber = 'Use the format 23-01234.'
  if (!/^[^\s@]+@csu\.edu\.ph$/i.test(f.email.trim())) e.email = 'Use your CSU email address (name@csu.edu.ph).'
  if (f.password.length < 8 || !/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) e.password = 'Use at least 8 characters with letters and numbers.'
  if (f.confirm !== f.password) e.confirm = 'The passwords do not match.'
  return e
}

/** New-user screen. Students create their own account; staff accounts are issued by the Facilities Office. */
export function RegisterPage() {
  useDocumentTitle('Create account')
  const { register } = useStore()
  const toast = useToast()
  const [fields, setFields] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)

  const set = (key: keyof Fields, value: string) => {
    setFields((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }
  const complete = Object.values(fields).every((v) => v.trim() !== '')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const found = validate(fields)
    setErrors(found)
    const first = (Object.keys(found) as (keyof Fields)[])[0]
    if (first) { document.getElementById(`reg-${first}`)?.focus(); return }
    setLoading(true)
    window.setTimeout(() => {
      const res = register({ name: fields.name, idNumber: fields.idNumber, email: fields.email, password: fields.password })
      setLoading(false)
      if (!res.ok) {
        setErrors({ [res.field]: res.error })
        document.getElementById(`reg-${res.field}`)?.focus()
        return
      }
      toast.success(`Account created. Welcome to CSU-One, ${res.account.name.split(' ')[0]}!`)
      navigate('/student', { replace: true })
    }, 700)
  }

  return (
    <AuthLayout>
      <AuthHeader title="Welcome to CSU-One" subtitle="Create your account to start reporting and tracking campus issues." />

      <form onSubmit={submit} noValidate className="space-y-4">
        <TextField id="reg-name" label="Full name" value={fields.name} onChange={(e) => set('name', e.target.value)} error={errors.name} autoComplete="name" placeholder="Juan Dela Cruz" disabled={loading} />
        <TextField id="reg-idNumber" label="Student ID" value={fields.idNumber} onChange={(e) => set('idNumber', e.target.value)} error={errors.idNumber} hint="Staff accounts are issued by the Facilities Office." inputMode="numeric" placeholder="23-01234" disabled={loading} />
        <TextField id="reg-email" label="CSU email address" type="email" value={fields.email} onChange={(e) => set('email', e.target.value)} error={errors.email} autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="name@csu.edu.ph" disabled={loading} />
        <PasswordField id="reg-password" label="Password" value={fields.password} onChange={(e) => set('password', e.target.value)} error={errors.password} hint="At least 8 characters, letters and numbers." autoComplete="new-password" disabled={loading} />
        <PasswordField id="reg-confirm" label="Confirm password" value={fields.confirm} onChange={(e) => set('confirm', e.target.value)} error={errors.confirm} autoComplete="new-password" disabled={loading} />
        <PrimaryButton type="submit" fullWidth loading={loading} loadingText="Creating account…" disabled={!complete}>Create Account</PrimaryButton>
      </form>

      <p className="text-center text-sm text-slate-600">
        <Link to="/login" className="link inline-flex min-h-11 items-center">I already have an account</Link>
      </p>
    </AuthLayout>
  )
}
