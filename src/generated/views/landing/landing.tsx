// GENERATED from src/pages/landing/landing.html by scripts/templates.mjs. Do not edit: change the .html template instead.
import { AppLogo, Link } from '../../../templates/components'
import { ArrowRight as Icon_ArrowRight, BellRing as Icon_BellRing, Camera as Icon_Camera, Check as Icon_Check, MapPin as Icon_MapPin } from 'lucide-react'

export function LandingView() {
  return (
    <><div className="landing">
<div className="landing__glow" aria-hidden />
<main className="landing__main">
<div className="landing__brand landing__rise">
<span className="landing__logo"><AppLogo variant="badge" /></span>
<h1 className="landing__title">CSU<span className="landing__title-dash">-</span>One</h1>
<p className="landing__tagline">See a problem on campus?<br />Report it in a minute.</p>
</div>
<section className="landing__card landing__rise" aria-labelledby="how-it-works">
<h2 className="sr-only" id="how-it-works">How it works</h2>
<ol className="landing__steps">
<li className="landing__step">
<span className="landing__step-icon"><Icon_MapPin size={19} aria-hidden /></span>
<span className="landing__step-title">Pin it</span>
<span className="landing__step-help">on the map</span>
</li>
<li className="landing__step">
<span className="landing__step-icon"><Icon_Camera size={19} aria-hidden /></span>
<span className="landing__step-title">Describe it</span>
<span className="landing__step-help">with a photo</span>
</li>
<li className="landing__step">
<span className="landing__step-icon"><Icon_BellRing size={19} aria-hidden /></span>
<span className="landing__step-title">Track it</span>
<span className="landing__step-help">until it&apos;s fixed</span>
</li>
</ol>
<div className="landing__track">
<p className="landing__track-label">Follow every step of the repair</p>
<ol className="landing__track-line" aria-label="Report status: Open, Assigned, In progress, Resolved">
<li className="landing__track-stop is-open"><span className="landing__track-dot" />Open</li>
<li className="landing__track-stop is-assigned"><span className="landing__track-dot" />Assigned</li>
<li className="landing__track-stop is-progress"><span className="landing__track-dot" />In progress</li>
<li className="landing__track-stop is-resolved"><span className="landing__track-dot"><Icon_Check size={9} strokeWidth={3.5} aria-hidden /></span>Resolved</li>
</ol>
</div>
</section>
<div className="landing__actions landing__rise">
<Link className="btn-primary landing__cta" to="/login">Log in<Icon_ArrowRight size={17} aria-hidden /></Link>
<Link className="btn-secondary landing__secondary" to="/register">Create an account</Link>
</div>
</main>
<footer className="landing__footer">
<p>Cagayan State University · Carig Campus</p>
</footer>
</div></>
  )
}
