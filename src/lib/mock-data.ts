import { Place, Review } from './types';

// Mock data for testing the search page functionality
// Contains 5 sample places in Seattle/Bellevue area (3 vets, 2 shelters)
// This data is used by src/app/search/page.tsx for filtering and display
export const PLACES: Place[] = [
  // Veterinary Clinic #1 - Has both phone and website
  {
    id: "1",
    name: "Downtown Animal Hospital",
    address: "123 Main Street, Downtown, Seattle, WA 98101",
    zipcode: "98101",
    phone: "(206) 555-0123",
    website: "https://downtownanimalhospital.com",
    type: "vet",
    lat: 47.6062,
    lng: -122.3321,
    rating: 4.5,
    reviewCount: 127,
    priceLevel: 3,
    services: ["Emergency", "Dental", "Surgery", "Vaccinations"],
    hours: [
      { day: "Monday", open: "8:00 AM", close: "6:00 PM" },
      { day: "Tuesday", open: "8:00 AM", close: "6:00 PM" },
      { day: "Wednesday", open: "8:00 AM", close: "6:00 PM" },
      { day: "Thursday", open: "8:00 AM", close: "6:00 PM" },
      { day: "Friday", open: "8:00 AM", close: "6:00 PM" },
      { day: "Saturday", open: "9:00 AM", close: "4:00 PM" },
      { day: "Sunday", open: "10:00 AM", close: "3:00 PM" }
    ],
    photos: [
      "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400",
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400",
      "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400"
    ]
  },
  
  // Animal Shelter #1 - Has both phone and website
  {
    id: "2",
    name: "Happy Paws Animal Shelter",
    address: "456 Oak Avenue, Capitol Hill, Seattle, WA 98102",
    zipcode: "98102",
    phone: "(206) 555-0456",
    website: "https://happypawsshelter.org",
    type: "shelter",
    lat: 47.6205,
    lng: -122.3214,
    rating: 4.2,
    reviewCount: 89,
    priceLevel: 1,
    services: ["Adoption", "Foster Care", "Spay/Neuter", "Vaccinations"],
    hours: [
      { day: "Monday", open: "10:00 AM", close: "6:00 PM" },
      { day: "Tuesday", open: "10:00 AM", close: "6:00 PM" },
      { day: "Wednesday", open: "10:00 AM", close: "6:00 PM" },
      { day: "Thursday", open: "10:00 AM", close: "6:00 PM" },
      { day: "Friday", open: "10:00 AM", close: "6:00 PM" },
      { day: "Saturday", open: "9:00 AM", close: "5:00 PM" },
      { day: "Sunday", open: "12:00 PM", close: "4:00 PM" }
    ],
    photos: [
      "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400"
    ]
  },
  
  // Veterinary Clinic #2 - Has phone only (no website)
  {
    id: "3",
    name: "Bellevue Veterinary Clinic",
    address: "789 Pine Street, Bellevue, WA 98004",
    zipcode: "98004",
    phone: "(425) 555-0789",
    type: "vet",
    lat: 47.6101,
    lng: -122.2015,
    rating: 4.7,
    reviewCount: 203,
    priceLevel: 4,
    services: ["Exotics", "Dental", "Surgery", "Emergency", "Grooming"],
    hours: [
      { day: "Monday", open: "7:00 AM", close: "7:00 PM" },
      { day: "Tuesday", open: "7:00 AM", close: "7:00 PM" },
      { day: "Wednesday", open: "7:00 AM", close: "7:00 PM" },
      { day: "Thursday", open: "7:00 AM", close: "7:00 PM" },
      { day: "Friday", open: "7:00 AM", close: "7:00 PM" },
      { day: "Saturday", open: "8:00 AM", close: "5:00 PM" },
      { day: "Sunday", open: "9:00 AM", close: "4:00 PM" }
    ],
    photos: [
      "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400",
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400"
    ]
  },
  
  // Animal Shelter #2 - Has both phone and website
  {
    id: "4",
    name: "Seattle Animal Rescue",
    address: "321 Cedar Lane, Queen Anne, Seattle, WA 98109",
    zipcode: "98109",
    phone: "(206) 555-0321",
    website: "https://seattleanimalrescue.org",
    type: "shelter",
    lat: 47.6231,
    lng: -122.3562,
    rating: 4.0,
    reviewCount: 156,
    priceLevel: 1,
    services: ["Adoption", "Foster Care", "Behavior Training", "Medical Care"],
    hours: [
      { day: "Monday", open: "11:00 AM", close: "7:00 PM" },
      { day: "Tuesday", open: "11:00 AM", close: "7:00 PM" },
      { day: "Wednesday", open: "11:00 AM", close: "7:00 PM" },
      { day: "Thursday", open: "11:00 AM", close: "7:00 PM" },
      { day: "Friday", open: "11:00 AM", close: "7:00 PM" },
      { day: "Saturday", open: "10:00 AM", close: "6:00 PM" },
      { day: "Sunday", open: "12:00 PM", close: "5:00 PM" }
    ],
    photos: [
      "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400"
    ]
  },
  
  // Veterinary Clinic #3 - Has both phone and website
  {
    id: "5",
    name: "Westside Animal Hospital",
    address: "654 Maple Drive, West Seattle, WA 98116",
    zipcode: "98116",
    phone: "(206) 555-0654",
    website: "https://westsideanimalhospital.com",
    type: "vet",
    lat: 47.5745,
    lng: -122.3871,
    rating: 4.3,
    reviewCount: 94,
    priceLevel: 2,
    services: ["General Care", "Vaccinations", "Dental", "Surgery"],
    hours: [
      { day: "Monday", open: "8:30 AM", close: "5:30 PM" },
      { day: "Tuesday", open: "8:30 AM", close: "5:30 PM" },
      { day: "Wednesday", open: "8:30 AM", close: "5:30 PM" },
      { day: "Thursday", open: "8:30 AM", close: "5:30 PM" },
      { day: "Friday", open: "8:30 AM", close: "5:30 PM" },
      { day: "Saturday", open: "9:00 AM", close: "3:00 PM" },
      { day: "Sunday", open: "", close: "", isClosed: true }
    ],
    photos: [
      "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400",
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400",
      "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400"
    ]
  }
];

