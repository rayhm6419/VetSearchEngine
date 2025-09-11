import { Place } from '@/lib/types';

export function mapBusinessToPlace(biz: any): Place {
  return {
    id: `yelp:${biz.id}`,
    externalId: String(biz.id),
    name: biz.name,
    type: 'vet',
    phone: biz.display_phone || biz.phone || undefined,
    website: biz.url || undefined,
    address: (biz.location?.display_address || []).join(', '),
    zipcode: biz.location?.zip_code || '',
    lat: typeof biz.coordinates?.latitude === 'number' ? biz.coordinates.latitude : undefined,
    lng: typeof biz.coordinates?.longitude === 'number' ? biz.coordinates.longitude : undefined,
    rating: typeof biz.rating === 'number' ? biz.rating : undefined,
    reviewCount: typeof biz.review_count === 'number' ? biz.review_count : undefined,
    distanceKm: typeof biz.distance === 'number' ? biz.distance / 1000 : undefined,
    source: 'yelp',
  };
}

