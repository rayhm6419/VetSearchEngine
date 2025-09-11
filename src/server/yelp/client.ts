import { AppError } from '@/server/http/errors';

function getEnv() {
  const baseUrl = process.env.YELP_BASE_URL || 'https://api.yelp.com/v3';
  const apiKey = process.env.YELP_API_KEY;
  const timeoutMs = Number(process.env.HTTP_TIMEOUT_MS || 10000);
  if (!apiKey) throw new AppError('YELP_AUTH', 'Missing YELP_API_KEY', 502);
  return { baseUrl, apiKey, timeoutMs };
}

export async function searchVets({ lat, lng, radiusKm, limit, page }: { lat: number; lng: number; radiusKm: number; limit: number; page: number; }) {
  const { baseUrl, apiKey, timeoutMs } = getEnv();
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeoutMs);
  const radiusM = Math.min(Math.max(1, Math.round(radiusKm * 1000)), 40000);
  const offset = Math.max(0, (page - 1) * limit);
  const url = new URL(`${baseUrl}/businesses/search`);
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lng));
  url.searchParams.set('radius', String(radiusM));
  url.searchParams.set('term', 'veterinarian');
  url.searchParams.set('categories', 'veterinarians');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('offset', String(offset));
  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    });
    if (res.status === 429) throw new AppError('YELP_RATE_LIMIT', 'Yelp rate limited', 429);
    if (!res.ok) throw new AppError('YELP_UPSTREAM', `Yelp http ${res.status}`, 502);
    const json = await res.json();
    return { businesses: json.businesses || [], total: json.total || 0 };
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new AppError('YELP_UPSTREAM', 'Yelp timeout', 502);
    throw e;
  } finally {
    clearTimeout(to);
  }
}

