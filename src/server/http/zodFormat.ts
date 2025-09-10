import { ZodError } from 'zod';

export function formatZodError(err: ZodError) {
  const first = err.issues?.[0];
  if (!first) return 'Invalid request payload';
  const path = first.path?.length ? `${first.path.join('.')}: ` : '';
  return `${path}${first.message}`;
}

