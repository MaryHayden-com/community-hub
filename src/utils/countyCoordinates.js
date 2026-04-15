// Approximate centroid coordinates for each Irish county
export const COUNTY_CENTROIDS = [
  { county: "Carlow", lat: 52.7236, lng: -6.8260 },
  { county: "Cavan", lat: 53.9908, lng: -7.3601 },
  { county: "Clare", lat: 52.9045, lng: -8.9815 },
  { county: "Cork", lat: 51.8969, lng: -8.4863 },
  { county: "Donegal", lat: 54.6538, lng: -8.1096 },
  { county: "Dublin", lat: 53.3498, lng: -6.2603 },
  { county: "Galway", lat: 53.2707, lng: -9.0568 },
  { county: "Kerry", lat: 52.1545, lng: -9.5669 },
  { county: "Kildare", lat: 53.1570, lng: -6.9142 },
  { county: "Kilkenny", lat: 52.6541, lng: -7.2448 },
  { county: "Laois", lat: 52.9943, lng: -7.3318 },
  { county: "Leitrim", lat: 54.1240, lng: -8.0018 },
  { county: "Limerick", lat: 52.4680, lng: -8.6238 },
  { county: "Longford", lat: 53.7276, lng: -7.7937 },
  { county: "Louth", lat: 53.9258, lng: -6.4850 },
  { county: "Mayo", lat: 53.8477, lng: -9.3003 },
  { county: "Meath", lat: 53.6055, lng: -6.6564 },
  { county: "Monaghan", lat: 54.2492, lng: -6.9683 },
  { county: "Offaly", lat: 53.2357, lng: -7.7122 },
  { county: "Roscommon", lat: 53.6332, lng: -8.1819 },
  { county: "Sligo", lat: 54.1553, lng: -8.6069 },
  { county: "Tipperary", lat: 52.6738, lng: -7.8129 },
  { county: "Waterford", lat: 52.2593, lng: -7.1101 },
  { county: "Westmeath", lat: 53.5345, lng: -7.4653 },
  { county: "Wexford", lat: 52.3369, lng: -6.4633 },
  { county: "Wicklow", lat: 52.9808, lng: -6.3748 },
];

// Haversine distance in km between two lat/lng points
export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Returns counties sorted by distance from the given coords, up to maxKm
export function getCountiesNearby(lat, lng, maxKm = 80) {
  return COUNTY_CENTROIDS
    .map((c) => ({ ...c, distanceKm: haversineKm(lat, lng, c.lat, c.lng) }))
    .filter((c) => c.distanceKm <= maxKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

// Returns the single nearest county name
export function getNearestCounty(lat, lng) {
  let best = null;
  let bestDist = Infinity;
  for (const c of COUNTY_CENTROIDS) {
    const d = haversineKm(lat, lng, c.lat, c.lng);
    if (d < bestDist) { bestDist = d; best = c.county; }
  }
  return best;
}