"use client";

import { useState } from 'react';
import { formatDistanceMiles } from '@/lib/distance';
import { InfoCardData, Place, Review } from '@/lib/types';
import RatingSummary from '@features/place/views/RatingSummary';
import ReviewsList from '@features/place/views/ReviewsList';
import WriteReviewModal from '@features/place/views/WriteReviewModal';
import { useRouter } from 'next/navigation';
import CommunityInfo from '@features/place/views/CommunityInfo';

type Props = {
  shelter: Place | null;
  reviews: Review[];
  rating?: number;
  reviewCount?: number;
  infoCard?: InfoCardData;
};

export default function ShelterDetailPage({ shelter, reviews, rating, reviewCount, infoCard }: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [items, setItems] = useState<Review[]>(reviews || []);
  const [summary, setSummary] = useState<{ rating?: number; reviewCount?: number }>({ rating, reviewCount });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!shelter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">We couldn&apos;t load this shelter.</h1>
          <p className="text-gray-600 mb-6">It may not exist or is temporarily unavailable.</p>
          <button onClick={() => router.push('/search?type=shelter')} className="inline-block rounded-lg bg-black text-white px-5 py-3 text-sm hover:opacity-90">Back to Search</button>
        </div>
      </div>
    );
  }

  const id = shelter.externalId || shelter.id.replace(/^petfinder:/, '');

  const onSubmit = async (rating: number, text: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/shelters/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, text }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error(json?.error?.message || `Failed (${res.status})`);
      setItems(json.data.items || []);
      setSummary(json.data.summary || {});
    } catch (e: any) {
      setError(e?.message || 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const openWebsite = () => {
    if (shelter.website) window.open(shelter.website, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button onClick={() => router.back()} className="inline-block rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 mb-6">Go Back</button>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{shelter.name}</h1>
              <p className="text-gray-600 mb-2">{shelter.address}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Animal Shelter</span>
                {typeof shelter.distanceKm === 'number' && (
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                    {formatDistanceMiles(shelter.distanceKm)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              {shelter.phone && (
                <a href={`tel:${shelter.phone}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Call</a>
              )}
              {shelter.website && (
                <button onClick={openWebsite} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-sm">Visit Website</button>
              )}
            </div>
          </div>
        </div>

        {/* Always show the star widget; empty/gray when no reviews */}
        <RatingSummary rating={typeof summary.rating === 'number' ? summary.rating : 0} reviews={items} />

        {/* Local, client-side community info for shelters */}
        {shelter && (
          <CommunityInfo scope="shelter" entityId={id} />
        )}

        <ReviewsList reviews={items} />

        <div className="text-right">
          <button onClick={() => setModalOpen(true)} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm">Write a Review</button>
        </div>

        <WriteReviewModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={onSubmit} />

        {submitting && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black text-white text-sm px-3 py-2 rounded-md shadow">Submitting review…</div>
        )}
        {error && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-sm px-3 py-2 rounded-md shadow">{error}</div>
        )}
      </div>
    </div>
  );
}
