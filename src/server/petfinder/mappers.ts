import { Place } from '@/lib/types';
import { haversineKm } from '@/server/geo/distance';

function normalizePhone(phone?: string | null): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/\D+/g, '');
  return digits || undefined;
}

function normalizeUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    // drop tracking params
    u.hash = '';
    return u.toString().replace(/\/$/, '');
  } catch {
    return undefined;
  }
}

function joinAddress(a: any): string {
  if (!a) return '';
  const parts = [a.address1, a.address2, a.city, a.state, a.postcode].filter(Boolean);
  return parts.join(', ');
}

export function toPlaceDTO(org: any, center?: { lat: number; lng: number }): Place {
  const lat = org?.coordinates?.latitude ?? null;
  const lng = org?.coordinates?.longitude ?? null;
  const website = normalizeUrl(org?.website || org?.url || undefined);
  const phone = normalizePhone(org?.phone || undefined);
  let distanceKm = center && lat != null && lng != null
    ? Number(haversineKm(center.lat, center.lng, Number(lat), Number(lng)).toFixed(3))
    : undefined;
  if (distanceKm === undefined && typeof org?.distance === 'number' && Number.isFinite(org.distance)) {
    distanceKm = Number((org.distance * 1.60934).toFixed(3));
  }
  return {
    id: `petfinder:${org.id}`,
    externalId: String(org.id),
    name: org.name || 'Unknown shelter',
    type: 'shelter',
    phone,
    website,
    address: joinAddress(org.address),
    zipcode: org?.address?.postcode || '',
    lat: lat == null ? undefined : Number(lat),
    lng: lng == null ? undefined : Number(lng),
    priceLevel: undefined as any,
    services: Array.isArray(org?.services) ? org.services.map((s: any) => s?.name).filter(Boolean) : [],
    rating: undefined,
    reviewCount: undefined,
    photos: undefined,
    hours: undefined,
    distanceKm,
    source: 'petfinder',
  };
}

export function dedupePlaces(items: Place[]): Place[] {
  const byExt = new Set<string>();
  const byPhone = new Set<string>();
  const byWeb = new Set<string>();
  const out: Place[] = [];
  for (const it of items) {
    const keyExt = it.externalId ? `ext:${it.externalId}` : null;
    const keyPhone = it.phone ? `ph:${it.phone.replace(/\D+/g,'')}` : null;
    const keyWeb = it.website ? `web:${(it.website || '').replace(/\/$/,'')}` : null;

    if (keyExt && byExt.has(keyExt)) continue;
    if (keyPhone && byPhone.has(keyPhone)) continue;
    if (keyWeb && byWeb.has(keyWeb)) continue;

    if (keyExt) byExt.add(keyExt);
    if (keyPhone) byPhone.add(keyPhone);
    if (keyWeb) byWeb.add(keyWeb);
    out.push(it);
  }
  return out;
}

