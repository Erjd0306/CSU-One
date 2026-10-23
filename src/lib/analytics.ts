import { BUILDINGS } from '../data/campus'
import { CATEGORIES, STATUSES } from './meta'
import { formatDuration, formatMonth, hoursBetween } from './format'
import type { Datum } from '../components/charts/Charts'
import type { Report, Status } from '../types'

const byValueDesc = (a: Datum, b: Datum) => b.value - a.value

export function reportsByCategory(reports: Report[]): Datum[] {
  return CATEGORIES.map((c) => ({ label: c.value, value: reports.filter((r) => r.category === c.value).length }))
    .filter((d) => d.value > 0)
    .sort(byValueDesc)
}

export function reportsByArea(reports: Report[]): Datum[] {
  return BUILDINGS.map((b) => ({ label: b.name, value: reports.filter((r) => r.buildingId === b.id).length }))
    .filter((d) => d.value > 0)
    .sort(byValueDesc)
}

export function statusCounts(reports: Report[]): Record<Status, number> {
  return Object.fromEntries(STATUSES.map((s) => [s, reports.filter((r) => r.status === s).length])) as Record<Status, number>
}

/** Reports submitted in each of the last `months` calendar months, oldest first. */
export function monthlyTrend(reports: Report[], months = 6, now = new Date()): Datum[] {
  const out: Datum[] = []
  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    out.push({
      label: formatMonth(start),
      value: reports.filter((r) => { const t = new Date(r.createdAt); return t >= start && t < end }).length,
    })
  }
  return out
}

/** Average hours from submission to resolution. */
export function avgResolutionHours(reports: Report[]): number {
  const done = reports.filter((r) => r.resolvedAt)
  if (!done.length) return 0
  return done.reduce((sum, r) => sum + hoursBetween(r.createdAt, r.resolvedAt as string), 0) / done.length
}

/** Average hours from repair start to resolution, per category. */
export function avgRepairByCategory(reports: Report[]): Datum[] {
  return CATEGORIES.map((c) => {
    const done = reports.filter((r) => r.category === c.value && r.resolvedAt && r.startedAt)
    const avg = done.length ? done.reduce((s, r) => s + hoursBetween(r.startedAt as string, r.resolvedAt as string), 0) / done.length : 0
    return { label: c.value, value: Math.round(avg * 10) / 10, display: formatDuration(avg) }
  })
    .filter((d) => d.value > 0)
    .sort(byValueDesc)
}
