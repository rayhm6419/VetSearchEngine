import { z } from 'zod';

const MAX_RADIUS_KM = Number(process.env.MAX_RADIUS_KM || 100);
const DEFAULT_RADIUS_KM = Number(process.env.DEFAULT_RADIUS_KM || 10);

const base = {
  type: z.enum(['vet', 'shelter']).optional(),
  radiusKm: z.coerce.number().min(1).max(MAX_RADIUS_KM).default(DEFAULT_RADIUS_KM),
  take: z.coerce.number().int().min(1).max(50).default(20),
  skip: z.coerce.number().int().min(0).max(500).default(0),
};

const ByZip = z.object({
  zip: z.string().regex(/^\d{5}$/m, 'zip must be 5 digits'),
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

export const SearchQuerySchema = z.union([ByZip, ByCoords]);

export type SearchQuery = z.infer<typeof SearchQuerySchema>;
