import { Place, Review, InfoCardData } from '@/lib/types';
import { headers } from 'next/headers';

export type PlaceDetailsDTO = {
  place: Place | null;
  reviews: Review[];
  infoCard?: InfoCardData;
};

export async function getPlaceDetails(id: string): Promise<PlaceDetailsDTO> {
  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000';
  const proto = h.get('x-forwarded-proto') || 'http';
  const base = `${proto}://${host}`;

  const [placeRes, reviewsRes] = await Promise.all([
    fetch(`${base}/api/places/${id}`, { cache: 'no-store' }),
    fetch(`${base}/api/places/${id}/reviews?take=20&skip=0`, { cache: 'no-store' }),
  ]);

  let place: Place | null = null;
  let infoCard: InfoCardData | undefined = undefined;
  if (placeRes.ok) {
    const pj = await placeRes.json();
    if (pj?.ok) {
      if (pj.data?.place) {
        place = pj.data.place as Place;
        infoCard = pj.data.infoCard as InfoCardData | undefined;
      } else {
        place = pj.data as Place;
      }
    }
  }
  let reviews: Review[] = [];
  if (reviewsRes.ok) {
    const rj = await reviewsRes.json();
    if (rj?.ok) reviews = (rj.data.items || []) as Review[];
  }
  return { place, reviews, infoCard };
}
