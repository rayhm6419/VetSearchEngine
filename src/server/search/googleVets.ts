import { geocodeZip } from '@/server/google/geocode';
import { geocodeZip as osmGeocode } from '@/server/geo/geocode';
import { AppError } from '@/server/http/errors';
import { searchNearbyVets } from '@/server/google/places';
import { enrichVetsWithDetails } from '@/server/google/details';
import { PlacesSearchQuery } from '@/server/validation/places.schema';
import { Place, PlaceSortOption } from '@/lib/types';
import { sortPlaces } from '@/lib/placeSort';

export async function searchVetsByLocation(input: Partial<PlacesSearchQuery> & { zip?: string }) {
  let lat = input.lat as number | undefined;
  let lng = input.lng as number | undefined;
  let zip = input.zip as string | undefined;
  const radiusKm = Number(input.radiusKm || process.env.PLACES_DEFAULT_RADIUS_KM || 10);
  const take = Number(input.take || 20);
  const page = Number(input.page || 1);
  const sortOption: PlaceSortOption = input.sort === 'rating' ? 'rating' : 'distance';

  if ((lat == null || lng == null) && zip) {
    try {
      const geo = await geocodeZip(zip);
      lat = geo.lat; lng = geo.lng; zip = geo.zipcode;
    } catch (e: any) {
      // Fallback to OSM if Google geocode is denied or misconfigured
      if (e instanceof AppError && String(e.code).startsWith('GOOGLE_')) {
        const geo = await osmGeocode(zip);
        lat = geo.lat; lng = geo.lng;
      } else {
        throw e;
      }
    }
  }
  if (lat == null || lng == null) throw new Error('Missing location');

  const { items, nextPageToken } = await searchNearbyVets({ lat, lng, radiusKm, take });
  const withDetails = await enrichVetsWithDetails(items, 8);

  // Map PlaceDTO -> Place used by UI
  const mapped: Place[] = withDetails.map((p) => ({
    id: `google:${p.externalId}`,
    externalId: p.externalId,
    name: p.name,
    type: 'vet',
    phone: p.phone || undefined,
    website: p.website || undefined,
    address: p.address || '',
    zipcode: p.zipcode || zip || '',
    lat: p.lat == null ? undefined : p.lat,
    lng: p.lng == null ? undefined : p.lng,
    distanceKm: p.distanceKm == null ? undefined : p.distanceKm,
    rating: p.rating == null ? undefined : p.rating,
    reviewCount: p.reviewCount == null ? undefined : p.reviewCount,
    priceLevel: undefined,
    services: undefined,
    photos: undefined,
    hours: undefined,
    source: 'google',
  }));

  // Sort: distance, rating desc, reviewCount desc
  sortPlaces(mapped, sortOption);

  return {
    items: mapped,
    pagination: { take, page, total: mapped.length, nextPageToken },
    center: { lat, lng },
    radiusKm,
  };
}
