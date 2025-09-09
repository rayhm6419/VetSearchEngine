import { Place } from '@/lib/types';

interface PlaceHeaderProps {
  place: Place;
}

export default function PlaceHeader({ place }: PlaceHeaderProps) {
  const handleCall = () => {
    if (place.phone) {
      window.open(`tel:${place.phone}`, '_self');
    }
  };

  const handleWebsite = () => {
    if (place.website) {
      window.open(place.website, '_blank');
    }
  };

  const handleDirections = () => {
    const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(place.address)}`;
    window.open(mapsUrl, '_blank');
  };

  const handleSave = () => {
    // Non-functional for now
    console.log('Save place:', place.id);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${
          i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {place.name}
            </h1>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              place.type === 'vet' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {place.type === 'vet' ? 'Veterinary' : 'Animal Shelter'}
            </span>
          </div>

          {place.rating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {renderStars(place.rating)}
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {place.rating.toFixed(1)}
              </span>
              {place.reviewCount && (
                <span className="text-gray-600">
                  ({place.reviewCount} review{place.reviewCount !== 1 ? 's' : ''})
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {place.phone && (
            <button
              onClick={handleCall}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Call
            </button>
          )}
          
          {place.website && (
            <button
              onClick={handleWebsite}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
            >
              Website
            </button>
          )}

          <button
            onClick={handleDirections}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
          >
            Directions
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
