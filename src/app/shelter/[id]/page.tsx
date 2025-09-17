import { getShelterDetails } from '@features/shelter/controllers/getShelterDetails';
import ShelterDetailPage from '@features/shelter/views/ShelterDetailPage';

export default async function Page(props: any) {
  const p: any = props?.params;
  const params = typeof p?.then === 'function' ? await p : p;
  const { shelter, reviews, rating, reviewCount, infoCard } = await getShelterDetails(params.id);
  return <ShelterDetailPage shelter={shelter} reviews={reviews} rating={rating} reviewCount={reviewCount} infoCard={infoCard} />;
}
