import { AppError } from '@/server/http/errors';
import { PlaceDTO } from '@/server/types/place';
import { haversineKm, kmToMeters } from '@/server/utils/geo';

function getEnv() {
  let key = process.env.GOOGLE_MAPS_API_KEY;
  if (key) key = key.trim().replace(/^['"]|['"]$/g, '');
  const timeoutMs = Number(process.env.HTTP_TIMEOUT_MS || 10000);
  if (!key) throw new AppError('GOOGLE_CONFIG', 'Missing GOOGLE_MAPS_API_KEY', 502);
  return { key, timeoutMs };
}

export async function searchNearbyVets(params: {
  lat: number; lng: number; radiusKm: number; take: number; pagetoken?: string;
}): Promise<{ items: PlaceDTO[]; nextPageToken?: string }> {
  const { key, timeoutMs } = getEnv();
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
    if (params.pagetoken) {
      url.searchParams.set('pagetoken', params.pagetoken);
      url.searchParams.set('key', key);
    } else {
      url.searchParams.set('location', `${params.lat},${params.lng}`);
      url.searchParams.set('radius', String(kmToMeters(params.radiusKm)));
      url.searchParams.set('type', 'veterinary_care');
      url.searchParams.set('key', key);
    }
    const res = await fetch(url.toString(), { signal: controller.signal });
    if (!res.ok) throw new AppError('GOOGLE_PLACES_ERROR', `HTTP ${res.status}`, 502);
    const json = await res.json();
    const status: string = json.status;
    if (status === 'ZERO_RESULTS') return { items: [] };
    if (status !== 'OK') {
      if (['OVER_QUERY_LIMIT', 'REQUEST_DENIED', 'INVALID_REQUEST'].includes(status)) {
        throw new AppError('GOOGLE_PLACES_ERROR', status, 502);
      }
      throw new AppError('GOOGLE_PLACES_ERROR', status || 'Unknown error', 502);
    }
    const results: any[] = Array.isArray(json.results) ? json.results : [];
    const center = { lat: params.lat, lng: params.lng };
    let items: PlaceDTO[] = results.map((r) => {
      const loc = r.geometry?.location || {};
      const lat = typeof loc.lat === 'number' ? loc.lat : null;
      const lng = typeof loc.lng === 'number' ? loc.lng : null;
      const distanceKm = lat != null && lng != null ? haversineKm(center.lat, center.lng, lat, lng) : null;
      return {
        externalId: r.place_id,
        name: r.name,
        type: 'vet',
        phone: null,
        website: null,
        address: r.vicinity || r.formatted_address || null,
        zipcode: null,
        lat,
        lng,
        distanceKm,
        rating: typeof r.rating === 'number' ? r.rating : null,
        reviewCount: typeof r.user_ratings_total === 'number' ? r.user_ratings_total : null,
        source: 'google',
      };
    });
    // Slice to requested take
    if (items.length > params.take) items = items.slice(0, params.take);
    const nextPageToken = json.next_page_token as string | undefined;
    return { items, nextPageToken };
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new AppError('GOOGLE_PLACES_ERROR', 'Timeout', 502);
    throw e;
  } finally {
    clearTimeout(to);
  }
}

// Fetch next page using a next_page_token; Google requires a small delay after token issuance.
export async function fetchNextPage(nextPageToken: string, take = 20, center?: { lat: number; lng: number }) {
  // Give Google time to activate the token (client should have already delayed)
  const { items } = await searchNearbyVets({ lat: center?.lat || 0, lng: center?.lng || 0, radiusKm: 1, take, pagetoken: nextPageToken });
  return { items };
}
