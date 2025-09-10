import { Place } from '@/lib/types';
import { headers } from 'next/headers';

export type SearchDTO = {
  initialPlaces: Place[];
  zipParam?: string | null;
};

export async function getSearchResults(zipParam?: string | null): Promise<SearchDTO> {
  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000';
  const proto = h.get('x-forwarded-proto') || 'http';
  const base = `${proto}://${host}`;
  const qs = new URLSearchParams();
  if (zipParam) qs.set('zip', zipParam);
  // Defaults: take=20, skip=0 (handled by API schema)
  const r = await fetch(`${base}/api/search?${qs.toString()}`, { cache: 'no-store' });
  if (!r.ok) throw new Error(`search_failed: ${r.status}`);
  const json = await r.json();
  if (!json?.ok) throw new Error(json?.error?.message || 'search_failed');
  return { initialPlaces: json.data.items as Place[], zipParam };
}
