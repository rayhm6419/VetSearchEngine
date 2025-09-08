// Type definition for places (veterinary clinics and animal shelters)
// Used by the search page to display and filter locations
export type Place = {
    id: string;           // Unique identifier for each place
    name: string;         // Business/shelter name
    address: string;      // Full street address
    zipcode: string;      // 5-digit ZIP code for filtering
    phone?: string;       // Optional phone number (some places may not have one)
    website?: string;     // Optional website URL (some places may not have one)
    type: "vet" | "shelter";  // Either veterinary clinic or animal shelter
  };

// Mock data for testing the search page functionality
// Contains 5 sample places in Seattle/Bellevue area (3 vets, 2 shelters)
// This data is used by src/app/search/page.tsx for filtering and display
export const PLACES: Place[] = [
  // Veterinary Clinic #1 - Has both phone and website
  {
    id: "1",                    // Unique ID - used as React key in search page
    name: "Downtown Animal Hospital",
    address: "123 Main Street, Downtown, Seattle, WA 98101",
    zipcode: "98101",           // Seattle ZIP code
    phone: "(206) 555-0123",    // Seattle area code
    website: "https://downtownanimalhospital.com",
    type: "vet"                 // Will show "Call" and "Website" buttons
  },
  
  // Animal Shelter #1 - Has both phone and website
  {
    id: "2",
    name: "Happy Paws Animal Shelter",
    address: "456 Oak Avenue, Capitol Hill, Seattle, WA 98102",
    zipcode: "98102",           // Seattle ZIP code
    phone: "(206) 555-0456",
    website: "https://happypawsshelter.org",
    type: "shelter"             // Will show "Call" and "Website" buttons
  },
  
  // Veterinary Clinic #2 - Has phone only (no website)
  {
    id: "3",
    name: "Bellevue Veterinary Clinic",
    address: "789 Pine Street, Bellevue, WA 98004",
    zipcode: "98004",           // Bellevue ZIP code
    phone: "(425) 555-0789",    // Bellevue area code
    // No website property - will only show "Call" button
    type: "vet"
  },
  
  // Animal Shelter #2 - Has both phone and website
  {
    id: "4",
    name: "Seattle Animal Rescue",
    address: "321 Cedar Lane, Queen Anne, Seattle, WA 98109",
    zipcode: "98109",           // Seattle ZIP code
    phone: "(206) 555-0321",
    website: "https://seattleanimalrescue.org",
    type: "shelter"
  },
  
  // Veterinary Clinic #3 - Has both phone and website
  {
    id: "5",
    name: "Westside Animal Hospital",
    address: "654 Maple Drive, West Seattle, WA 98116",
    zipcode: "98116",           // Seattle ZIP code
    phone: "(206) 555-0654",
    website: "https://westsideanimalhospital.com",
    type: "vet"
  }
];

// DEBUGGING NOTES:
// - If search page shows no results, check that typeFilter logic in search/page.tsx matches these type values
// - If buttons don't appear, verify phone/website properties exist (some entries may not have both)
// - If filtering doesn't work, ensure the Chip component onClick handlers update typeFilter state correctly
// - To add more places: follow the same structure, use unique IDs, and maintain the vet/shelter type balance
  