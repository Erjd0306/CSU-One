import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { MapContainer, Marker, Polygon, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Crosshair, MapPinOff, RotateCcw } from 'lucide-react'
import {
  BUILDINGS, CAMPUS_ADDRESS, CAMPUS_BOUNDARY, CAMPUS_CENTER, CAMPUS_MAX_BOUNDS, CAMPUS_NAME, CAMPUS_ZOOM, buildingName,
} from '../../data/campus'
import { STATUS_HEX, STATUSES } from '../../lib/meta'
import type { LatLng, Report, Status } from '../../types'
import { PriorityBadge, StatusBadge } from '../ui/Badges'

type CampusMapProps = {
  /** Accessible description of what the map shows */
  label: string
  reports?: Report[]
  selectedId?: string
  /** Shows a "View details" button inside each pin's popup */
  onViewReport?: (report: Report) => void
  /** Opens the report directly when a pin is selected (no popup) */
  onMarkerSelect?: (report: Report) => void
  /** Pick mode: tap the map or drag the pin to choose a location */
  pick?: LatLng | null
  onPick?: (point: LatLng) => void
  /** Increment to fly the map to the current pick (e.g. after choosing a building) */
  focusKey?: number
  /** Static preview without pan/zoom */
  preview?: boolean
  className?: string
  onLoadFailed?: () => void
  /** Extra content placed under the failure message (e.g. a building dropdown) */
  fallbackExtra?: ReactNode
}

const iconCache = new Map<string, L.DivIcon>()

function pinIcon(status: Status, urgent: boolean, selected: boolean): L.DivIcon {
  const key = `${status}-${urgent}-${selected}`
  const cached = iconCache.get(key)
  if (cached) return cached
  const glyph = urgent ? '!' : '<span style="width:8px;height:8px;border-radius:50%;background:#fff;display:block"></span>'
  const icon = L.divIcon({
    className: '',
    html: `<div class="map-pin ${selected ? 'map-pin-selected' : ''}"><span class="map-pin-head" style="background:${STATUS_HEX[status]}"></span><span class="map-pin-glyph">${glyph}</span></div>`,
    iconSize: [28, 36],
    iconAnchor: [14, 34],
    popupAnchor: [0, -30],
  })
  iconCache.set(key, icon)
  return icon
}

const pickIcon = L.divIcon({
  className: '',
  html: '<div class="map-pin map-pin-selected" style="transform:scale(1.15)"><span class="map-pin-head" style="background:#8f1324"></span><span class="map-pin-glyph"><span style="width:10px;height:10px;border-radius:50%;background:#fff;display:block"></span></span></div>',
  iconSize: [28, 36],
  iconAnchor: [14, 34],
})

const campusIcon = L.divIcon({
  className: '',
  html: '<div class="campus-label"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>CSU Carig Campus</div>',
  iconSize: [0, 0],
  iconAnchor: [0, 6],
  popupAnchor: [0, -30],
})

function ClickToPick({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({ click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) })
  return null
}

/** Zoom from which place points replace the single campus label */
const PLACE_LABEL_ZOOM = 17
/** Zoom from which the points show names (closer than this, neighbouring names overlap) */
const PLACE_NAME_ZOOM = 18
const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const placeDot = L.divIcon({ className: '', html: '<span class="place-dot"></span>', iconSize: [0, 0], iconAnchor: [0, 0] })
const LABELLED_PLACES = BUILDINGS.filter((b) => b.short).map((b) => ({
  ...b,
  icon: L.divIcon({ className: '', html: `<span class="place-label">${escapeHtml(b.short ?? '')}</span>`, iconSize: [0, 0], iconAnchor: [0, 0] }),
}))

/**
 * Verified OpenStreetMap buildings: points at campus zoom, names when zoomed in. They
 * are not interactive, so taps fall through to the map (in pick mode a tap on a label
 * pins that building).
 */
function PlaceLabels({ zoom }: { zoom: number }) {
  if (zoom < PLACE_LABEL_ZOOM) return null
  return LABELLED_PLACES.map((b) => (
    <Marker key={b.id} position={[b.lat, b.lng]} icon={zoom >= PLACE_NAME_ZOOM ? b.icon : placeDot} title={b.name} interactive={false} keyboard={false} zIndexOffset={-200} />
  ))
}

