import { ArrowLeft } from 'lucide-react'
import { Link } from '../../lib/router'

/**
 * Always returns to the public CSU-One landing page (never the previous browser
 * page), so people who arrived from a bookmark or another site are not lost.
 */
export function BackToHomeButton() {
  return (
    <Link
      to="/"
      className="focusable inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-800 transition duration-150 hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100"
    >
      <ArrowLeft size={17} aria-hidden />
      Back to Home
    </Link>
  )
}