// Mock reviews data
export const REVIEWS: Review[] = [
  {
    id: "r1",
    author: { name: "Sarah Johnson", avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40" },
    rating: 5,
    date: "2024-01-15T10:30:00Z",
    text: "Excellent care for my dog! The staff was very professional and caring. The vet took time to explain everything clearly and my dog felt comfortable throughout the visit."
  },
  {
    id: "r2",
    author: { name: "Mike Chen" },
    rating: 4,
    date: "2024-01-12T14:20:00Z",
    text: "Great service overall. The waiting time was a bit long but the care was worth it. My cat's dental procedure went smoothly."
  },
  {
    id: "r3",
    author: { name: "Emily Rodriguez", avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40" },
    rating: 5,
    date: "2024-01-10T09:15:00Z",
    text: "Amazing experience! The emergency care saved my pet's life. Highly recommend this clinic for any pet emergencies."
  },
  {
    id: "r4",
    author: { name: "David Kim" },
    rating: 3,
    date: "2024-01-08T16:45:00Z",
    text: "Good care but a bit expensive. The staff was friendly and knowledgeable. The facility is clean and well-maintained."
  },
  {
    id: "r5",
    author: { name: "Lisa Thompson", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40" },
    rating: 4,
    date: "2024-01-05T11:30:00Z",
    text: "Professional staff and clean facility. My dog was nervous but they made him feel comfortable. Would definitely return."
  },
  {
    id: "r6",
    author: { name: "Robert Wilson" },
    rating: 5,
    date: "2024-01-03T13:20:00Z",
    text: "Outstanding service! The vet was thorough in the examination and explained everything in detail. My pet is in great hands here."
  },
  {
    id: "r7",
    author: { name: "Jennifer Lee", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40" },
    rating: 4,
    date: "2024-01-01T15:10:00Z",
    text: "Great experience overall. The staff was caring and the facility was clean. The only downside was the wait time."
  },
  {
    id: "r8",
    author: { name: "Michael Brown" },
    rating: 5,
    date: "2023-12-28T10:45:00Z",
    text: "Excellent care for my senior dog. The vet was very patient and understanding. Highly recommend this clinic!"
  }
];

// Mock fetch helpers
export const getPlaceById = async (id: string): Promise<Place | null> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 300));
  
  const place = PLACES.find(p => p.id === id);
  return place || null;
};

export const getReviewsForPlace = async (placeId: string): Promise<Review[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 200));
  
  // For demo purposes, return all reviews for any place
  // In a real app, you'd filter by placeId
  return REVIEWS;
};

// DEBUGGING NOTES:
// - If search page shows no results, check that typeFilter logic in search/page.tsx matches these type values
// - If buttons don't appear, verify phone/website properties exist (some entries may not have both)
// - If filtering doesn't work, ensure the Chip component onClick handlers update typeFilter state correctly
// - To add more places: follow the same structure, use unique IDs, and maintain the vet/shelter type balance
// - Mock fetch helpers simulate real API delays for better UX testing
  