function ZoomWatcher({ onZoom }: { onZoom: (z: number) => void }) {
  const map = useMapEvents({ zoomend: () => onZoom(map.getZoom()) })
  return null
}

class MapErrorBoundary extends Component<{ fallback: ReactNode; onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onError() }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

export function CampusMap({
  label, reports = [], selectedId, onViewReport, onMarkerSelect, pick, onPick, focusKey, preview = false, className = 'h-80', onLoadFailed, fallbackExtra,
}: CampusMapProps) {
  const [map, setMap] = useState<L.Map | null>(null)
  const [failed, setFailed] = useState(() => typeof navigator !== 'undefined' && navigator.onLine === false)
  const [attempt, setAttempt] = useState(0)
  const [zoom, setZoom] = useState(preview ? CAMPUS_ZOOM - 1 : CAMPUS_ZOOM)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const tiles = useRef({ loaded: 0, errors: 0 })
  const failedRef = useRef(onLoadFailed)
  failedRef.current = onLoadFailed

  useEffect(() => { if (failed) failedRef.current?.() }, [failed])

  // Treat the map as unavailable if no tile arrives within 12 seconds.
  useEffect(() => {
    tiles.current = { loaded: 0, errors: 0 }
    const t = window.setTimeout(() => { if (tiles.current.loaded === 0) setFailed(true) }, 12000)
    return () => window.clearTimeout(t)
  }, [attempt])

  // Keep Leaflet's size in sync when the map sits inside drawers, tabs, or resizing layouts.
  useEffect(() => {
    if (!map || !wrapperRef.current) return
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(wrapperRef.current)
    return () => ro.disconnect()
  }, [map])

  // Follow the pick pin when it drifts out of view.
  useEffect(() => {
    if (map && pick && !map.getBounds().pad(-0.1).contains([pick.lat, pick.lng])) map.panTo([pick.lat, pick.lng])
  }, [map, pick])

  // Center on the pin when the form asks for it (a building was chosen from search).
  const pickRef = useRef(pick)
  pickRef.current = pick
  useEffect(() => {
    const target = pickRef.current
    if (!map || !focusKey || !target) return
    map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 18), { duration: 0.5 })
  }, [map, focusKey])

  const tileEvents = useMemo<L.LeafletEventHandlerFnMap>(() => ({
    tileload: () => { tiles.current.loaded += 1 },
    tileerror: () => {
      tiles.current.errors += 1
      if (tiles.current.errors >= 6 && tiles.current.loaded === 0) setFailed(true)
    },
  }), [])

  const recenter = () => map?.flyTo([CAMPUS_CENTER.lat, CAMPUS_CENTER.lng], CAMPUS_ZOOM, { duration: 0.6 })

  const fallback = (
    <div role="alert" className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center ${className}`}>
      <MapPinOff size={24} className="text-slate-400" aria-hidden />
      <p className="text-sm font-semibold text-slate-800">The campus map could not be loaded</p>
      <p className="max-w-sm text-xs leading-relaxed text-slate-500">
        Check your internet connection and try again.{onPick ? ' You can also choose the building or area from the list instead.' : ''}
      </p>
      <button type="button" className="btn-secondary btn-sm mt-1" onClick={() => { setFailed(false); setAttempt((a) => a + 1) }}>
        <RotateCcw size={14} aria-hidden />Try again
      </button>
      {fallbackExtra}
    </div>
  )

  if (failed) return fallback

  return (
    <MapErrorBoundary key={attempt} fallback={fallback} onError={() => setFailed(true)}>
      <div ref={wrapperRef} className={`relative overflow-hidden rounded-lg border ${className}`} role="region" aria-label={label}>
        <MapContainer
          ref={setMap}
          center={[CAMPUS_CENTER.lat, CAMPUS_CENTER.lng]}
          zoom={preview ? CAMPUS_ZOOM - 1 : CAMPUS_ZOOM}
          minZoom={15}
          maxZoom={19}
          maxBounds={CAMPUS_MAX_BOUNDS}
          maxBoundsViscosity={0.8}
          scrollWheelZoom={false}
          dragging={!preview}
          zoomControl={!preview}
          doubleClickZoom={!preview}
          touchZoom={!preview}
          keyboard={!preview}
          boxZoom={!preview}
          className="h-full w-full"
        >
          <TileLayer
            key={attempt}
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
            eventHandlers={tileEvents}
          />
          <Polygon
            positions={CAMPUS_BOUNDARY}
            interactive={false}
            pathOptions={{ color: '#243b53', weight: 2, dashArray: '6 5', fillColor: '#8f1324', fillOpacity: 0.04 }}
          />
          <ZoomWatcher onZoom={setZoom} />
          {zoom < PLACE_LABEL_ZOOM && (
            <Marker position={[CAMPUS_CENTER.lat, CAMPUS_CENTER.lng]} icon={campusIcon} title={CAMPUS_NAME} keyboard={!preview} interactive={!preview} zIndexOffset={-100}>
              <Popup>
                <p className="font-semibold text-slate-900">{CAMPUS_NAME}</p>
                <p className="mt-0.5 text-xs text-slate-600">{CAMPUS_ADDRESS}</p>
              </Popup>
            </Marker>
          )}
          <PlaceLabels zoom={zoom} />

          {reports.map((r) => (
            <Marker
              key={r.id}
              position={[r.lat, r.lng]}
              icon={pinIcon(r.status, r.priority === 'Urgent' && r.status !== 'Resolved', r.id === selectedId)}
              title={`${r.id}: ${r.title} (${r.status})`}
              alt={`${r.title}, ${r.status}`}
              zIndexOffset={r.id === selectedId ? 500 : r.priority === 'Urgent' ? 200 : 0}
              eventHandlers={onMarkerSelect ? { click: () => onMarkerSelect(r) } : undefined}
            >
              {!onMarkerSelect && (
                <Popup>
                  <PinSummary report={r} onView={onViewReport} />
                </Popup>
              )}
            </Marker>
          ))}

          {onPick && <ClickToPick onPick={onPick} />}
          {onPick && pick && (
            <Marker
              position={[pick.lat, pick.lng]}
              icon={pickIcon}
              draggable
              title="Selected report location. Drag to adjust."
              zIndexOffset={1000}
              eventHandlers={{
                dragend: (e) => {
                  const ll = (e.target as L.Marker).getLatLng()
                  onPick({ lat: ll.lat, lng: ll.lng })
                },
              }}
            />
          )}
        </MapContainer>

        {!preview && (
          <button type="button" onClick={recenter} className="focusable absolute right-2.5 top-2.5 z-10 inline-flex min-h-9 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 active:bg-slate-100">
            <Crosshair size={14} aria-hidden />Return to CSU Carig
          </button>
        )}
      </div>
    </MapErrorBoundary>
  )
}

function PinSummary({ report, onView }: { report: Report; onView?: (r: Report) => void }) {
  return (
    <div className="w-56">
      <p className="text-[11px] font-medium text-slate-500">{report.id} · {report.category}</p>
      <p className="mt-0.5 text-sm font-semibold leading-snug text-slate-900">{report.title}</p>
      <p className="mt-1 text-xs text-slate-600">{buildingName(report.buildingId)}{report.locationDetail ? ` · ${report.locationDetail}` : ''}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <PriorityBadge priority={report.priority} />
        <StatusBadge status={report.status} />
      </div>
      {onView && (
        <button type="button" onClick={() => onView(report)} className="btn-secondary btn-sm mt-3 w-full">View details</button>
      )}
    </div>
  )
}

export function MapLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600" aria-label="Map legend">
      {STATUSES.map((s) => (
        <li key={s} className="flex items-center gap-1.5">
          <span aria-hidden className="h-3 w-3 rounded-full ring-2 ring-white" style={{ background: STATUS_HEX[s] }} />{s}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span aria-hidden className="grid h-4 w-4 place-items-center rounded-full bg-slate-700 text-[10px] font-bold text-white dark:bg-slate-300">!</span>Urgent
      </li>
    </ul>
  )
}
