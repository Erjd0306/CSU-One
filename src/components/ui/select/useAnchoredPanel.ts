import { useEffect, useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react'

const GAP = 4
const EDGE = 8

/**
 * Positions a floating options panel against its field using `position: fixed`,
 * so it is never clipped by cards, tables, or scroll containers. It matches the
 * field's width, flips above the field when there is more room there, and treats
 * the mobile bottom navigation and on-screen keyboard as the bottom of the screen.
 *
 * The panel is portaled into the nearest open <dialog> (so it stays interactive
 * inside modals) or into <body>.
 */
export function useAnchoredPanel(anchor: RefObject<HTMLElement | null>, open: boolean, preferredHeight: number) {
  const [style, setStyle] = useState<CSSProperties>({ position: 'fixed', visibility: 'hidden' })
  const [container, setContainer] = useState<HTMLElement | null>(null)

  useLayoutEffect(() => {
    if (!open) return
    const el = anchor.current
    if (!el) return
    setContainer(el.closest('dialog') ?? document.body)

    const update = () => {
      const r = el.getBoundingClientRect()
      const vv = window.visualViewport
      const viewTop = vv ? vv.offsetTop : 0
      let viewBottom = vv ? vv.offsetTop + vv.height : window.innerHeight
      const nav = document.querySelector<HTMLElement>('nav.bottom-nav')
      if (nav && nav.offsetParent !== null) viewBottom = Math.min(viewBottom, nav.getBoundingClientRect().top)

      const below = viewBottom - r.bottom - GAP - EDGE
      const above = r.top - viewTop - GAP - EDGE
      const openUp = below < Math.min(preferredHeight, 180) && above > below
      const maxHeight = Math.max(96, Math.min(preferredHeight, openUp ? above : below))
      const width = Math.min(r.width, window.innerWidth - EDGE * 2)
      const left = Math.min(Math.max(EDGE, r.left), window.innerWidth - width - EDGE)

      setStyle({
        position: 'fixed',
        left,
        width,
        maxHeight,
        ...(openUp ? { bottom: window.innerHeight - r.top + GAP } : { top: r.bottom + GAP }),
      })
    }

    update()
    const vv = window.visualViewport
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    vv?.addEventListener('resize', update)
    vv?.addEventListener('scroll', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      vv?.removeEventListener('resize', update)
      vv?.removeEventListener('scroll', update)
    }
  }, [open, anchor, preferredHeight])

  return { style, container }
}

/** Closes a popup when the pointer goes down outside every given element. */
export function useOutsidePointer(refs: RefObject<HTMLElement | null>[], active: boolean, onOutside: () => void) {
  useEffect(() => {
    if (!active) return
    const handler = (e: PointerEvent) => {
      const target = e.target
      if (!(target instanceof Node)) return
      if (refs.some((r) => r.current?.contains(target))) return
      onOutside()
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [active, refs, onOutside])
}
