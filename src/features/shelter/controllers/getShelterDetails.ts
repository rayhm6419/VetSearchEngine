import { Place, Review } from '@/lib/types';
import { headers } from 'next/headers';

export type ShelterDetailsDTO = {
  shelter: Place | null;
  reviews: Review[];
  rating?: number;
  reviewCount?: number;
};

export async function getShelterDetails(id: string): Promise<ShelterDetailsDTO> {
  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000';
  const proto = h.get('x-forwarded-proto') || 'http';
  const base = `${proto}://${host}`;

  const [dRes, rRes] = await Promise.all([
    fetch(`${base}/api/shelters/${id}`, { cache: 'no-store' }),
    fetch(`${base}/api/shelters/${id}/reviews?take=20&skip=0`, { cache: 'no-store' }),
  ]);

  let shelter: Place | null = null;
  if (dRes.ok) {
    const dj = await dRes.json().catch(() => null);
    if (dj?.ok) shelter = dj.data as Place;
  }
  let reviews: Review[] = [];
  let rating: number | undefined;
  let reviewCount: number | undefined;
  if (rRes.ok) {
    const rj = await rRes.json().catch(() => null);
    if (rj?.ok) {
      reviews = (rj.data.items || []) as Review[];
      rating = rj.data.summary?.rating;
      reviewCount = rj.data.summary?.reviewCount;
    }
  }
  return { shelter, reviews, rating, reviewCount };
}

