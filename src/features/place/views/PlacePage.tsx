"use client";

import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import { InfoCardData, Place, Review } from '@/lib/types';
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
  infoCard?: InfoCardData;
};

import CommunityInfo from '@features/place/views/CommunityInfo';

export default function PlacePageView({ place, reviews, infoCard }: Props) {
  const router = useRouter();
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPlace, setCurrentPlace] = useState(place);
  const [currentReviews, setCurrentReviews] = useState(reviews);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Search', href: '/search' },
    { label: place?.name || 'Loading...', current: true }
  ];

  if (!place) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">We couldn&apos;t find this place.</h1>
          <p className="text-gray-600 mb-6">
            The place you&apos;re looking for doesn&apos;t exist or has been removed.
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

  const handleSubmitReview = async (rating: number, text: string, firstVisitFree?: 'yes' | 'no' | null) => {
    if (!currentPlace?.id) return;
    setSubmitError(null);
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/places/${currentPlace.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ rating, text }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error?.message || `Failed to submit review (${res.status})`);
      }
      const review = json.data.review as Review;
      const updated = json.data.place as { id: string; rating?: number; reviewCount?: number };
      setCurrentReviews((prev) => [review, ...(prev || [])]);
      setCurrentPlace((prev) => prev ? { ...prev, rating: updated.rating ?? prev.rating, reviewCount: updated.reviewCount ?? prev.reviewCount } : prev);

      // Optionally submit first-visit-free attribute
      if (firstVisitFree === 'yes' || firstVisitFree === 'no') {
        fetch(`/api/places/${currentPlace.id}/attributes/first-visit-free`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value: firstVisitFree === 'yes' }),
        }).catch(() => {});
      }
    } catch (e: any) {
      console.error('submit_review_error', e);
      setSubmitError(e?.message || 'Could not submit review');
    } finally {
      setSubmittingReview(false);
    }
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

        {/* Local, client-side community info (no server calls) */}
        <CommunityInfo scope="place" entityId={place.id} />

        <RatingSummary
          rating={currentPlace?.rating ?? 0}
          reviews={currentReviews}
        />

        <ReviewsList
          reviews={currentReviews}
          loading={loadingReviews}
          error={reviewsError || Boolean(submitError)}
          onRetry={handleRetryReviews}
        />

        <WriteReviewCTA onOpenModal={() => setModalOpen(true)} />

        <WriteReviewModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmitReview}
        />
        {submittingReview && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black text-white text-sm px-3 py-2 rounded-md shadow">
            Submitting review…
          </div>
        )}
        {submitError && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-sm px-3 py-2 rounded-md shadow">
            {submitError}
          </div>
        )}
      </div>
    </div>
  );
}
