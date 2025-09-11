import { getSearchResults } from '@features/search/controllers/getSearchResults';
import SearchPage from '@features/search/views/SearchPage';

export default async function Page({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const zip = typeof searchParams?.zip === 'string' ? searchParams.zip : undefined;
  const lat = typeof searchParams?.lat === 'string' ? Number(searchParams.lat) : undefined;
  const lng = typeof searchParams?.lng === 'string' ? Number(searchParams.lng) : undefined;
  const radiusKm = typeof searchParams?.radiusKm === 'string' ? Number(searchParams.radiusKm) : undefined;
  const type = typeof searchParams?.type === 'string' && (['vet','shelter','all'] as const).includes(searchParams.type as any)
    ? (searchParams.type as 'vet' | 'shelter' | 'all')
    : undefined;
  const { initialPlaces, zipParam, center, radiusKm: resolvedRadius } = await getSearchResults({ zip, lat, lng, radiusKm, type });
  return <SearchPage initialPlaces={initialPlaces} zipParam={zipParam} center={center} radiusKm={resolvedRadius} initialType={type} />;
}
