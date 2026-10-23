import { AppLogo } from '../ui/Logo'

type AuthHeaderProps = {
  title: string
  subtitle: string
  /** Login: centered app icon with the CSU-One name above the heading */
  centered?: boolean
}

/** App icon, screen heading and one supporting line, shared by the login and new-user screens. */
export function AuthHeader({ title, subtitle, centered = false }: AuthHeaderProps) {
  if (centered) {
    return (
      <div className="flex flex-col items-center text-center">
        <AppLogo variant="badge" size="lg" />
        <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-brand-700">CSU-One</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-navy-900">{title}</h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{subtitle}</p>
      </div>
    )
  }
  return (
    <div>
      <AppLogo variant="badge" size="md" />
      <h1 className="mt-5 text-2xl font-bold tracking-tight text-navy-900">{title}</h1>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">{subtitle}</p>
    </div>
  )
}
