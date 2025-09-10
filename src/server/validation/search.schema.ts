import { z } from 'zod';

export const SearchQuerySchema = z.object({
  zip: z.string().length(5, 'zip must be 5 digits'),
  type: z.enum(['vet', 'shelter']).optional(),
  radiusKm: z.coerce.number().int().min(1).max(100).optional(),
  take: z.coerce.number().int().min(1).max(50).default(20),
  skip: z.coerce.number().int().min(0).max(500).default(0),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

