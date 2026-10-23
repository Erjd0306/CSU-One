import type { ReactNode } from 'react'
import { LogOut } from 'lucide-react'
import { useRequestLogout } from './LogoutConfirmationDialog'

/** Log Out trigger. It never ends the session itself; it opens the shared confirmation. */
export function LogoutButton({ className = 'btn-danger', children }: { className?: string; children?: ReactNode }) {
  const requestLogout = useRequestLogout()
  return (
    <button type="button" className={className} onClick={requestLogout} aria-haspopup="dialog">
      {children ?? <><LogOut size={17} aria-hidden />Log Out</>}
    </button>
  )
}
