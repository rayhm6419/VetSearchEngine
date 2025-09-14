import { getPlaceDetails } from '@features/place/controllers/getPlaceDetails';
import PlacePageView from '@features/place/views/PlacePage';

export default async function Page(props: any) {
  const p: any = props?.params;
  const params = typeof p?.then === 'function' ? await p : p;
  const { place, reviews } = await getPlaceDetails(params.id);
  return <PlacePageView place={place} reviews={reviews} />;
}
