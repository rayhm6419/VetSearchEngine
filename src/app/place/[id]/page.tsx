import { getPlaceDetails } from '@features/place/controllers/getPlaceDetails';
import PlacePageView from '@features/place/views/PlacePage';

export default async function Page({ params }: { params: { id: string } }) {
  const { place, reviews } = await getPlaceDetails(params.id);
  return <PlacePageView place={place} reviews={reviews} />;
}
