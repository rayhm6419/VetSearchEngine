import { getSearchResults } from '@features/search/controllers/getSearchResults';
import SearchPage from '@features/search/views/SearchPage';

export default async function Page(props: any) {
  const spRaw: any = props?.searchParams;
  const searchParams = typeof spRaw?.then === 'function' ? await spRaw : spRaw;
  const zip = typeof searchParams?.zip === 'string' ? searchParams.zip : undefined;
  const lat = typeof searchParams?.lat === 'string' ? Number(searchParams.lat) : undefined;
  const lng = typeof searchParams?.lng === 'string' ? Number(searchParams.lng) : undefined;
  const radiusKm = typeof searchParams?.radiusKm === 'string' ? Number(searchParams.radiusKm) : undefined;
  const type = typeof searchParams?.type === 'string' && (['vet','shelter','all'] as const).includes(searchParams.type as any)
    ? (searchParams.type as 'vet' | 'shelter' | 'all')
    : undefined;
  const sort = typeof searchParams?.sort === 'string' && (['distance', 'rating'] as const).includes(searchParams.sort as any)
    ? (searchParams.sort as 'distance' | 'rating')
    : undefined;
  const { initialPlaces, zipParam, center, radiusKm: resolvedRadius } = await getSearchResults({ zip, lat, lng, radiusKm, type, sort });
  return (
    <SearchPage
      initialPlaces={initialPlaces}
      zipParam={zipParam}
      center={center}
      radiusKm={resolvedRadius}
      initialType={type}
      initialSort={sort}
    />
  );
}