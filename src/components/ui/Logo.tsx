import appIcon from '../icon/icon.png'

type AppLogoProps = {
  /**
   * wordmark: app icon + "CSU-One" (headers).
   * mark: app icon only (compact sidebar).
   * badge: large app icon for the landing, login, new-user and loading screens.
   * Every variant uses icon.png, the single source of CSU-One branding.
   */
  variant?: 'wordmark' | 'mark' | 'badge'
  /** Badge size; ignored by the other variants */
  size?: 'md' | 'lg'
}

/**
 * icon.png is 500×500 with a transparent margin; the rounded icon fills ~75% of it.
 * Render sizes are chosen so the visible icon is ~84px (lg) or ~66px (md), and a
 * matching negative margin keeps surrounding spacing tight. object-contain keeps
 * the eagle's aspect ratio without stretching or cropping.
 */
const BADGE = { lg: { px: 112, inset: 14 }, md: { px: 88, inset: 11 } } as const
/** Header mark: 48px image → ~36px visible tile, same footprint as before. */
const MARK = { px: 48, inset: 6 } as const

/** CSU-One brand mark, shared by every screen so the app reads as one product. */
export function AppLogo({ variant = 'wordmark', size = 'lg' }: AppLogoProps) {
  if (variant === 'badge') {
    const { px, inset } = BADGE[size]
    return (
      <img
        src={appIcon}
        alt="CSU-One app icon"
        width={px}
        height={px}
        draggable={false}
        className="block shrink-0 select-none object-contain"
        style={{ width: px, height: px, margin: -inset }}
      />
    )
  }

  return (
    <span className="flex items-center gap-2.5">
      <img
        src={appIcon}
        alt=""
        aria-hidden
        width={MARK.px}
        height={MARK.px}
        draggable={false}
        className="block shrink-0 select-none object-contain"
        style={{ width: MARK.px, height: MARK.px, margin: -MARK.inset }}
      />
      {variant === 'wordmark' && (
        <span className="leading-none" aria-hidden>
          <span className="block text-[15px] font-bold tracking-tight text-navy-900">
            CSU<span className="text-brand-600">-</span>One
          </span>
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Carig Campus</span>
        </span>
      )}
      <span className="sr-only">CSU-One</span>
    </span>
  )
}
