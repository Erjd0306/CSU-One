import { useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from 'react'

/**
 * A tiny hash router. Hash routing keeps the prototype working when it is served
 * from any static host and survives page refreshes without server rewrites.
 */

function subscribe(callback: () => void) {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

const getHash = () => window.location.hash.slice(1) || '/'

export type Location = { path: string; query: URLSearchParams }

export function useLocation(): Location {
  const hash = useSyncExternalStore(subscribe, getHash, () => '/')
  const [path, search = ''] = hash.split('?')
  return { path: path || '/', query: new URLSearchParams(search) }
}

export function navigate(to: string, options: { replace?: boolean } = {}): void {
  const target = `#${to}`
  if (options.replace) {
    window.history.replaceState(null, '', target)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  } else if (window.location.hash !== target) {
    window.location.hash = to
  }
}

/** Matches `/student/reports/:id` style patterns. Returns params or null. */
export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const p = pattern.split('/').filter(Boolean)
  const s = path.split('/').filter(Boolean)
  if (p.length !== s.length) return null
  const params: Record<string, string> = {}
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(s[i])
    else if (p[i] !== s[i]) return null
  }
  return params
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }

export function Link({ to, onClick, ...rest }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    navigate(to)
  }
  return <a href={`#${to}`} onClick={handle} {...rest} />
}
