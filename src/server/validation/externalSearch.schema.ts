import { z } from 'zod';

const MAX_KM = Number(process.env.GEO_MAX_RADIUS_KM || 50);
const DEFAULT_KM = Number(process.env.GEO_DEFAULT_RADIUS_KM || 10);

const base = {
  type: z.enum(['vet', 'shelter']).default('vet'),
  radiusKm: z.coerce.number().min(1).max(MAX_KM).default(DEFAULT_KM),
  take: z.coerce.number().int().min(1).max(50).default(20),
  page: z.coerce.number().int().min(1).max(1000).default(1),
};

const ByZip = z.object({
  zip: z.string().regex(/^\d{5}$/),
  lat: z.any().optional(),
  lng: z.any().optional(),
  ...base,
});

const ByCoords = z.object({
  zip: z.any().optional(),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  ...base,
});

export const ExternalSearchSchema = z.union([ByZip, ByCoords]);
export type SearchExternalQuery = z.infer<typeof ExternalSearchSchema>;

