import { AppError } from '@/server/http/errors';
import { SearchExternalQuery } from '@/server/validation/externalSearch.schema';
import { geocodeZip } from '@/server/geo/geocode';
import { searchOrganizations } from '@/server/petfinder/client';
import { toPlaceDTO as mapOrg } from '@/server/petfinder/mappers';
import { searchVets } from '@/server/yelp/client';
import { mapBusinessToPlace } from '@/server/yelp/mappers';
import { Place } from '@/lib/types';
import { sortPlaces } from '@/lib/placeSort';
import { haversineKm } from '@/server/geo/distance';

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
function kmToMi(km: number) { return km * 0.621371; }

export async function searchExternal(params: SearchExternalQuery): Promise<{
  items: Place[];
  pagination: { take: number; page: number; total?: number };
  center: { lat: number; lng: number };
  radiusKm: number;
}> {
  // Resolve center
  let lat = params.lat;
  let lng = params.lng;
  if ((lat == null || lng == null) && params.zip) {
    const c = await geocodeZip(params.zip);
    lat = c.lat; lng = c.lng;
  }
  if (lat == null || lng == null) throw new AppError('BAD_REQUEST', 'Provide zip or lat/lng', 400);

  const take = params.take;
  const page = params.page || 1;
  const radiusKm = params.radiusKm;
  const center = { lat, lng };

  let items: Place[] = [];
  let total: number | undefined = undefined;

  if (params.type === 'shelter') {
    const distanceMi = clamp(kmToMi(radiusKm), 1, Number(process.env.PETFINDER_MAX_DISTANCE_MI || 100));
    const res = await searchOrganizations({ centerLat: lat, centerLng: lng, zip: params.zip, distanceMi, limit: take, page });
    items = res.items.map(o => mapOrg(o, center));
    total = res.raw?.pagination?.total_count || undefined;
  } else {
    // default to vets (Yelp)
    const res = await searchVets({ lat, lng, radiusKm, limit: take, page });
    items = res.businesses.map(mapBusinessToPlace);
    total = res.total;
  }

  // Ensure distanceKm exists when coords present
  for (const it of items) {
    if (typeof it.distanceKm !== 'number' && typeof it.lat === 'number' && typeof it.lng === 'number') {
      it.distanceKm = Number(haversineKm(lat, lng, it.lat, it.lng).toFixed(3));
    }
  }

  sortPlaces(items, params.sort ?? 'distance');

  return { items, pagination: { take, page, total }, center, radiusKm };
}
