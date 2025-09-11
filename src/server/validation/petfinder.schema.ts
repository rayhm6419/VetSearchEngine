import { z } from 'zod';

const MAX_KM = Math.min(Number(process.env.MAX_RADIUS_KM || 100), 160);

export const ShelterSearchQuery = z.object({
  zip: z.string().regex(/^\d{5}$/).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().min(1).max(MAX_KM).default(10),
  take: z.coerce.number().int().min(1).max(50).default(20),
  page: z.coerce.number().int().min(1).default(1),
});

export type ShelterSearch = z.infer<typeof ShelterSearchQuery>;

export function kmToMi(km: number) {
  return km * 0.621371;
}

