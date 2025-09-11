// Great-circle distance using the Haversine formula
// Returns kilometers between two [lat, lng] points
export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371; // km
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

// Compute a simple bounding box around a center for a given radius (km)
export function boundingBox({ lat, lng, radiusKm }: { lat: number; lng: number; radiusKm: number }) {
  const R = 6371; // km
  const latDelta = (radiusKm / R) * (180 / Math.PI);
  const lngDelta = (radiusKm / (R * Math.cos((lat * Math.PI) / 180))) * (180 / Math.PI);
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

