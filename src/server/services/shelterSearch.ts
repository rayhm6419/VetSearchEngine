import { AppError } from '@/server/http/errors';
import { zipService } from './zipService';
import { searchOrganizations } from '@/server/petfinder/client';
import { toPlaceDTO, dedupePlaces } from '@/server/petfinder/mappers';
import { placeService } from './placeService';
import { kmToMi, ShelterSearch } from '@/server/validation/petfinder.schema';

type CacheEntry = { at: number; ttlMs: number; value: any };
const cache = new Map<string, CacheEntry>();

function key(params: any) {
  return JSON.stringify(params);
}

export async function searchSheltersGeo(params: ShelterSearch & { type?: 'shelter' }) {
  // Resolve center
  let centerLat: number | undefined = params.lat;
  let centerLng: number | undefined = params.lng;
  let resolvedZip: string | undefined;
  if ((centerLat == null || centerLng == null) && params.zip) {
    const center = await zipService.getCenter(params.zip);
    if (!center) throw new AppError('BAD_REQUEST', 'Unknown zip code', 400);
    centerLat = center.lat; centerLng = center.lng; resolvedZip = params.zip;
  }
  if (centerLat == null || centerLng == null) {
    throw new AppError('BAD_REQUEST', 'Provide zip or lat/lng', 400);
  }

  const distanceMi = Math.min(Math.max(kmToMi(params.radiusKm), 1), Number(process.env.PETFINDER_MAX_DISTANCE_MI || 100));
  const limit = params.take;
  const page = params.page || 1;

  const cacheKey = key({ zip: resolvedZip, lat: centerLat, lng: centerLng, mi: Math.round(distanceMi), limit, page });
  const dev = process.env.NODE_ENV !== 'production';
  const now = Date.now();
  const ttlMs = 60_000; // 60s
  const ent = cache.get(cacheKey);
  if (ent && now - ent.at < ent.ttlMs && !dev) return ent.value;

  const t0 = now;
  const orgs = await searchOrganizations({ centerLat, centerLng, zip: resolvedZip, distanceMi, limit, page });
  const mapped = orgs.items.map(o => toPlaceDTO(o, { lat: centerLat!, lng: centerLng! }));

  // DB merge (optional): shelters near center
  let dbItems: any[] = [];
  try {
    dbItems = await placeService.searchByRadius({ centerLat: centerLat!, centerLng: centerLng!, radiusKm: params.radiusKm, type: 'shelter', take: limit, skip: (page - 1) * limit });
  } catch {
    // ignore DB issues here to still return Petfinder results
  }
  const merged = dedupePlaces([ ...mapped, ...dbItems.map(p => ({ ...p, source: 'db' as const })) ]);
  merged.sort((a, b) => {
    const da = a.distanceKm ?? Number.POSITIVE_INFINITY;
    const db = b.distanceKm ?? Number.POSITIVE_INFINITY;
    if (da !== db) return da - db;
    const ra = a.rating ?? -1, rb = b.rating ?? -1;
    if (rb !== ra) return rb - ra;
    const ca = a.reviewCount ?? -1, cb = b.reviewCount ?? -1;
    return cb - ca;
  });

  const value = {
    items: merged,
    pagination: { take: limit, page, count: merged.length },
    center: { lat: centerLat!, lng: centerLng! },
    radiusKm: params.radiusKm,
  };
  cache.set(cacheKey, { at: now, ttlMs, value });

  if (dev) console.log('petfinder_geo_query', { method: resolvedZip ? 'zip' : 'coords', resultCount: value.items.length, ms: Date.now() - t0 });
  return value;
}

