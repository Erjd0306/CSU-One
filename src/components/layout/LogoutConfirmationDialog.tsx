import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { navigate } from '../../lib/router'
import { useStore } from '../../state/AppStore'
import { useToast } from '../../state/Toast'
import { ConfirmDialog } from '../ui/Modal'

const RequestLogoutContext = createContext<(() => void) | null>(null)

/**
 * Owns the single logout confirmation for the whole workspace. Every Log Out
 * button asks this provider to open it, so only one dialog can exist at a time.
 */
export function LogoutProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const request = useCallback(() => setOpen(true), [])
  return (
    <RequestLogoutContext.Provider value={request}>
      {children}
      {open && <LogoutConfirmationDialog onCancel={() => setOpen(false)} />}
    </RequestLogoutContext.Provider>
  )
}

export function useRequestLogout(): () => void {
  const request = useContext(RequestLogoutContext)
  if (!request) throw new Error('useRequestLogout must be used inside LogoutProvider')
  return request
}

/** "Log out?" confirmation shared by Student, Administrator, and Maintenance accounts. */
export function LogoutConfirmationDialog({ onCancel }: { onCancel: () => void }) {
  const { logout } = useStore()
  const toast = useToast()
  return (
    <ConfirmDialog
      title="Log out?"
      message="Are you sure you want to log out of CSU-One?"
      confirmLabel="Log Out"
      tone="danger"
      onCancel={onCancel}
      onConfirm={() => {
        onCancel()
        logout()
        // Back to the landing page, the first screen for anyone who is not logged in.
        navigate('/', { replace: true })
        toast.success('You have been logged out')
      }}
    />
  )
}
