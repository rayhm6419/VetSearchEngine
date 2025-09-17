const KM_TO_MILES = 0.621371;

export function formatDistanceMiles(distanceKm: number): string {
  if (!Number.isFinite(distanceKm)) {
    return '';
  }

  const distanceMiles = distanceKm * KM_TO_MILES;

  if (distanceMiles < 0.1) {
    return '<0.1 mi away';
  }

  const precision = distanceMiles >= 10 ? 0 : 1;
  const formatted = distanceMiles.toFixed(precision);

  return `${formatted} mi away`;
}

export function kmToMiles(distanceKm: number): number {
  return distanceKm * KM_TO_MILES;
}