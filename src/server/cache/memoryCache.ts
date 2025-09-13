type Entry<T> = { value: T; expiresAt: number };

const store = new Map<string, Entry<any>>();

export function cacheGet<T>(key: string): T | undefined {
  const dev = process.env.NODE_ENV !== 'production';
  if (dev) return undefined; // skip cache in dev for DX
  const ent = store.get(key);
  if (!ent) return undefined;
  if (Date.now() > ent.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return ent.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs: number) {
  const dev = process.env.NODE_ENV !== 'production';
  if (dev) return; // no-op in dev
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function cacheKey(parts: Record<string, any>) {
  return JSON.stringify(parts, Object.keys(parts).sort());
}

