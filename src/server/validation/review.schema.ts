import { z } from 'zod';

export const CreateReviewBodySchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().min(1).max(1000),
});

export type CreateReviewBody = z.infer<typeof CreateReviewBodySchema>;

