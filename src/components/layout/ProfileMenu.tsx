import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Bell, ChevronDown, LifeBuoy, LogOut, Settings, User, type LucideIcon } from 'lucide-react'
import { navigate } from '../../lib/router'
import { useUser } from '../../state/AppStore'
import { Avatar } from '../ui/Badges'
import { Modal, ModalCancelButton } from '../ui/Modal'
import { useRequestLogout } from './LogoutConfirmationDialog'
import { HOME_ROUTE, ROLE_LABEL } from './navConfig'

export type ProfileAction = 'profile' | 'account' | 'notifications' | 'help' | 'logout'

const ITEMS: { action: Exclude<ProfileAction, 'logout'>; label: string; icon: LucideIcon }[] = [
  { action: 'profile', label: 'View Profile', icon: User },
  { action: 'account', label: 'Account Settings', icon: Settings },
  { action: 'notifications', label: 'Notification Settings', icon: Bell },
  { action: 'help', label: 'Help and Support', icon: LifeBuoy },
]

/** Runs a profile action and owns the Help dialog. Shared by the dropdown, the mobile sheet and the admin More page. */
export function useProfileActions(): { run: (action: ProfileAction) => void; dialogs: ReactNode } {
  const user = useUser()
  const requestLogout = useRequestLogout()
  const [helpOpen, setHelpOpen] = useState(false)
  const run = (action: ProfileAction) => {
    if (action === 'logout') requestLogout()
    else if (action === 'help') setHelpOpen(true)
    else navigate(`${HOME_ROUTE[user.role]}/profile${action === 'profile' ? '' : `?section=${action}`}`)
  }
  return { run, dialogs: helpOpen ? <HelpDialog onClose={() => setHelpOpen(false)} /> : null }
}

type ItemsProps = { onSelect: (action: ProfileAction) => void; asMenu?: boolean }

/** The option list with Log Out separated by a divider and shown in restrained red. */
export function ProfileMenuItems({ onSelect, asMenu = false }: ItemsProps) {
  const itemRole = asMenu ? 'menuitem' : undefined
  const base = 'focusable flex min-h-11 w-full items-center gap-3 px-4 text-left text-sm transition-colors'
  return (
    <>
      <ul role={asMenu ? 'none' : undefined} className="py-1">
        {ITEMS.map(({ action, label, icon: Icon }) => (
          <li key={action} role={asMenu ? 'none' : undefined}>
            <button type="button" role={itemRole} onClick={() => onSelect(action)} className={`${base} text-slate-700 hover:bg-slate-50 active:bg-slate-100`}>
              <Icon size={17} className="shrink-0 text-slate-500" aria-hidden />{label}
            </button>
          </li>
        ))}
      </ul>
      <div role={asMenu ? 'separator' : undefined} className="border-t" />
      <div className="py-1">
        <button type="button" role={itemRole} onClick={() => onSelect('logout')} className={`${base} text-rose-700 hover:bg-rose-50 active:bg-rose-100`}>
          <LogOut size={17} className="shrink-0" aria-hidden />Log Out
        </button>
      </div>
    </>
  )
}

/**
 * Compact profile button in the header ([ME] Mark ▾) that opens the account menu.
 * Closes on a second press, an outside click, Escape, Tab, or after choosing an option.
 */
export function ProfileDropdown() {
  const user = useUser()
  const { run, dialogs } = useProfileActions()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (e.target instanceof Node && !wrapRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    // Move focus to the first option when the menu opens.
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [open])

  const select = (action: ProfileAction) => {
    setOpen(false)
    // Return focus to the profile button first, so dialogs opened next restore focus to it.
    buttonRef.current?.focus()
    run(action)
  }

  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = [...(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])]
    const index = items.indexOf(document.activeElement as HTMLElement)
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); buttonRef.current?.focus() }
    else if (e.key === 'Tab') setOpen(false)
    else if (e.key === 'ArrowDown') { e.preventDefault(); items[(index + 1) % items.length]?.focus() }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[(index - 1 + items.length) % items.length]?.focus() }
    else if (e.key === 'Home') { e.preventDefault(); items[0]?.focus() }
    else if (e.key === 'End') { e.preventDefault(); items[items.length - 1]?.focus() }
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Account menu for ${user.name}`}
        className="focusable flex min-h-11 items-center gap-2 rounded-lg py-1 pl-1 pr-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100 active:bg-slate-200"
      >
        <Avatar initials={user.initials} size="sm" />
        <span className="max-w-[8rem] truncate">{user.name.split(' ')[0]}</span>
        <ChevronDown size={16} aria-hidden className={`text-slate-500 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Account"
          onKeyDown={onMenuKey}
          className="menu-enter absolute right-0 top-full z-40 mt-2 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border bg-white shadow-[0_10px_30px_rgba(15,23,42,0.12)]"
        >
          <div className="border-b px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">{ROLE_LABEL[user.role]}</p>
          </div>
          <ProfileMenuItems asMenu onSelect={select} />
        </div>
      )}
      {dialogs}
    </div>
  )
}

/** Mobile version: the bottom-nav Profile tab opens the same options in a compact sheet. */
export function ProfileMenuSheet({ onSelect, onClose }: { onSelect: (action: ProfileAction) => void; onClose: () => void }) {
  const user = useUser()
  return (
    <Modal title={user.name} description={ROLE_LABEL[user.role]} variant="sheet" size="sm" onClose={onClose}>
      <div className="-mx-4 -my-4 sm:-mx-5">
        <ProfileMenuItems onSelect={onSelect} />
      </div>
    </Modal>
  )
}

/** Short help content: how reporting works and what to do in an emergency. */
export function HelpDialog({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Help and Support" onClose={onClose} size="sm" footer={<div className="flex justify-end"><ModalCancelButton label="Close" /></div>}>
      <div className="space-y-4 text-sm leading-relaxed text-slate-600">
        <section>
          <h3 className="font-semibold text-slate-900">Reporting a problem</h3>
          <ol className="mt-1 list-decimal space-y-0.5 pl-5">
            <li>Choose a category and add a short title.</li>
            <li>Pin the exact spot on the campus map.</li>
            <li>Describe the problem and add a photo if it is safe.</li>
          </ol>
        </section>
        <section>
          <h3 className="font-semibold text-slate-900">Tracking repairs</h3>
          <p className="mt-1">Each report moves from Open to Assigned, In Progress, and Resolved. You are notified at every step.</p>
        </section>
        <section>
          <h3 className="font-semibold text-slate-900">Emergencies</h3>
          <p className="mt-1">CSU-One is for repairs only. For fire, injuries, or immediate danger, call <a href="tel:911" className="link">911</a> and alert Campus Security.</p>
        </section>
        <section>
          <h3 className="font-semibold text-slate-900">Account help</h3>
          <p className="mt-1">For login problems or to correct your details, contact the Campus Facilities Office.</p>
        </section>
      </div>
    </Modal>
  )
}
