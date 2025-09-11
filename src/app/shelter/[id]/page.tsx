import { getShelterDetails } from '@features/shelter/controllers/getShelterDetails';
import ShelterDetailPage from '@features/shelter/views/ShelterDetailPage';

export default async function Page({ params }: { params: { id: string } }) {
  const { shelter, reviews, rating, reviewCount } = await getShelterDetails(params.id);
  return <ShelterDetailPage shelter={shelter} reviews={reviews} rating={rating} reviewCount={reviewCount} />;
}

