import { Place, PlaceSortOption } from '@/lib/types';
import { headers } from 'next/headers';

export type SearchDTO = {
  initialPlaces: Place[];
  zipParam?: string | null;
  center?: { lat: number; lng: number };
  radiusKm?: number;
  sort?: PlaceSortOption;
};
export async function getSearchResults(params: { zip?: string | null; lat?: number | null; lng?: number | null; radiusKm?: number | null; type?: 'vet' | 'shelter' | 'all' | null; sort?: PlaceSortOption | null; } = {}): Promise<SearchDTO> {
  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000';
  const proto = h.get('x-forwarded-proto') || 'http';
  const base = `${proto}://${host}`;
  const qs = new URLSearchParams();
  const hasZip = Boolean(params.zip);
  const hasCoords = params.lat != null && params.lng != null;
  if (!hasZip && !hasCoords) {
    // No location provided: return an empty dataset instead of calling API (avoids 400)
    return { initialPlaces: [], zipParam: undefined };
  }
  if (params.zip) qs.set('zip', String(params.zip));
  if (params.lat != null && params.lng != null) {
    qs.set('lat', String(params.lat));
    qs.set('lng', String(params.lng));
  }
  if (params.radiusKm != null) qs.set('radiusKm', String(params.radiusKm));
  if (params.type) qs.set('type', params.type);
  if (params.sort) qs.set('sort', params.sort);
  const r = await fetch(`${base}/api/search?${qs.toString()}`, { cache: 'no-store' });
  const json = await r.json().catch(() => null);
  if (!r.ok) {
    const msg = json?.error?.message || `http_${r.status}`;
    throw new Error(`search_failed: ${msg}`);
  }
  if (!json?.ok) throw new Error(json?.error?.message || 'search_failed');
  const { center, radiusKm } = json.data || {};
  return {
    initialPlaces: json.data.items as Place[],
    zipParam: params.zip ?? undefined,
    center,
    radiusKm,
    sort: params.sort ?? undefined,
  };
}
