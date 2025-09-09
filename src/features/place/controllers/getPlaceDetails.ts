import { getPlaceById, getReviewsForPlace } from '@/lib/mock-data';
import { Place, Review } from '@/lib/types';

export type PlaceDetailsDTO = {
  place: Place | null;
  reviews: Review[];
};

export async function getPlaceDetails(id: string): Promise<PlaceDetailsDTO> {
  const [place, reviews] = await Promise.all([
    getPlaceById(id),
    getReviewsForPlace(id),
  ]);
  return { place, reviews };
}

