const PREFIX = 'csu-one:v1:'

export const STORAGE_KEYS = {
  reports: `${PREFIX}reports`,
  notifications: `${PREFIX}notifications`,
  personnel: `${PREFIX}personnel`,
  prefs: `${PREFIX}prefs`,
  passwords: `${PREFIX}passwords`,
  accounts: `${PREFIX}accounts`,
  session: `${PREFIX}session`,
  tutorialSeen: `${PREFIX}tutorial-seen`,
} as const

/** Kept outside STORAGE_KEYS so resetting the prototype data keeps the chosen theme. */
export const THEME_KEY = `${PREFIX}theme`

type Area = 'local' | 'session'

function area(kind: Area): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

export function readJSON<T>(key: string, fallback: T, kind: Area = 'local'): T {
  try {
    const raw = area(kind)?.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

/** Returns false when the browser refuses the write (quota, private mode, etc.). */
export function writeJSON(key: string, value: unknown, kind: Area = 'local'): boolean {
  try {
    const store = area(kind)
    if (!store) return false
    store.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeKey(key: string, kind: Area = 'local'): void {
  try {
    area(kind)?.removeItem(key)
  } catch {
    /* storage unavailable */
  }
}

export function clearAppStorage(): void {
  for (const key of Object.values(STORAGE_KEYS)) {
    removeKey(key, 'local')
    removeKey(key, 'session')
  }
}
