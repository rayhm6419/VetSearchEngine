const buckets = new Map<string, { count: number; first: number }>();

export function checkRateLimit(ip: string, limit = 30, windowMs = 5 * 60 * 1000) {
  const now = Date.now();
  const ent = buckets.get(ip);
  if (!ent) { buckets.set(ip, { count: 1, first: now }); return { allowed: true }; }
  if (now - ent.first > windowMs) { buckets.set(ip, { count: 1, first: now }); return { allowed: true }; }
  ent.count += 1; buckets.set(ip, ent);
  return { allowed: ent.count <= limit, retryAfterSec: Math.ceil((ent.first + windowMs - now) / 1000) };
}

