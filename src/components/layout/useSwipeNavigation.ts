import { useEffect, useRef } from 'react'
import { navigate } from '../../lib/router'
import type { Role } from '../../types'
import { NAV } from './navConfig'

const MIN_DISTANCE = 70
const MAX_DURATION = 600
/** Touches this close to the screen edge belong to the system back gesture */
const EDGE = 24
const IGNORE = '.leaflet-container, input, textarea, select, [contenteditable="true"], [data-no-swipe]'

/** True when the touch starts inside something that scrolls sideways (e.g. a chip row). */
function inHorizontalScroller(el: Element | null): boolean {
  for (let node = el; node && node !== document.body; node = node.parentElement) {
    const overflow = getComputedStyle(node).overflowX
    if ((overflow === 'auto' || overflow === 'scroll') && node.scrollWidth > node.clientWidth) return true
  }
  return false
}

/**
 * Phones only: a quick horizontal swipe on a main page moves to the next or previous
 * bottom-nav page for this role. Vertical scrolling, maps, form fields, sideways
 * scrollers, open dialogs and the screen edges are left alone.
 */
export function useSwipeNavigation(role: Role, path: string) {
  const pathRef = useRef(path)
  pathRef.current = path

  useEffect(() => {
    const routes = NAV[role].mobile.map((item) => item.to)
    const phone = window.matchMedia('(max-width: 767px)')
    let start: { x: number; y: number; t: number } | null = null

    const onStart = (e: TouchEvent) => {
      start = null
      if (!phone.matches || e.touches.length !== 1 || !routes.includes(pathRef.current)) return
      const touch = e.touches[0]
      const target = e.target instanceof Element ? e.target : null
      if (touch.clientX < EDGE || touch.clientX > window.innerWidth - EDGE) return
      if (target?.closest(IGNORE) || document.querySelector('dialog[open]') || inHorizontalScroller(target)) return
      start = { x: touch.clientX, y: touch.clientY, t: Date.now() }
    }

    const onEnd = (e: TouchEvent) => {
      if (!start) return
      const touch = e.changedTouches[0]
      const dx = touch.clientX - start.x
      const dy = touch.clientY - start.y
      const quick = Date.now() - start.t < MAX_DURATION
      start = null
      if (!quick || Math.abs(dx) < MIN_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5) return
      if (window.getSelection()?.toString()) return
      const index = routes.indexOf(pathRef.current)
      const next = dx < 0 ? index + 1 : index - 1
      if (index < 0 || next < 0 || next >= routes.length) return
      const main = document.getElementById('main')
      main?.setAttribute('data-swipe', dx < 0 ? 'next' : 'prev')
      main?.addEventListener('animationend', () => main.removeAttribute('data-swipe'), { once: true })
      navigate(routes[next])
    }

    const onCancel = () => { start = null }
    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchend', onEnd, { passive: true })
    document.addEventListener('touchcancel', onCancel, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchend', onEnd)
      document.removeEventListener('touchcancel', onCancel)
    }
  }, [role])
}
