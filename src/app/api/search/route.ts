import { NextRequest, NextResponse } from 'next/server';
import { apiError, apiResponse } from '@/server/http/apiResponse';
import { formatZodError } from '@/server/http/zodFormat';
import { withRequestLog } from '@/server/http/log';
import { AppError } from '@/server/http/errors';
import { ExternalSearchSchema } from '@/server/validation/externalSearch.schema';
import { searchExternal } from '@/server/search/aggregate';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  return withRequestLog('GET /api/search (nodb)', async () => {
    try {
      const url = new URL(req.url);
      const params = Object.fromEntries(url.searchParams);
      // Basic in-memory throttle
      const ip = req.headers.get('x-forwarded-for') || req.ip || 'local';
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

      // Provider-aware type fallback to avoid 502 on missing keys
      const hasYelp = Boolean(process.env.YELP_API_KEY);
      const hasPF = Boolean(process.env.PETFINDER_CLIENT_ID && process.env.PETFINDER_CLIENT_SECRET);
      const wanted = parsed.data.type;
      let effectiveType = wanted;
      if (wanted === 'vet' && !hasYelp && hasPF) effectiveType = 'shelter';
      if (wanted === 'shelter' && !hasPF && hasYelp) effectiveType = 'vet';
      if (!hasYelp && !hasPF) return apiError('CONFIG', 'No external providers configured', 502);

      const data = await searchExternal({ ...parsed.data, type: effectiveType });
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
