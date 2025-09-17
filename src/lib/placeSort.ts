import { Place, PlaceSortOption } from './types';

function distanceValue(place: Place) {
  return place.distanceKm ?? Number.POSITIVE_INFINITY;
}

function ratingValue(place: Place) {
  return place.rating ?? -1;
}

function reviewValue(place: Place) {
  return place.reviewCount ?? -1;
}

function compareDistanceFirst(a: Place, b: Place) {
  const da = distanceValue(a);
  const db = distanceValue(b);
  if (da !== db) return da - db;
  const ra = ratingValue(a);
  const rb = ratingValue(b);
  if (rb !== ra) return rb - ra;
  const ca = reviewValue(a);
  const cb = reviewValue(b);
  return cb - ca;
}

function compareRatingFirst(a: Place, b: Place) {
  const ra = ratingValue(a);
  const rb = ratingValue(b);
  if (rb !== ra) return rb - ra;
  const ca = reviewValue(a);
  const cb = reviewValue(b);
  if (cb !== ca) return cb - ca;
  const da = distanceValue(a);
  const db = distanceValue(b);
  return da - db;
}

export function getPlaceComparator(sort: PlaceSortOption = 'distance') {
  return sort === 'rating' ? compareRatingFirst : compareDistanceFirst;
}

export function sortPlaces<T extends Place>(items: T[], sort: PlaceSortOption = 'distance') {
  return items.sort(getPlaceComparator(sort));
}