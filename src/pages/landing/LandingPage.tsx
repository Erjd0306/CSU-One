import { LandingView } from '../../generated/views/landing/landing'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import './landing.css'

/** First screen for visitors who are not logged in. Markup: landing.html, styles: landing.css. */
export function LandingPage() {
  useDocumentTitle('')
  return <LandingView />
}
