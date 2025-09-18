"use client";

import { Review } from '@/lib/types';
import { useState } from 'react';

interface ReviewsListProps {
  reviews: Review[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

export default function ReviewsList({ reviews, loading, error, onRetry }: ReviewsListProps) {
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'recommended' | 'not'>('all');
  const pageSize = 5;

  const toggleExpanded = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-sm ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  const filteredReviews = reviews.filter((review) => {
    if (filter === 'recommended') return review.recommended === true;
    if (filter === 'not') return review.recommended === false;
    return true;
  });

  const paginatedReviews = filteredReviews.slice(0, currentPage * pageSize);
  const hasMore = filteredReviews.length > currentPage * pageSize;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="h-4 bg-gray-300 rounded w-24"></div>
                <div className="h-4 bg-gray-300 rounded w-16"></div>
              </div>
              <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">We couldn&apos;t load this section.</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
        <div className="text-center py-8">
          <p className="text-gray-600">No reviews yet. Be the first to write one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6" aria-live="polite">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
      <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Review filters">
        {[
          { key: 'all' as const, label: 'All' },
          { key: 'recommended' as const, label: 'Recommended' },
          { key: 'not' as const, label: 'Not recommended' },
        ].map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => {
              setCurrentPage(1);
              setFilter(option.key);
            }}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              filter === option.key
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {paginatedReviews.map((review) => {
          const isExpanded = expandedReviews.has(review.id);
          const shouldTruncate = review.text.length > 200;
          const displayText = shouldTruncate && !isExpanded 
            ? review.text.substring(0, 200) + '...' 
            : review.text;

          return (
            <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex items-center gap-3 mb-2">
                {review.author.avatarUrl ? (
                  <img
                    src={review.author.avatarUrl}
                    alt={review.author.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium">
                      {review.author.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900">{review.author.name}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(review.date)}
                    </span>
                    {typeof review.recommended === 'boolean' && (
                      <span
                        className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                          review.recommended ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {review.recommended ? 'Recommended' : 'Not recommended'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                {displayText}
              </p>
              
              {shouldTruncate && (
                <button
                  onClick={() => toggleExpanded(review.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1"
                >
                  {isExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Load More Reviews
          </button>
        </div>
      )}

      {filteredReviews.length === 0 && (
        <p className="text-sm text-gray-600 mt-4">No reviews match this filter yet.</p>
      )}
    </div>
  );
}
