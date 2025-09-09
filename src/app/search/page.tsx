import { getSearchResults } from '@features/search/controllers/getSearchResults';
import SearchPage from '@features/search/views/SearchPage';

export default async function Page({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const zip = typeof searchParams?.zip === 'string' ? searchParams.zip : undefined;
  const { initialPlaces, zipParam } = await getSearchResults(zip);
  return <SearchPage initialPlaces={initialPlaces} zipParam={zipParam} />;
}
