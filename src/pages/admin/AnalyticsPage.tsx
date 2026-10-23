import { useMemo } from 'react'
import type { Datum } from '../../components/charts/Charts'
import type { StatItem } from '../../components/ui/Page'
import { AdminAnalyticsView } from '../../generated/views/admin/admin-analytics'
import { STATUSES } from '../../lib/meta'
import { avgRepairByCategory, avgResolutionHours, monthlyTrend, reportsByArea, reportsByCategory, statusCounts } from '../../lib/analytics'
import { formatDuration, timeAgo } from '../../lib/format'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { useStore } from '../../state/AppStore'
import type { Status } from '../../types'
import './admin-analytics.css'

type Activity = { id: string; label: string; by: string; ago: string; reportId: string; reportTitle: string }

export type AdminAnalyticsViewProps = {
  stats: StatItem[]
  data: { category: Datum[]; area: Datum[]; status: Record<Status, number>; trend: Datum[]; repair: Datum[] }
  statusRows: Datum[]
  activity: Activity[]
  hasReports: boolean
}

/** Admin Analytics. Markup: admin-analytics.html, styles: admin-analytics.css. */
export function AnalyticsPage() {
  useDocumentTitle('Analytics')
  const { reports } = useStore()
  const data = useMemo(() => ({
    category: reportsByCategory(reports),
    area: reportsByArea(reports),
    status: statusCounts(reports),
    trend: monthlyTrend(reports),
    repair: avgRepairByCategory(reports),
  }), [reports])
  const avg = useMemo(() => avgResolutionHours(reports), [reports])
  const activity = useMemo(
    () => reports
      .flatMap((r) => r.timeline.map((e) => ({ id: e.id, label: e.label, by: e.by, at: e.at, reportId: r.id, reportTitle: r.title })))
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 8)
      .map(({ at, ...rest }) => ({ ...rest, ago: timeAgo(at) })),
    [reports],
  )
  const resolvedRate = reports.length ? Math.round((data.status.Resolved / reports.length) * 100) : 0
  const thisMonth = data.trend[data.trend.length - 1]?.value ?? 0

  return (
    <AdminAnalyticsView
      stats={[
        { label: 'Total reports', value: reports.length },
        { label: 'This month', value: thisMonth },
        { label: 'Resolved rate', value: `${resolvedRate}%`, tone: 'success' },
        { label: 'Avg. resolution', value: formatDuration(avg), note: 'Submission to resolved' },
      ]}
      data={data}
      statusRows={STATUSES.map((s) => ({ label: s, value: data.status[s] }))}
      activity={activity}
      hasReports={reports.length > 0}
    />
  )
}
