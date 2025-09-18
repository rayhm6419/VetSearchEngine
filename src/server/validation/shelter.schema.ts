import { z } from 'zod';

export const ShelterIdParamSchema = z.object({
  // Petfinder org IDs can be alphanumeric like "WA06"
  id: z.string().regex(/^[A-Za-z0-9]+$/, 'id must be an alphanumeric Petfinder id'),
});

export const ListShelterReviewsQuerySchema = z.object({
  take: z.coerce.number().int().min(1).max(50).default(20),
  skip: z.coerce.number().int().min(0).max(500).default(0),
});

export const CreateShelterReviewBodySchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().min(1).max(2000),
  recommended: z.boolean(),
});

export type ShelterIdParam = z.infer<typeof ShelterIdParamSchema>;
