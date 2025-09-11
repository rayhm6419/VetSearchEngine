import { AppError } from '@/server/http/errors';

function getEnv() {
  let key = process.env.GOOGLE_MAPS_API_KEY;
  if (key) key = key.trim().replace(/^['"]|['"]$/g, '');
  const timeoutMs = Number(process.env.HTTP_TIMEOUT_MS || 10000);
  if (!key) throw new AppError('GOOGLE_CONFIG', 'Missing GOOGLE_MAPS_API_KEY', 502);
  return { key, timeoutMs };
}

export async function geocodeZip(zip: string): Promise<{ lat: number; lng: number; zipcode: string }> {
  const { key, timeoutMs } = getEnv();
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeoutMs);
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address', zip);
  url.searchParams.set('key', key);
  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    if (!res.ok) throw new AppError('GOOGLE_GEOCODE_ERROR', `HTTP ${res.status}`, 502);
    const json = await res.json();
    const status = json.status;
    if (status !== 'OK' || !Array.isArray(json.results) || json.results.length === 0) {
      if (status === 'ZERO_RESULTS') throw new AppError('BAD_REQUEST', 'ZIP not found', 400);
      throw new AppError('GOOGLE_GEOCODE_ERROR', status || 'Unknown error', 502);
    }
    const r = json.results[0];
    const loc = r.geometry?.location;
    const lat = Number(loc?.lat);
    const lng = Number(loc?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new AppError('GOOGLE_GEOCODE_ERROR', 'Missing coordinates', 502);
    // Try to extract normalized postal code
    const comp = (r.address_components || []).find((c: any) => (c.types || []).includes('postal_code'));
    const zipcode = comp?.short_name || zip;
    return { lat, lng, zipcode };
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new AppError('GOOGLE_GEOCODE_ERROR', 'Timeout', 502);
    throw e;
  } finally {
    clearTimeout(to);
  }
}
