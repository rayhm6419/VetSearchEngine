import { Place } from '@/lib/types';

interface MapCardProps {
  place: Place;
}

export default function MapCard({ place }: MapCardProps) {
  if (!place.lat || !place.lng) {
    return null;
  }

  const handleOpenMaps = () => {
    const mapsUrl = `https://www.google.com/maps?q=${place.lat},${place.lng}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
      
      <div className="relative">
        {/* Placeholder for map - in a real app, you'd integrate with Google Maps or similar */}
        <div 
          className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors duration-200"
          onClick={handleOpenMaps}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">📍</div>
            <p className="text-gray-600 font-medium">View on Google Maps</p>
            <p className="text-sm text-gray-500 mt-1">
              {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleOpenMaps}
          className="absolute top-4 right-4 px-3 py-1 bg-white rounded shadow-md text-sm font-medium hover:bg-gray-50 transition-colors duration-200"
        >
          Open Maps
        </button>
      </div>
    </div>
  );
}
