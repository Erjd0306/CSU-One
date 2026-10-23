const dateFmt = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
const timeFmt = new Intl.DateTimeFormat('en-PH', { hour: 'numeric', minute: '2-digit' })
const monthFmt = new Intl.DateTimeFormat('en-PH', { month: 'short' })

export const formatDate = (isoDate: string) => dateFmt.format(new Date(isoDate))
export const formatDateTime = (isoDate: string) => `${dateFmt.format(new Date(isoDate))}, ${timeFmt.format(new Date(isoDate))}`
export const formatMonth = (d: Date) => monthFmt.format(d)

export function timeAgo(isoDate: string, now = Date.now()): string {
  const diff = Math.max(0, now - new Date(isoDate).getTime())
  const min = Math.floor(diff / 60_000)
  if (min < 1) return 'Just now'
  if (min < 60) return `${min} min ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} hr ago`
  const days = Math.floor(hr / 24)
  if (days < 7) return days === 1 ? 'Yesterday' : `${days} days ago`
  return formatDate(isoDate)
}

/** Formats a duration given in hours as "5 hr" or "2.4 days". */
export function formatDuration(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return '—'
  if (hours < 24) return `${Math.round(hours)} hr`
  const days = hours / 24
  return `${days < 10 ? days.toFixed(1) : Math.round(days)} days`
}

export const hoursBetween = (a: string, b: string) => (new Date(b).getTime() - new Date(a).getTime()) / 3_600_000

export const uid = (prefix = 'id') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export const initialsOf = (name: string) => name.split(/\s+/).filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase()
