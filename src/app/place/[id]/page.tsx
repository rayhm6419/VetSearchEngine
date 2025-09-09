'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getPlaceById, getReviewsForPlace } from '@/lib/mock-data';
import { Place, Review } from '@/lib/types';
import Breadcrumb from '@/components/Breadcrumb';
import PlaceHeader from '@/components/place/PlaceHeader';
import PlaceMeta from '@/components/place/PlaceMeta';
import HoursCard from '@/components/place/HoursCard';
import PhotoStrip from '@/components/place/PhotoStrip';
import MapCard from '@/components/place/MapCard';
import RatingSummary from '@/components/place/RatingSummary';
import ReviewsList from '@/components/place/ReviewsList';
import WriteReviewCTA from '@/components/place/WriteReviewCTA';
import WriteReviewModal from '@/components/place/WriteReviewModal';

export default function PlacePage() {
  const params = useParams();
  const router = useRouter();
  const [place, setPlace] = useState<Place | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingPlace, setLoadingPlace] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const loadPlace = async () => {
      const placeId = params.id as string;
      try {
        const foundPlace = await getPlaceById(placeId);
        setPlace(foundPlace);
      } catch (error) {
        console.error('Error loading place:', error);
      } finally {
        setLoadingPlace(false);
      }
    };

    loadPlace();
  }, [params.id]);

  useEffect(() => {
    const loadReviews = async () => {
      const placeId = params.id as string;
      try {
        const placeReviews = await getReviewsForPlace(placeId);
        setReviews(placeReviews);
      } catch (error) {
        console.error('Error loading reviews:', error);
        setReviewsError(true);
      } finally {
        setLoadingReviews(false);
      }
    };

    loadReviews();
  }, [params.id]);

  const handleRetryReviews = () => {
    setReviewsError(false);
    setLoadingReviews(true);
    // Retry logic would go here
  };

  const handleSubmitReview = (rating: number, text: string) => {
    console.log('Review submitted:', { rating, text });
    // In a real app, this would submit to an API
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Search', href: '/search' },
    { label: place?.name || 'Loading...', current: true }
  ];

  if (loadingPlace) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading place details...</p>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">We couldn't find this place.</h1>
          <p className="text-gray-600 mb-6">
            The place you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/search')}
            className="inline-block rounded-lg bg-black text-white px-5 py-3 text-sm hover:opacity-90"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Place Header */}
        <PlaceHeader place={place} />

        {/* Place Meta */}
        <PlaceMeta place={place} />

        {/* Hours Card */}
        <HoursCard place={place} />

        {/* Photo Strip */}
        <PhotoStrip place={place} />

        {/* Map Card */}
        <MapCard place={place} />

        {/* Rating Summary */}
        {place.rating && (
          <RatingSummary
            rating={place.rating}
            reviewCount={place.reviewCount || 0}
            reviews={reviews}
          />
        )}

        {/* Reviews List */}
        <ReviewsList
          reviews={reviews}
          loading={loadingReviews}
          error={reviewsError}
          onRetry={handleRetryReviews}
        />

        {/* Write Review CTA */}
        <WriteReviewCTA onOpenModal={() => setModalOpen(true)} />

        {/* Write Review Modal */}
        <WriteReviewModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmitReview}
        />
      </div>
    </div>
  );
}
