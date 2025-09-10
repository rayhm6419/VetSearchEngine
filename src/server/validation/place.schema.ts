import { z } from 'zod';

export const PlaceIdParamSchema = z.object({
  id: z.string().refine(
    (v) => /^[0-9a-fA-F-]{36}$/.test(v) || v.startsWith('c') || /^[0-9]+$/.test(v),
    'id must be a cuid, uuid, or known seeded id'
  ),
});

export const ListReviewsQuerySchema = z.object({
  take: z.coerce.number().int().min(1).max(50).default(20),
  skip: z.coerce.number().int().min(0).max(500).default(0),
});

export type PlaceIdParam = z.infer<typeof PlaceIdParamSchema>;
export type ListReviewsQuery = z.infer<typeof ListReviewsQuerySchema>;

