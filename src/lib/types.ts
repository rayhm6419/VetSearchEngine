export interface Place {
  id: string;
  name: string;
  type: 'vet' | 'shelter';
  externalId?: string;      // external provider id (e.g., Petfinder)
  phone?: string;
  website?: string;
  address: string;
  zipcode: string;
  lat?: number;
  lng?: number;
  distanceKm?: number;      // included when searching by radius
  hours?: Array<{ 
    day: string; 
    open: string; 
    close: string; 
    isClosed?: boolean 
  }>;
  services?: string[];       // e.g., 'Emergency', 'Exotics', 'Dental'
  rating?: number;           // 0–5
  reviewCount?: number;
  priceLevel?: 1|2|3|4;      // optional
  photos?: string[];         // urls
  source?: 'db' | 'petfinder' | 'yelp' | 'google';
}

export interface Review {
  id: string;
  author: {
    name: string;
    avatarUrl?: string
  };
  rating: number;            // 1–5
  date: string;              // ISO
  text: string;
  recommended?: boolean;     // true = recommend, false = not recommend
}
export type PlaceSortOption = 'distance' | 'rating';

// InfoCard types
export interface InfoCardData {
  firstVisitFree: { yes: number; no: number; confidence: 'low' | 'medium' | 'high' };
  topDoctors: Array<{ name: string; recCount: number }>;
}
