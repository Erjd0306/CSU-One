import { useRef, useState, type Ref } from 'react'
import { Link } from '../../lib/router'
import type { Role } from '../../types'
import { NAV, isActive, type NavItem } from './navConfig'
import { ProfileMenuSheet, useProfileActions, type ProfileAction } from './ProfileMenu'

type MobileBottomNavProps = { role: Role; path: string; unread: number }

/**
 * App-style bottom navigation for phones only (hidden from the md breakpoint up,
 * where the sidebar takes over). Solid background, safe-area aware, five items max.
 * The Profile tab opens the account menu as a sheet instead of a full page.
 */
export function MobileBottomNav({ role, path, unread }: MobileBottomNavProps) {
  const items = NAV[role].mobile.slice(0, 5)
  const { run, dialogs } = useProfileActions()
  const [sheetOpen, setSheetOpen] = useState(false)
  const profileRef = useRef<HTMLButtonElement>(null)

  const select = (action: ProfileAction) => {
    setSheetOpen(false)
    profileRef.current?.focus()
    run(action)
  }

  return (
    <nav className="bottom-nav fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white md:hidden" aria-label="Main navigation">
      <ul className="grid grid-cols-5">
        {items.map((item) => (
          <li key={item.to} className="min-w-0">
            {item.opensMenu ? (
              <NavButton ref={profileRef} item={item} current={isActive(item, path)} highlighted={isActive(item, path) || sheetOpen} onPress={() => setSheetOpen(true)} />
            ) : (
              <MobileNavLink item={item} active={isActive(item, path)} count={item.badge === 'notifications' ? unread : 0} />
            )}
          </li>
        ))}
      </ul>
      {sheetOpen && <ProfileMenuSheet onSelect={select} onClose={() => setSheetOpen(false)} />}
      {dialogs}
    </nav>
  )
}

const itemClass = (active: boolean) =>
  `focusable group relative flex min-h-[60px] w-full flex-col items-center justify-center gap-1 px-0.5 text-[10px] font-medium min-[360px]:text-[11px] transition-colors duration-150 active:bg-slate-100 ${active ? 'text-brand-700' : 'text-slate-500 hover:text-slate-800'}`

function ItemBody({ item, active, count = 0 }: { item: NavItem; active: boolean; count?: number }) {
  const Icon = item.icon
  return (
    <>
      {active && !item.prominent && <span aria-hidden className="absolute inset-x-4 top-0 h-0.5 rounded-b bg-brand-700" />}
      {item.prominent ? (
        <span className={`grid h-9 w-11 place-items-center rounded-lg text-white transition duration-150 group-active:scale-95 ${active ? 'bg-brand-800 ring-2 ring-brand-200' : 'bg-brand-700'}`}>
          <Icon size={20} aria-hidden />
        </span>
      ) : (
        <span className="relative grid h-6 place-items-center transition-transform duration-150 group-active:scale-90">
          <Icon size={21} aria-hidden strokeWidth={active ? 2.25 : 2} />
          {count > 0 && (
            <span aria-hidden className="absolute -right-2.5 -top-1.5 min-w-[17px] rounded-full bg-brand-700 px-1 text-center text-[10px] font-semibold leading-[17px] text-white ring-2 ring-white">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </span>
      )}
      <span className={`max-w-full truncate leading-none ${item.prominent || active ? 'font-semibold' : ''}`}>{item.label}</span>
      {count > 0 && <span className="sr-only">, {count} unread</span>}
    </>
  )
}

function MobileNavLink({ item, active, count }: { item: NavItem; active: boolean; count: number }) {
  return (
    <Link to={item.to} aria-current={active ? 'page' : undefined} className={itemClass(active)}>
      <ItemBody item={item} active={active} count={count} />
    </Link>
  )
}

type NavButtonProps = { ref: Ref<HTMLButtonElement>; item: NavItem; current: boolean; highlighted: boolean; onPress: () => void }

function NavButton({ ref, item, current, highlighted, onPress }: NavButtonProps) {
  return (
    <button ref={ref} type="button" onClick={onPress} aria-haspopup="dialog" aria-current={current ? 'page' : undefined} className={itemClass(highlighted)}>
      <ItemBody item={item} active={highlighted} />
    </button>
  )
}
