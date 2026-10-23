import { useState, type FormEvent } from 'react'
import { ChevronDown, CircleAlert } from 'lucide-react'
import { AuthHeader } from '../components/auth/AuthHeader'
import { AuthLayout } from '../components/auth/AuthLayout'
import { HOME_ROUTE, ROLE_LABEL } from '../components/layout/navConfig'
import { PrimaryButton } from '../components/ui/Button'
import { Modal, ModalCancelButton } from '../components/ui/Modal'
import { PasswordField, TextField } from '../components/ui/TextField'
import { TEST_ACCOUNTS } from '../data/mockData'
import { Link, navigate, useLocation } from '../lib/router'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { useStore } from '../state/AppStore'
import { useToast } from '../state/Toast'

type Errors = { identifier?: string; password?: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ID_RE = /^[A-Za-z0-9-]{4,}$/

function validateIdentifier(identifier: string): string | undefined {
  const id = identifier.trim()
  if (!id) return 'Enter your email address or ID number.'
  if (id.includes('@') ? !EMAIL_RE.test(id) : !ID_RE.test(id)) return 'Enter a valid email (name@csu.edu.ph) or ID number (e.g. 23-01234).'
  return undefined
}

function validatePassword(password: string): string | undefined {
  if (!password) return 'Enter your password.'
  if (password.length < 6) return 'Passwords are at least 6 characters long.'
  return undefined
}

/** Existing-user screen. New users go to /register ("Create an account"). */
export function LoginPage() {
  useDocumentTitle('Log in')
  const { login } = useStore()
  const toast = useToast()
  const { query } = useLocation()
  const next = query.get('next') ?? ''

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState<Errors>({})
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const found: Errors = { identifier: validateIdentifier(identifier), password: validatePassword(password) }
    setErrors(found)
    setAuthError('')
    if (found.identifier || found.password) {
      document.getElementById(found.identifier ? 'identifier' : 'password')?.focus()
      return
    }
    setLoading(true)
    window.setTimeout(() => {
      const account = login(identifier, password, remember)
      setLoading(false)
      if (!account) {
        setAuthError('The email/ID number or password is incorrect.')
        return
      }
      toast.success(`Welcome back, ${account.name.split(' ')[0]}`)
      // Student → Home, Administrator → Dashboard, Maintenance → Assigned Tasks
      const home = HOME_ROUTE[account.role]
      navigate(next.startsWith(home) ? next : home, { replace: true })
    }, 700)
  }

  const fill = (email: string, pw: string) => {
    setIdentifier(email)
    setPassword(pw)
    setErrors({})
    setAuthError('')
  }

  return (
    <AuthLayout showBack={false}>
      <AuthHeader centered title="Welcome back" subtitle="Log in to continue to CSU-One." />

      <form onSubmit={submit} noValidate className="space-y-4">
        {authError && (
          <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800">
            <CircleAlert size={16} className="mt-0.5 shrink-0" aria-hidden />
            <span>{authError} Check your details and try again.</span>
          </div>
        )}

        <TextField
          id="identifier"
          label="Email address or ID number"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          value={identifier}
          onChange={(e) => { setIdentifier(e.target.value); setAuthError('') }}
          onBlur={() => identifier && setErrors((p) => ({ ...p, identifier: validateIdentifier(identifier) }))}
          error={errors.identifier}
          autoComplete="username"
          placeholder="name@csu.edu.ph"
          disabled={loading}
        />

        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setAuthError('') }}
          error={errors.password}
          autoComplete="current-password"
          disabled={loading}
        />

        <div className="flex items-center justify-between gap-3">
          <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-slate-700">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="focusable h-4 w-4 rounded border-slate-300 accent-brand-700" />
            Remember me
          </label>
          <button type="button" className="link min-h-11 text-sm" onClick={() => setForgotOpen(true)}>Forgot password?</button>
        </div>

        <PrimaryButton type="submit" fullWidth loading={loading} loadingText="Logging in…">Log in</PrimaryButton>
      </form>

      <p className="text-center text-sm text-slate-600">
        New here?{' '}
        <Link to="/register" className="link inline-flex min-h-11 items-center">Create an account</Link>
      </p>

      <details className="group rounded-lg border bg-white text-xs">
        <summary className="focusable flex min-h-11 cursor-pointer list-none items-center justify-between rounded-lg px-3 font-medium text-slate-600 hover:bg-slate-50">
          Test accounts
          <ChevronDown size={15} aria-hidden className="text-slate-400 transition group-open:rotate-180" />
        </summary>
        <ul className="divide-y border-t">
          {TEST_ACCOUNTS.map((a) => (
            <li key={a.id}>
              <button type="button" onClick={() => fill(a.email, a.password)} disabled={loading} className="focusable flex min-h-11 w-full items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50">
                <span className="min-w-0">
                  <span className="block font-medium text-slate-800">{ROLE_LABEL[a.role]}</span>
                  <span className="block truncate text-slate-500">{a.email} · {a.password}</span>
                </span>
                <span className="shrink-0 font-semibold text-brand-700">Use</span>
              </button>
            </li>
          ))}
        </ul>
      </details>

      {forgotOpen && (
        <Modal title="Reset your password" onClose={() => setForgotOpen(false)} size="sm" footer={<div className="flex justify-end"><ModalCancelButton label="Close" /></div>}>
          <p className="text-sm leading-relaxed text-slate-600">
            Password reset isn&apos;t available in this prototype yet. Ask the Campus Facilities Office for help signing in.
          </p>
        </Modal>
      )}
    </AuthLayout>
  )
}
