export interface Place {
  id: string;
  name: string;
  type: 'vet' | 'shelter';
  phone?: string;
  website?: string;
  address: string;
  zipcode: string;
  lat?: number;
  lng?: number;
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
}
