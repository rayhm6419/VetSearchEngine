import { NextRequest, NextResponse } from 'next/server';
import { apiError, apiResponse } from '@/server/http/apiResponse';
import { formatZodError } from '@/server/http/zodFormat';
import { withRequestLog } from '@/server/http/log';
import { AppError } from '@/server/http/errors';
import { ExternalSearchSchema } from '@/server/validation/externalSearch.schema';
import { searchExternal } from '@/server/search/aggregate';
import { PlacesSearchSchema } from '@/server/validation/places.schema';
import { searchVetsByLocation } from '@/server/search/googleVets';
import { cacheGet, cacheKey, cacheSet } from '@/server/cache/memoryCache';
import { checkRateLimit } from '@/server/middleware/rateLimit';
import { logInfo } from '@/server/utils/logger';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  return withRequestLog('GET /api/search (nodb)', async () => {
    try {
      const url = new URL(req.url);
      const params = Object.fromEntries(url.searchParams);
      const startMs = Date.now();
      // Special case: type=all -> merge vets + shelters
      if (params.type === 'all') {
        // Rate limit + cache
        const ip = (req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()) || req.headers.get('x-real-ip') || 'local';
        const rl = checkRateLimit(ip);
        if (!rl.allowed) { const r = apiError('RATE_LIMITED', 'Too many requests, try later.', 429); if (rl.retryAfterSec) (r.headers as any).set('Retry-After', String(rl.retryAfterSec)); return r; }
        const allKey = cacheKey({ type: 'all', ...params });
        const cachedAll = cacheGet<NextResponse>(allKey);
        if (cachedAll) return cachedAll;

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
          } catch {
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
        cacheSet(allKey, res, 60_000);
        logInfo('search_all', { zip: params.zip, lat: centerLat, lng: centerLng, count: items.length, ms: Date.now() - startMs });
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
      const rl2 = checkRateLimit(`${ip}|${qKey}`);
      if (!rl2.allowed) { const r = apiError('RATE_LIMITED', 'Too many requests, try later.', 429); if (rl2.retryAfterSec) (r.headers as any).set('Retry-After', String(rl2.retryAfterSec)); return r; }

      const parsed = ExternalSearchSchema.safeParse(params);
      if (!parsed.success) return apiError('BAD_REQUEST', formatZodError(parsed.error), 400);

      // If vet, route to Google Places
      if (parsed.data.type === 'vet') {
        const key = cacheKey({ type: 'vet', ...params });
        const cachedVet = cacheGet<NextResponse>(key);
        if (cachedVet) return cachedVet;
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
        cacheSet(key, res, 60_000);
        logInfo('search_vet', { zip: params.zip, lat: data.center.lat, lng: data.center.lng, count: data.items.length, ms: Date.now() - startMs });
        return res as NextResponse;
      }

      // Shelter path (or fallback when vets unavailable)
      const hasYelp = Boolean(process.env.YELP_API_KEY);
      const hasPF = Boolean(process.env.PETFINDER_CLIENT_ID && process.env.PETFINDER_CLIENT_SECRET);
      if (!hasYelp && !hasPF) return apiError('CONFIG', 'No external providers configured', 502);

      if (hasPF) {
        const key = cacheKey({ type: 'shelter', ...params });
        const cachedShelter = cacheGet<NextResponse>(key);
        if (cachedShelter) return cachedShelter;
        // Use Petfinder via existing aggregate service (expects type='shelter')
        const data = await searchExternal({ ...parsed.data, type: 'shelter' });
        const res = apiResponse(data);
        res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
        cacheSet(key, res, 60_000);
        logInfo('search_shelter', { zip: params.zip, lat: (data as any).center?.lat, lng: (data as any).center?.lng, count: (data as any).items?.length, ms: Date.now() - startMs });
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

// legacy rate-limit removed (using middleware instead)
