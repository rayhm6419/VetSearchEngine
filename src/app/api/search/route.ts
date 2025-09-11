import { NextRequest, NextResponse } from 'next/server';
import { apiError, apiResponse } from '@/server/http/apiResponse';
import { formatZodError } from '@/server/http/zodFormat';
import { withRequestLog } from '@/server/http/log';
import { AppError } from '@/server/http/errors';
import { ExternalSearchSchema } from '@/server/validation/externalSearch.schema';
import { searchExternal } from '@/server/search/aggregate';
import { PlacesSearchSchema } from '@/server/validation/places.schema';
import { searchVetsByLocation } from '@/server/search/googleVets';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  return withRequestLog('GET /api/search (nodb)', async () => {
    try {
      const url = new URL(req.url);
      const params = Object.fromEntries(url.searchParams);
      // Special case: type=all -> merge vets + shelters
      if (params.type === 'all') {
        // Resolve center once (prefer coords; else zip via Google Geocode then OSM fallback)
        let centerLat: number | undefined = params.lat ? Number(params.lat) : undefined;
        let centerLng: number | undefined = params.lng ? Number(params.lng) : undefined;
        const radiusKm = params.radiusKm ? Number(params.radiusKm) : Number(process.env.PLACES_DEFAULT_RADIUS_KM || 10);
        const take = Number(params.take || 20);
        const page = Number(params.page || 1);

        if ((centerLat == null || isNaN(centerLat)) || (centerLng == null || isNaN(centerLng))) {
          if (!params.zip) return apiError('BAD_REQUEST', 'Provide zip or lat/lng', 400);
          try {
            const { geocodeZip } = await import('@/server/google/geocode');
            const geo = await geocodeZip(params.zip);
            centerLat = geo.lat; centerLng = geo.lng;
          } catch (e) {
            const { geocodeZip: osmGeocode } = await import('@/server/geo/geocode');
            const geo = await osmGeocode(params.zip);
            centerLat = geo.lat; centerLng = geo.lng;
          }
        }
        // Call providers using the same center
        const { searchVetsByLocation } = await import('@/server/search/googleVets');
        const { searchSheltersGeo } = await import('@/server/services/shelterSearch');
        const [vets, shelters] = await Promise.all([
          searchVetsByLocation({ lat: centerLat, lng: centerLng, radiusKm, take, page, type: 'vet' } as any),
          searchSheltersGeo({ lat: centerLat!, lng: centerLng!, radiusKm, take, page, type: 'shelter' }),
        ]);
        const items = [...vets.items, ...shelters.items];
        // Sort combined
        items.sort((a: any, b: any) => {
          const da = a.distanceKm ?? Number.POSITIVE_INFINITY;
          const db = b.distanceKm ?? Number.POSITIVE_INFINITY;
          if (da !== db) return da - db;
          const ra = a.rating ?? -1, rb = b.rating ?? -1;
          if (rb !== ra) return rb - ra;
          const ca = a.reviewCount ?? -1, cb = b.reviewCount ?? -1;
          return cb - ca;
        });
        const res = apiResponse({ items, pagination: { take, page, total: items.length }, center: { lat: centerLat, lng: centerLng }, radiusKm });
        res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
        return res as NextResponse;
      }
      // Basic in-memory throttle
      const ip = (req.headers.get('x-forwarded-for')?.split(',')[0]?.trim())
        || req.headers.get('x-real-ip')
        || 'local';
      const qKey = JSON.stringify({
        zip: params.zip, lat: params.lat, lng: params.lng, radiusKm: params.radiusKm, type: params.type,
        take: params.take, page: params.page,
      });
      if (shouldRateLimit(`${ip}|${qKey}`)) {
        const r = apiError('RATE_LIMITED', 'Slow down', 429);
        (r.headers as any).set('Retry-After', '30');
        return r;
      }

      const parsed = ExternalSearchSchema.safeParse(params);
      if (!parsed.success) return apiError('BAD_REQUEST', formatZodError(parsed.error), 400);

      // If vet, route to Google Places
      if (parsed.data.type === 'vet') {
        const p2 = PlacesSearchSchema.safeParse({
          zip: params.zip,
          lat: params.lat,
          lng: params.lng,
          radiusKm: params.radiusKm,
          take: params.take,
          page: params.page,
          type: 'vet',
        });
        if (!p2.success) return apiError('BAD_REQUEST', formatZodError(p2.error), 400);
        const data = await searchVetsByLocation(p2.data);
        const res = apiResponse(data);
        res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
        return res as NextResponse;
      }

      // Shelter path (or fallback when vets unavailable)
      const hasYelp = Boolean(process.env.YELP_API_KEY);
      const hasPF = Boolean(process.env.PETFINDER_CLIENT_ID && process.env.PETFINDER_CLIENT_SECRET);
      if (!hasYelp && !hasPF) return apiError('CONFIG', 'No external providers configured', 502);

      if (hasPF) {
        // Use Petfinder via existing aggregate service (expects type='shelter')
        const data = await searchExternal({ ...parsed.data, type: 'shelter' });
        const res = apiResponse(data);
        res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
        return res as NextResponse;
      }
      // If Petfinder not configured but Yelp/Google is, fulfill with vets instead
      const p2 = PlacesSearchSchema.safeParse({
        zip: (params as any).zip,
        lat: (params as any).lat,
        lng: (params as any).lng,
        radiusKm: (params as any).radiusKm,
        take: (params as any).take,
        page: (params as any).page,
        type: 'vet',
      });
      if (!p2.success) return apiError('BAD_REQUEST', formatZodError(p2.error), 400);
      const data = await searchVetsByLocation(p2.data);
      const res = apiResponse(data);
      res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      return res as NextResponse;
    } catch (e: any) {
      if (e instanceof AppError) {
        const res = apiError(e.code, e.message, e.status);
        if ((e as any).retryAfter) (res.headers as any).set('Retry-After', String((e as any).retryAfter));
        return res;
      }
      if (process.env.NODE_ENV !== 'production') console.error('search_error', e);
      return apiError('INTERNAL', 'Something went wrong', 500);
    }
  });
}

const bucket = new Map<string, { count: number; first: number }>();
function shouldRateLimit(key: string) {
  const windowMs = 5 * 60 * 1000; // 5 minutes
  const limit = 30;
  const now = Date.now();
  const ent = bucket.get(key);
  if (!ent) { bucket.set(key, { count: 1, first: now }); return false; }
  if (now - ent.first > windowMs) { bucket.set(key, { count: 1, first: now }); return false; }
  ent.count += 1; bucket.set(key, ent);
  return ent.count > limit;
}
