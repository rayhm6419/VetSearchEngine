import { Place } from '@/lib/types';

interface PlaceMetaProps {
  place: Place;
}

export default function PlaceMeta({ place }: PlaceMetaProps) {
  const copyAddress = () => {
    navigator.clipboard.writeText(place.address);
    // You could add a toast notification here
  };

  const copyPhone = () => {
    if (place.phone) {
      navigator.clipboard.writeText(place.phone);
    }
  };

  const renderPriceLevel = (level?: number) => {
    if (!level) return null;
    return (
      <div className="flex items-center gap-1">
        <span className="text-gray-600">Price:</span>
        <span className="text-green-600 font-medium">
          {'$'.repeat(level)}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact & Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Address</h3>
            <div className="flex items-center gap-2">
              <p className="text-gray-900">{place.address}</p>
              <button
                onClick={copyAddress}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
                title="Copy address"
              >
                Copy
              </button>
            </div>
          </div>

          {place.phone && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
              <div className="flex items-center gap-2">
                <p className="text-gray-900">{place.phone}</p>
                <button
                  onClick={copyPhone}
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                  title="Copy phone number"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {place.website && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Website</h3>
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {place.website}
              </a>
            </div>
          )}

          {place.priceLevel && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Price Level</h3>
              {renderPriceLevel(place.priceLevel)}
            </div>
          )}
        </div>

        {place.services && place.services.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Services</h3>
            <div className="flex flex-wrap gap-2">
              {place.services.map((service, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
