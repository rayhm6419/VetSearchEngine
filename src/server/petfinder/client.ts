import { AppError } from '@/server/http/errors';
import { tokenStore } from './tokenStore';

function getEnv() {
  const baseUrl = process.env.PETFINDER_BASE_URL || 'https://api.petfinder.com/v2';
  const timeoutMs = Number(process.env.PETFINDER_TIMEOUT_MS || 10000);
  const maxMi = Number(process.env.PETFINDER_MAX_DISTANCE_MI || 100);
  return { baseUrl, timeoutMs, maxMi };
}

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

export type OrgSearchParams = {
  centerLat?: number;
  centerLng?: number;
  zip?: string;
  distanceMi: number; // 1..max
  limit: number;      // <= 100
  page: number;       // >= 1
};

export async function searchOrganizations(params: OrgSearchParams): Promise<{
  items: any[];
  pagination: { currentPage: number; totalPages?: number };
  raw: any;
}> {
  const { baseUrl, timeoutMs, maxMi } = getEnv();
  const token = await tokenStore.getToken();
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const location = params.zip || `${params.centerLat},${params.centerLng}`;
    // Petfinder expects integer miles; decimals cause 400
    const distance = Math.round(clamp(params.distanceMi, 1, maxMi));
    const limit = Math.min(Math.max(Math.trunc(params.limit || 20), 1), 100);
    const page = Math.max(Math.trunc(params.page || 1), 1);
    const url = new URL(`${baseUrl}/organizations`);
    url.searchParams.set('location', location);
    url.searchParams.set('distance', String(distance));
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('page', String(page));

    const doFetch = async (bearer: string) => fetch(url.toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${bearer}` },
      signal: controller.signal,
    });

    let res = await doFetch(token.accessToken);
    if (res.status === 401) {
      const fresh = await tokenStore.refreshToken();
      res = await doFetch(fresh.accessToken);
    }
    if (res.status === 429) {
      const retryAfter = res.headers.get('retry-after') || undefined;
      const err: any = new AppError('PETFINDER_RATE_LIMIT', 'Upstream rate limited', 429);
      (err as any).retryAfter = retryAfter;
      throw err;
    }
    if (!res.ok) {
      if (process.env.NODE_ENV !== 'production') console.warn('petfinder_upstream_error', { status: res.status, url: url.toString() });
      throw new AppError('PETFINDER_UPSTREAM', `Upstream error ${res.status}`, 502);
    }
    const json = await res.json();
    const items = Array.isArray(json.organizations) ? json.organizations : [];
    const pagination = { currentPage: page, totalPages: json.pagination?.total_pages };
    return { items, pagination, raw: json };
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new AppError('PETFINDER_UPSTREAM', 'Upstream timeout', 502);
    throw e;
  } finally {
    clearTimeout(to);
  }
}

export async function getOrganization(id: string): Promise<any> {
  const { baseUrl, timeoutMs } = getEnv();
  const token = await tokenStore.getToken();
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeoutMs);
  const url = `${baseUrl}/organizations/${encodeURIComponent(id)}`;
  try {
    let res = await fetch(url, { headers: { Authorization: `Bearer ${token.accessToken}` }, signal: controller.signal });
    if (res.status === 401) {
      const fresh = await tokenStore.refreshToken();
      res = await fetch(url, { headers: { Authorization: `Bearer ${fresh.accessToken}` }, signal: controller.signal });
    }
    if (res.status === 429) {
      const err: any = new AppError('PETFINDER_RATE_LIMIT', 'Upstream rate limited', 429);
      (err as any).retryAfter = res.headers.get('retry-after') || undefined;
      throw err;
    }
    if (res.status === 404) throw new AppError('NOT_FOUND', 'Shelter not found', 404);
    if (!res.ok) throw new AppError('PETFINDER_UPSTREAM', `Upstream error ${res.status}`, 502);
    const json = await res.json();
    return json?.organization || null;
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new AppError('PETFINDER_UPSTREAM', 'Upstream timeout', 502);
    throw e;
  } finally {
    clearTimeout(to);
  }
}
