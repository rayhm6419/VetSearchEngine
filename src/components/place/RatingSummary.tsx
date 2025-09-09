import { Review } from '@/lib/types';

interface RatingSummaryProps {
  rating: number;
  reviewCount: number;
  reviews: Review[];
}

export default function RatingSummary({ rating, reviewCount, reviews }: RatingSummaryProps) {
  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating as keyof typeof distribution]++;
      }
    });
    
    return distribution;
  };

  const distribution = getRatingDistribution();
  const totalReviews = reviews.length;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-2xl ${
          i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  const renderDistributionBar = (stars: number, count: number) => {
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 w-2">{stars}</span>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm text-gray-600 w-8">{count}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Rating & Reviews</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Rating */}
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
            {renderStars(rating)}
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-1">
            {rating.toFixed(1)}
          </div>
          <div className="text-gray-600">
            {reviewCount} review{reviewCount !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Rating Distribution</h3>
          {[5, 4, 3, 2, 1].map(stars => (
            <div key={stars}>
              {renderDistributionBar(stars, distribution[stars as keyof typeof distribution])}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
