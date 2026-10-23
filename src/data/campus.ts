import type { Building, LatLng } from '../types'

/**
 * Verified campus geography for Cagayan State University – Carig Campus.
 *
 * - CAMPUS_CENTER: coordinates published on the official CSU campus page
 *   (https://csu.edu.ph/campuses → Carig Campus: 17.659049, 121.753178,
 *   Carig Sur, Tuguegarao City, Cagayan 3500).
 * - CAMPUS_BOUNDARY: the "Cagayan State University" amenity=university polygon
 *   in OpenStreetMap (way 976242857), retrieved through Nominatim. The official
 *   CSU point falls inside this polygon.
 * - BUILDINGS: named building features inside that polygon in OpenStreetMap.
 *   Coordinates are the feature centroids returned by the Overpass API.
 *
 * Map data © OpenStreetMap contributors (ODbL).
 */
export const CAMPUS_NAME = 'Cagayan State University – Carig Campus'
export const CAMPUS_ADDRESS = 'Carig Sur, Tuguegarao City, Cagayan 3500, Philippines'
export const CAMPUS_CENTER: LatLng = { lat: 17.659049, lng: 121.753178 }
export const CAMPUS_ZOOM = 17

export const CAMPUS_BOUNDARY: [number, number][] = [
  [17.6581255, 121.7499226], [17.6571473, 121.7518674], [17.6570354, 121.7520609],
  [17.6563004, 121.7533313], [17.6574314, 121.754054], [17.6582079, 121.7545362],
  [17.659234, 121.7551211], [17.6597159, 121.7554356], [17.6599114, 121.755559],
  [17.6602336, 121.7549825], [17.6609942, 121.7535357], [17.6617786, 121.7520113],
  [17.6610389, 121.7515606], [17.6610231, 121.7515971], [17.6609489, 121.7515617],
  [17.6605831, 121.7513493], [17.660134, 121.7510805], [17.6601031, 121.7510664],
  [17.6600592, 121.7511725], [17.6599758, 121.7511841], [17.6599098, 121.7511379],
  [17.6598509, 121.7510967], [17.659837, 121.7510092], [17.6598758, 121.7509257],
  [17.6598332, 121.7509038], [17.6591071, 121.7504695], [17.6581956, 121.7499608],
  [17.6581255, 121.7499226],
]

/** Generous bounds around the campus so users can pan a little but not get lost. */
export const CAMPUS_MAX_BOUNDS: [[number, number], [number, number]] = [
  [17.6505, 121.7430],
  [17.6680, 121.7620],
]

export const OPEN_GROUNDS_ID = 'grounds'

/**
 * Names and coordinates come from OpenStreetMap (see header). `kind` and `aliases`
 * only describe those same features to make them searchable; no places are added.
 */
export const BUILDINGS: Building[] = [
  { id: 'admin', name: 'Administration Building', lat: 17.659715, lng: 121.75228, osmId: 'way/152476302', short: 'Admin', kind: 'Administrative building', aliases: ['Admin', 'Admin Bldg', 'Administration'] },
  { id: 'cics', name: 'College of Information and Computing Sciences', lat: 17.657547, lng: 121.752332, osmId: 'way/152475297', short: 'CICS', kind: 'College building', aliases: ['CICS', 'Computing', 'IT', 'Information Technology', 'Computer Science'] },
  { id: 'coe', name: 'College of Engineering', lat: 17.656913, lng: 121.752863, osmId: 'way/307099793', short: 'College of Engineering', kind: 'College building', aliases: ['COE', 'Engineering'] },
  { id: 'eng', name: 'Engineering Building', lat: 17.657307, lng: 121.752724, osmId: 'way/152475296', short: 'Engineering Bldg', kind: 'Academic building', aliases: ['Engineering', 'Eng Bldg'] },
  { id: 'cas', name: 'CAS Building', lat: 17.659452, lng: 121.751584, osmId: 'way/307099677', short: 'CAS', kind: 'Academic building', aliases: ['CAS'] },
  { id: 'med', name: 'Medicine and Surgery Building', lat: 17.660677, lng: 121.752715, osmId: 'way/152476241', short: 'Medicine & Surgery', kind: 'Academic building', aliases: ['Medicine', 'Surgery', 'Med'] },
  { id: 'library', name: 'Campus Library', lat: 17.6600348, lng: 121.7530967, osmId: 'node/1654325932', short: 'Library', kind: 'Library', aliases: ['Library', 'Books', 'Reading area'] },
  { id: 'gym', name: 'CSU Carig Red Eagle Gymnasium', lat: 17.659183, lng: 121.753276, osmId: 'way/307099820', short: 'Red Eagle Gym', kind: 'Sports facility', aliases: ['Gym', 'Gymnasium', 'Red Eagle', 'Bleachers', 'Court'] },
  { id: 'dost', name: 'CSU DOST Food Innovation Center', lat: 17.658859, lng: 121.752783, osmId: 'way/307099632', short: 'DOST Food Innovation', kind: 'Research facility', aliases: ['DOST', 'Food Innovation', 'FIC', 'Laboratory'] },
  { id: 'pdtc', name: 'PDTC / Extension Office', lat: 17.658903, lng: 121.752027, osmId: 'way/307102523', short: 'PDTC / Extension', kind: 'Office', aliases: ['PDTC', 'Extension'] },
  { id: OPEN_GROUNDS_ID, name: 'Open grounds and walkways', lat: CAMPUS_CENTER.lat, lng: CAMPUS_CENTER.lng, osmId: 'way/976242857', kind: 'Outdoor areas inside the campus boundary', aliases: ['Walkway', 'Pathway', 'Grounds', 'Field', 'Outdoor', 'Open area'] },
]

export const buildingById = (id: string): Building | undefined => BUILDINGS.find((b) => b.id === id)
export const buildingName = (id: string): string => buildingById(id)?.name ?? 'Unknown location'

/** Ray-casting point-in-polygon test against the OSM campus boundary. */
export function isInsideCampus({ lat, lng }: LatLng): boolean {
  let inside = false
  for (let i = 0, j = CAMPUS_BOUNDARY.length - 1; i < CAMPUS_BOUNDARY.length; j = i++) {
    const [yi, xi] = CAMPUS_BOUNDARY[i]
    const [yj, xj] = CAMPUS_BOUNDARY[j]
    const crosses = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    if (crosses) inside = !inside
  }
  return inside
}

/** Distance in metres (equirectangular approximation, accurate at campus scale). */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const rad = Math.PI / 180
  const x = (b.lng - a.lng) * rad * Math.cos(((a.lat + b.lat) / 2) * rad)
  const y = (b.lat - a.lat) * rad
  return Math.sqrt(x * x + y * y) * 6371000
}

/** Suggests the closest mapped building, or open grounds when nothing is within 45 m. */
export function nearestBuildingId(point: LatLng): string {
  let best = OPEN_GROUNDS_ID
  let bestDistance = 45
  for (const b of BUILDINGS) {
    if (b.id === OPEN_GROUNDS_ID) continue
    const d = distanceMeters(point, b)
    if (d < bestDistance) {
      best = b.id
      bestDistance = d
    }
  }
  return best
}
