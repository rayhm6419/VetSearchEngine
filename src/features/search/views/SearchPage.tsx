"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Chip from '@/components/Chip';
import { getPlaceComparator } from '@/lib/placeSort';
import { Place, PlaceSortOption } from '@/lib/types';

const MILES_PER_KM = 0.621371;
const KM_PER_MILE = 1.60934;

const formatRadiusMiles = (km: number) => String(Number((km * MILES_PER_KM).toFixed(1)));

const formatDistanceMiles = (km: number) => {
  const miles = km * MILES_PER_KM;
  if (miles < 0.1) return '< 0.1 mi away';
  const precision = miles >= 10 ? 0 : 1;
  const display = Number(miles.toFixed(precision));
  return `${display} mi away`;
};

const milesToKm = (miles: number) => miles * KM_PER_MILE;

type Props = {
  initialPlaces: Place[];
  zipParam?: string | null;
  center?: { lat: number; lng: number };
  radiusKm?: number;
  initialType?: 'vet' | 'shelter' | 'all' | undefined;
  initialSort?: PlaceSortOption | undefined;
};

export default function SearchPage({
  initialPlaces,
  zipParam,
  center,
  radiusKm,
  initialType,
  initialSort,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'all' | 'vet' | 'shelter'>(initialType ?? 'all');
  const [sortOption, setSortOption] = useState<PlaceSortOption>(initialSort ?? 'distance');
  const [zipInput, setZipInput] = useState(zipParam ?? '');
  const [radiusInput, setRadiusInput] = useState(() => {
    if (typeof radiusKm === 'number') return formatRadiusMiles(radiusKm);
    return '10';
  });

  const canSearch = zipInput.trim().length > 0 || Boolean(center);

  // fake loading for UX
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // keep input in sync when url changes
  useEffect(() => {
    setZipInput(zipParam ?? '');
  }, [zipParam]);

  // keep radius input in sync when url changes
  useEffect(() => {
    if (typeof radiusKm === 'number') {
      setRadiusInput(formatRadiusMiles(radiusKm));
    } else {
      setRadiusInput('10');
    }
  }, [radiusKm]);

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
      if (place.website) window.open(place.website, '_blank');
      return;
    }
    router.push(`/place/${place.id}`);
  };

  const handleZipChange = (event: ChangeEvent<HTMLInputElement>) => {
    setZipInput(event.target.value);
  };

  const handleRadiusChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRadiusInput(event.target.value);
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWebsite = (website: string) => {
    window.open(website, '_blank');
  };

  const pushWithFilters = ({
    nextType = typeFilter,
    nextSort = sortOption,
    zipValue = zipParam ?? undefined,
    radiusKmValue = radiusKm ?? undefined,
    centerValue = zipParam ? undefined : center,
  }: {
    nextType?: 'all' | 'vet' | 'shelter';
    nextSort?: PlaceSortOption;
    zipValue?: string | null;
    radiusKmValue?: number | null | undefined;
    centerValue?: { lat: number; lng: number } | null | undefined;
  } = {}) => {
    const params = new URLSearchParams();
    if (zipValue) {
      params.set('zip', zipValue);
    } else if (centerValue) {
      params.set('lat', String(centerValue.lat));
      params.set('lng', String(centerValue.lng));
    }
    if (typeof radiusKmValue === 'number' && !Number.isNaN(radiusKmValue) && radiusKmValue > 0) {
      params.set('radiusKm', Number(radiusKmValue.toFixed(2)).toString());
    }
    params.set('type', nextType);
    if (nextSort !== 'distance') params.set('sort', nextSort);
    const query = params.toString();
    router.push(query ? `/search?${query}` : '/search');
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSearch) return;
    const trimmedZip = zipInput.trim();
    const radiusMilesValue = Number.parseFloat(radiusInput);
    const hasRadius = Number.isFinite(radiusMilesValue) && radiusMilesValue > 0;
    const radiusKmValue = hasRadius
      ? Number(Math.max(1, milesToKm(radiusMilesValue)).toFixed(2))
      : radiusKm;
    pushWithFilters({
      nextType: typeFilter,
      nextSort: sortOption,
      zipValue: trimmedZip || undefined,
      radiusKmValue,
      centerValue: trimmedZip ? null : center,
    });
  };

  const handleTypeChange = (nextType: 'all' | 'vet' | 'shelter') => {
    setTypeFilter(nextType);
    pushWithFilters({ nextType });
  };

  const handleSortChange = (value: string) => {
    const nextSort: PlaceSortOption = value === 'rating' ? 'rating' : 'distance';
    setSortOption(nextSort);
    pushWithFilters({ nextSort });
  };

  const handleClearZip = () => {
    router.push('/search');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
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

        {/* 搜索表单 */}
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <label htmlFor="search-zip" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP code
              </label>
              <input
                id="search-zip"
                name="zip"
                value={zipInput}
                onChange={handleZipChange}
                placeholder="Enter ZIP code"
                autoComplete="postal-code"
                inputMode="numeric"
                maxLength={10}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:w-44">
              <label htmlFor="search-radius" className="block text-sm font-medium text-gray-700 mb-1">
                Radius (miles)
              </label>
              <input
                id="search-radius"
                name="radius"
                type="number"
                min={1}
                step={1}
                value={radiusInput}
                onChange={handleRadiusChange}
                placeholder="10"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={!canSearch}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300 disabled:hover:bg-blue-300"
            >
              Search
            </button>
          </div>
        </form>

        {/* 条件摘要 */}
        {(zipParam || center) && (
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
              {zipParam && <span>ZIP: {zipParam}</span>}
              {center && !zipParam && <span>Near: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}</span>}
              {typeof radiusKm === 'number' && <span>• Radius: {radiusKm} km</span>}
              {zipParam && (
                <button onClick={handleClearZip} className="text-blue-600 hover:text-blue-800 underline">
                  Clear ZIP
                </button>
              )}
            </div>
          </div>
        )}

        {/* 顶部过滤与排序 */}
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

        {/* 结果计数 */}
        <p className="text-gray-600 mb-6 text-center">
          {sortedPlaces.length} result{sortedPlaces.length !== 1 ? 's' : ''}
        </p>

        {/* 列表 */}
        <div className="space-y-6">
          {sortedPlaces.map((place) => {
            // 放宽 distance 判断，兼容字符串
            const distKm: any = (place as any).distanceKm;
            const hasDist =
              distKm !== undefined && distKm !== null && !Number.isNaN(Number(distKm));

            return (
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
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          place.type === 'vet' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {place.type === 'vet' ? 'Veterinary' : 'Animal Shelter'}
                      </span>
                      {hasDist && (
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                          {formatDistanceMiles(Number(distKm))}
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
            );
          })}
        </div>
      </div>   
    </div>     
  );
}
