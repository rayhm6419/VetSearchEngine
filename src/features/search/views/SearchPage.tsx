"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Chip from '@/components/Chip';
import { formatDistanceMiles } from '@/lib/distance';
import { getPlaceComparator } from '@/lib/placeSort';
import { Place, PlaceSortOption } from '@/lib/types';

type Props = {
  initialPlaces: Place[];
  zipParam?: string | null;
  center?: { lat: number; lng: number };
  radiusKm?: number;
  initialType?: 'vet' | 'shelter' | 'all' | undefined;
  initialSort?: PlaceSortOption | undefined;
};

export default function SearchPage({ initialPlaces, zipParam, center, radiusKm, initialType, initialSort }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'all' | 'vet' | 'shelter'>(initialType ?? 'all');
  const [sortOption, setSortOption] = useState<PlaceSortOption>(initialSort ?? 'distance');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredPlaces = useMemo(
    () => initialPlaces.filter((place) => typeFilter === 'all' || place.type === typeFilter),
    [initialPlaces, typeFilter],
  );

  const sortedPlaces = useMemo(() => {
    const comparator = getPlaceComparator(sortOption);
    return [...filteredPlaces].sort(comparator);
  }, [filteredPlaces, sortOption]);

  const handleCardClick = (place: Place) => {
    if (place.source === 'petfinder') {
      const extId = place.externalId || place.id.replace(/^petfinder:/, '');
      router.push(`/shelter/${extId}`);
      return;
    }
    if (place.source && place.source !== 'db') {
      // Other external providers (e.g., Yelp) → open website if available
      if (place.website) window.open(place.website, '_blank');
      return;
    }
    router.push(`/place/${place.id}`);
  };

  const handleClearZip = () => {
    router.push('/search');
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWebsite = (website: string) => {
    window.open(website, '_blank');
  };
  const pushWithFilters = (nextType: 'all' | 'vet' | 'shelter', nextSort: PlaceSortOption) => {
    const params = new URLSearchParams();
    if (zipParam) {
      params.set('zip', zipParam);
    } else if (center) {
      params.set('lat', String(center.lat));
      params.set('lng', String(center.lng));
    }
    if (radiusKm != null) params.set('radiusKm', String(radiusKm));
    params.set('type', nextType);
    if (nextSort !== 'distance') params.set('sort', nextSort);
    const query = params.toString();
    router.push(query ? `/search?${query}` : '/search');
  };

  const handleTypeChange = (nextType: 'all' | 'vet' | 'shelter') => {
    setTypeFilter(nextType);
    pushWithFilters(nextType, sortOption);
  };

  const handleSortChange = (value: string) => {
    const nextSort: PlaceSortOption = value === 'rating' ? 'rating' : 'distance';
    setSortOption(nextSort);
    pushWithFilters(typeFilter, nextSort);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading nearby vets & shelters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => router.push('/')}
          className="inline-block rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 mb-6"
        >
          Go Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Nearby Vets & Shelters
        </h1>

        {(zipParam || center) && (
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
              {zipParam && <span>ZIP: {zipParam}</span>}
              {center && !zipParam && <span>Near: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}</span>}
              {typeof radiusKm === 'number' && <span>• Radius: {radiusKm} km</span>}
              {zipParam && (
                <button
                  onClick={handleClearZip}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Clear ZIP
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex justify-center gap-3">
            <Chip selected={typeFilter === 'all'} onClick={() => handleTypeChange('all')}>All</Chip>
            <Chip selected={typeFilter === 'vet'} onClick={() => handleTypeChange('vet')}>Vet</Chip>
            <Chip selected={typeFilter === 'shelter'} onClick={() => handleTypeChange('shelter')}>Shelter</Chip>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortOption}
              onChange={(event) => handleSortChange(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="distance">Distance (Close to far)</option>
              <option value="rating">Rating &amp; Reviews (Good to poor)</option>
            </select>
          </div>
        </div>

        <p className="text-gray-600 mb-6 text-center">
          {sortedPlaces.length} result{sortedPlaces.length !== 1 ? 's' : ''}
        </p>

        <div className="space-y-6">
          {sortedPlaces.map((place) => (
            <div
              key={place.id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => handleCardClick(place)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 mb-4 sm:mb-0">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{place.name}</h2>
                  <p className="text-gray-600 mb-2">{place.address}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${place.type === 'vet' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}
                    >
                      {place.type === 'vet' ? 'Veterinary' : 'Animal Shelter'}
                    </span>
                    {typeof place.distanceKm === 'number' && (
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                        {place.distanceKm < 1
                          ? `${Math.round(place.distanceKm * 1000)} m`
                          : `${place.distanceKm.toFixed(1)} km`}{' '}
                        away
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {place.phone && (
                    <button
                      onClick={(event) => { event.stopPropagation(); handleCall(place.phone!); }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                    >
                      Call
                    </button>
                  )}
                  {place.website && (
                    <button
                      onClick={(event) => { event.stopPropagation(); handleWebsite(place.website!); }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
                    >
                      Website
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
