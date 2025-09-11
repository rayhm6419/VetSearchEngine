export type PlaceDTO = {
  externalId: string;
  name: string;
  type: 'vet';
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  zipcode?: string | null;
  lat?: number | null;
  lng?: number | null;
  distanceKm?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  source: 'google';
};

