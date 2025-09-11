import { AppError } from '@/server/http/errors';
import { PlaceDTO } from '@/server/types/place';

function getEnv() {
  let key = process.env.GOOGLE_MAPS_API_KEY;
  if (key) key = key.trim().replace(/^['"]|['"]$/g, '');
  const timeoutMs = Number(process.env.HTTP_TIMEOUT_MS || 10000);
  if (!key) throw new AppError('GOOGLE_CONFIG', 'Missing GOOGLE_MAPS_API_KEY', 502);
  return { key, timeoutMs };
}

export async function enrichVetsWithDetails(items: PlaceDTO[], limit = 8): Promise<PlaceDTO[]> {
  const { key, timeoutMs } = getEnv();
  const slice = items.slice(0, Math.max(0, Math.min(limit, items.length)));
  const enriched = await Promise.all(slice.map(async (it) => {
    try {
      const controller = new AbortController();
      const to = setTimeout(() => controller.abort(), timeoutMs);
      const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
      url.searchParams.set('place_id', it.externalId);
      url.searchParams.set('fields', 'website,formatted_phone_number');
      url.searchParams.set('key', key);
      const res = await fetch(url.toString(), { signal: controller.signal });
      clearTimeout(to);
      if (!res.ok) return it;
      const json = await res.json();
      if (json.status !== 'OK') return it;
      const result = json.result || {};
      return {
        ...it,
        website: result.website || it.website || null,
        phone: result.formatted_phone_number || it.phone || null,
      };
    } catch {
      return it;
    }
  }));
  return [...enriched, ...items.slice(enriched.length)];
}
