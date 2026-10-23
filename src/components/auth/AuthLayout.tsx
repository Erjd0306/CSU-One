import type { ReactNode } from 'react'
import { BackToHomeButton } from './BackToHomeButton'

/**
 * Shared frame for the login and new-user screens: one centered column and a
 * short fade-up when the screen appears. The new-user screen shows Back to Home
 * in the top-left; the login screen is the app's main entrance and has none.
 */
export function AuthLayout({ children, showBack = true }: { children: ReactNode; showBack?: boolean }) {
  return (
    <div className="safe-x safe-top safe-bottom flex min-h-[100dvh] flex-col bg-slate-50">
      {showBack && (
        <header className="flex shrink-0 items-center px-4 pt-4 sm:px-6 sm:pt-6">
          <BackToHomeButton />
        </header>
      )}
      <main className={`flex flex-1 justify-center px-4 sm:px-6 ${showBack ? 'pb-10 pt-6 sm:items-center sm:pt-4' : 'items-center py-10'}`}>
        <div className="auth-enter w-full max-w-sm space-y-6">{children}</div>
      </main>
    </div>
  )
}
