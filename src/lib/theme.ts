import { useEffect, useState } from 'react'
import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core'
import { THEME_KEY, readJSON, writeJSON } from './storage'

export type Theme = 'light' | 'dark'

function initialTheme(): Theme {
  const saved = readJSON<Theme | null>(THEME_KEY, null)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** In the Android app, keep the status bar icons readable over the current page colors. */
function syncSystemBars(theme: Theme) {
  if (!Capacitor.isNativePlatform()) return
  SystemBars.setStyle({ style: theme === 'dark' ? SystemBarsStyle.Dark : SystemBarsStyle.Light }).catch(() => {})
}

/**
 * Light/dark choice for the signed-in workspace, saved across sessions. The `dark`
 * class lives on <html> only while the calling component (AppShell) is mounted, so
 * the landing and login pages always render light.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    syncSystemBars(theme)
    return () => {
      root.classList.remove('dark')
      syncSystemBars('light')
    }
  }, [theme])

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    writeJSON(THEME_KEY, next)
    setTheme(next)
  }

  return { theme, toggle }
}
