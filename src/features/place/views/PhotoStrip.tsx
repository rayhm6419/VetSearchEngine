import { Place } from '@/lib/types';

interface PhotoStripProps {
  place: Place;
}

export default function PhotoStrip({ place }: PhotoStripProps) {
  if (!place.photos || place.photos.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos</h2>
      
      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-2" style={{ width: 'max-content' }}>
          {place.photos.map((photo, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-48 h-32 rounded-lg overflow-hidden"
            >
              <img
                src={photo}
                alt={`${place.name} photo ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

