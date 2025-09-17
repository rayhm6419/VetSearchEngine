import { z } from 'zod';

const MAX_KM = Number(process.env.PLACES_MAX_RADIUS_KM || 50);
const DEFAULT_KM = Number(process.env.PLACES_DEFAULT_RADIUS_KM || 10);

const base = {
  type: z.literal('vet').default('vet'),
  radiusKm: z.coerce.number().min(1).max(MAX_KM).default(DEFAULT_KM),
  take: z.coerce.number().int().min(1).max(20).default(20),
  page: z.coerce.number().int().min(1).default(1),
  sort: z.enum(['distance', 'rating']).default('distance'),
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

export const PlacesSearchSchema = z.union([ByZip, ByCoords]);
export type PlacesSearchQuery = z.infer<typeof PlacesSearchSchema>;

