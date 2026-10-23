// GENERATED from src/pages/admin/admin-analytics.html by scripts/templates.mjs. Do not edit: change the .html template instead.
import type { AdminAnalyticsViewProps } from '../../../pages/admin/AnalyticsPage'
import { BarList, ChartPanel, ColumnChart, EmptyState, Link, PageHeader, StatStrip, StatusBar } from '../../../templates/components'
import { ChartColumn as Icon_ChartColumn } from 'lucide-react'

export function AdminAnalyticsView(props: AdminAnalyticsViewProps) {
  const { stats, data, statusRows, activity, hasReports } = props
  return (
    <><div className="admin-analytics">
<PageHeader title="Analytics" description="Report trends to help plan maintenance work." />
<StatStrip items={stats} />
{(hasReports) ? (<div className="admin-analytics__body">
<ChartPanel title="Reports by status" rows={statusRows} valueLabel="Reports">
<StatusBar counts={data.status} />
</ChartPanel>
<div className="admin-analytics__grid">
<ChartPanel title="Monthly reports" description="Reports sent in the last six months" rows={data.trend} valueLabel="Reports">
<ColumnChart data={data.trend} />
</ChartPanel>
<ChartPanel title="Average repair time" description="From repair start to resolved, by category" rows={data.repair} valueLabel="Average time">
<BarList data={data.repair} emptyText="No finished repairs yet" />
</ChartPanel>
<ChartPanel title="Reports by category" rows={data.category} valueLabel="Reports">
<BarList data={data.category} />
</ChartPanel>
<ChartPanel title="Reports by campus area" rows={data.area} valueLabel="Reports">
<BarList data={data.area} />
</ChartPanel>
</div>
<section className="panel" aria-labelledby="recent-activity">
<div className="panel-header"><h2 className="panel-title" id="recent-activity">Recent activity</h2></div>
<ol className="admin-analytics__activity">
{(activity).map((e) => (<li key={e.id}>
<Link className="admin-analytics__activity-link focusable" to={`/admin/reports?id=${e.reportId}`}>
<p className="admin-analytics__activity-title"><span className="admin-analytics__activity-label">{e.label}</span> · {e.reportId}</p>
<p className="admin-analytics__activity-meta">{e.reportTitle} · {e.by} · {e.ago}</p>
</Link>
</li>))}
</ol>
</section>
</div>) : (<section className="panel">
<EmptyState icon={Icon_ChartColumn} title="No data yet" message="Charts appear here once students start sending reports." />
</section>)}
</div></>
  )
}
