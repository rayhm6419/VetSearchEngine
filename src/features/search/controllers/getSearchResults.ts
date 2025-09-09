import { PLACES } from '@/lib/mock-data';
import { Place } from '@/lib/types';

export type SearchDTO = {
  initialPlaces: Place[];
  zipParam?: string | null;
};

export async function getSearchResults(zipParam?: string | null): Promise<SearchDTO> {
  // Simulate network/processing delay if needed
  const initialPlaces = PLACES.filter(p => !zipParam || p.zipcode === zipParam);
  return { initialPlaces, zipParam };
}

