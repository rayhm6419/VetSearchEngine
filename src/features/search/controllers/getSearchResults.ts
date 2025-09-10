import { Place } from '@/lib/types';
import { placeService } from '@/server/services/placeService';

export type SearchDTO = {
  initialPlaces: Place[];
  zipParam?: string | null;
};

export async function getSearchResults(zipParam?: string | null): Promise<SearchDTO> {
  const initialPlaces = await placeService.searchByZip({ zip: zipParam || undefined });
  return { initialPlaces, zipParam };
}
