export function parseIntQS(
  value: string | string[] | null | undefined,
  fallback: number,
  min?: number,
  max?: number
) {
  if (value == null) return fallback;
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number.parseInt(String(raw), 10);
  if (Number.isNaN(n)) return fallback;
  if (typeof min === 'number' && n < min) return min;
  if (typeof max === 'number' && n > max) return max;
  return n;
}

