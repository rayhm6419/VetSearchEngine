"use client";

import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import { Place, Review } from '@/lib/types';
import PlaceHeader from '@features/place/views/PlaceHeader';
import PlaceMeta from '@features/place/views/PlaceMeta';
import HoursCard from '@features/place/views/HoursCard';
import PhotoStrip from '@features/place/views/PhotoStrip';
import MapCard from '@features/place/views/MapCard';
import RatingSummary from '@features/place/views/RatingSummary';
import ReviewsList from '@features/place/views/ReviewsList';
import WriteReviewCTA from '@features/place/views/WriteReviewCTA';
import WriteReviewModal from '@features/place/views/WriteReviewModal';
import { useState } from 'react';

type Props = {
  place: Place | null;
  reviews: Review[];
};

export default function PlacePageView({ place, reviews }: Props) {
  const router = useRouter();
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Search', href: '/search' },
    { label: place?.name || 'Loading...', current: true }
  ];

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

  const handleRetryReviews = () => {
    setReviewsError(false);
    setLoadingReviews(true);
    // Placeholder: wire to controller if you want live reload
    setTimeout(() => setLoadingReviews(false), 400);
  };

  const handleSubmitReview = (rating: number, text: string) => {
    console.log('Review submitted:', { rating, text });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Breadcrumb items={breadcrumbItems} />

        <PlaceHeader place={place} />
        <PlaceMeta place={place} />
        <HoursCard place={place} />
        <PhotoStrip place={place} />
        <MapCard place={place} />

        {place.rating && (
          <RatingSummary
            rating={place.rating}
            reviewCount={place.reviewCount || 0}
            reviews={reviews}
          />
        )}

        <ReviewsList
          reviews={reviews}
          loading={loadingReviews}
          error={reviewsError}
          onRetry={handleRetryReviews}
        />

        <WriteReviewCTA onOpenModal={() => setModalOpen(true)} />

        <WriteReviewModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmitReview}
        />
      </div>
    </div>
  );
}

