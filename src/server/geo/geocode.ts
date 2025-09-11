import { AppError } from '@/server/http/errors';

function getEnv() {
  const baseUrl = process.env.GEOCODE_BASE_URL || 'https://nominatim.openstreetmap.org';
  const timeoutMs = Number(process.env.HTTP_TIMEOUT_MS || 10000);
  return { baseUrl, timeoutMs };
}

export async function geocodeZip(zip: string): Promise<{ lat: number; lng: number }> {
  const { baseUrl, timeoutMs } = getEnv();
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const url = new URL(`${baseUrl}/search`);
    url.searchParams.set('format', 'json');
    url.searchParams.set('postalcode', zip);
    url.searchParams.set('countrycodes', 'us');
    url.searchParams.set('limit', '1');
    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'petapp/1.0 (search; geocode)'
      },
      signal: controller.signal,
    });
    if (!res.ok) throw new AppError('GEOCODE_UPSTREAM', `Geocode http ${res.status}`, 502);
    const json: any[] = await res.json();
    const first = json?.[0];
    const lat = first ? Number(first.lat) : NaN;
    const lng = first ? Number(first.lon) : NaN;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new AppError('BAD_REQUEST', 'Unknown ZIP code', 400);
    }
    return { lat, lng };
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new AppError('GEOCODE_UPSTREAM', 'Geocode timeout', 502);
    throw e;
  } finally {
    clearTimeout(to);
  }
}

