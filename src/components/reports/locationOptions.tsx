import { MapPin } from 'lucide-react'
import { BUILDINGS, OPEN_GROUNDS_ID, distanceMeters } from '../../data/campus'
import type { LatLng } from '../../types'
import type { ComboOption } from '../ui/select/SearchableCombobox'

const formatDistance = (m: number) => (m < 1000 ? `${Math.max(5, Math.round(m / 5) * 5)} m` : `${(m / 1000).toFixed(1)} km`)

/**
 * Verified CSU Carig locations as search suggestions. When a map pin is given,
 * each building shows its distance from the pin.
 */
export function campusLocationOptions(pin?: LatLng | null): ComboOption[] {
  return BUILDINGS.map((b) => ({
    value: b.id,
    label: b.name,
    description: b.kind,
    keywords: b.aliases,
    leading: <MapPin size={16} aria-hidden />,
    meta: pin && b.id !== OPEN_GROUNDS_ID ? `${formatDistance(distanceMeters(pin, b))} from pin` : undefined,
  }))
}
