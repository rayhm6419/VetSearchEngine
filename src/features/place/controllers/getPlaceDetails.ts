import { Place, Review } from '@/lib/types';
import { placeService } from '@/server/services/placeService';

export type PlaceDetailsDTO = {
  place: Place | null;
  reviews: Review[];
};

export async function getPlaceDetails(id: string): Promise<PlaceDetailsDTO> {
  const [place, reviews] = await Promise.all([
    placeService.getById(id),
    placeService.getReviews(id),
  ]);
  return { place, reviews };
}
