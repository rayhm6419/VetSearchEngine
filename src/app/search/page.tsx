'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PLACES } from '@/lib/mock-data';
import Chip from '@/components/Chip';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'all' | 'vet' | 'shelter'>('all');

  // Get ZIP code from query parameters
  const zipParam = searchParams.get('zip');

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Filter places by both ZIP code and type
  const visible = PLACES.filter(p => {
    const matchesZip = !zipParam || p.zipcode === zipParam;
    const matchesType = typeFilter === "all" || p.type === typeFilter;
    return matchesZip && matchesType;
  });

  const handleClearZip = () => {
    router.push('/search');
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWebsite = (website: string) => {
    window.open(website, '_blank');
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
        {/* Go Back Button */}
        <button
          onClick={() => router.push('/')}
          className="inline-block rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 mb-6"
        >
          Go Back
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Nearby Vets & Shelters
        </h1>
        
        {/* ZIP Filter Pill */}
        {zipParam && (
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
              <span>ZIP: {zipParam}</span>
              <button
                onClick={handleClearZip}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Clear ZIP
              </button>
            </div>
          </div>
        )}
        
        {/* Filter Chips */}
        <div className="flex justify-center gap-3 mb-6">
          <Chip
            selected={typeFilter === 'all'}
            onClick={() => setTypeFilter('all')}
          >
            All
          </Chip>
          <Chip
            selected={typeFilter === 'vet'}
            onClick={() => setTypeFilter('vet')}
          >
            Vet
          </Chip>
          <Chip
            selected={typeFilter === 'shelter'}
            onClick={() => setTypeFilter('shelter')}
          >
            Shelter
          </Chip>
        </div>

        {/* Result Count */}
        <p className="text-gray-600 mb-6 text-center">
          {visible.length} result{visible.length !== 1 ? 's' : ''}
        </p>
        
        <div className="space-y-6">
          {visible.map((place) => (
            <div
              key={place.id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 mb-4 sm:mb-0">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {place.name}
                  </h2>
                  <p className="text-gray-600 mb-2">
                    {place.address}
                  </p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    place.type === 'vet' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {place.type === 'vet' ? 'Veterinary' : 'Animal Shelter'}
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {place.phone && (
                    <button
                      onClick={() => handleCall(place.phone!)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                    >
                      Call
                    </button>
                  )}
                  {place.website && (
                    <button
                      onClick={() => handleWebsite(place.website!)}
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
