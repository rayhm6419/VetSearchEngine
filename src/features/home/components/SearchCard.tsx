"use client";

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import LocationIcon from './icons/LocationIcon';
import DropIcon from './icons/DropIcon';
import VetIcon from './icons/VetIcon';
import CaretIcon from './icons/CaretIcon';

const petTypes = [
  { label: 'All Pets', value: 'all' },
  { label: 'Dogs', value: 'dog' },
  { label: 'Cats', value: 'cat' },
  { label: 'Small Animals', value: 'small' },
];

const ratingOptions = [
  { label: 'Any Rating', value: 'any' },
  { label: '4+ Stars', value: '4' },
  { label: '4.5+ Stars', value: '4.5' },
  { label: '5 Stars', value: '5' },
];

const openOptions = [
  { label: 'Any Time', value: 'any' },
  { label: 'Open Now', value: 'open' },
];

const SearchCard = () => {
  const router = useRouter();
  const [zip, setZip] = useState('');
  const [mode, setMode] = useState<'shelter' | 'vet'>('shelter');
  const [petType, setPetType] = useState('all');
  const [rating, setRating] = useState('any');
  const [openNow, setOpenNow] = useState('any');
  const [error, setError] = useState<string | null>(null);

  const isShelter = mode === 'shelter';

  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    if (zip.trim()) params.set('zip', zip.trim());
    params.set('type', isShelter ? 'shelter' : 'vet');
    if (petType !== 'all') params.set('petType', petType);
    if (rating !== 'any') params.set('rating', rating);
    if (openNow === 'open') params.set('open', 'true');
    return params.toString();
  }, [zip, isShelter, petType, rating, openNow]);

  const handleSearch = () => {
    if (!zip.trim()) {
      setError('Please enter a ZIP code to begin.');
      return;
    }
    setError(null);
    router.push(`/search?${searchParams}`);
  };

  const sharedSelectClasses =
    'w-full appearance-none rounded-[12px] border border-[color:var(--color-card-border)] bg-white px-4 py-3 text-left text-sm font-medium text-[color:var(--color-subtle)] transition focus:border-[color:var(--color-primary)] focus:text-[color:var(--color-primary)] outline-none';

  return (
    <div className="flex h-full flex-col justify-between rounded-[16px] bg-white px-5 py-6 shadow-[var(--shadow-soft)]">
      <div className="space-y-5">
        <h3 className="text-sm font-semibold text-[color:var(--color-accent)]">Location</h3>
        <label className="flex items-center gap-3 rounded-[12px] bg-[color:var(--color-input-bg)] px-4 py-3 text-sm font-medium text-[color:var(--color-subtle)] focus-within:ring-2 focus-within:ring-[color:var(--color-primary)]">
          <LocationIcon className="h-5 w-5 text-[color:var(--color-primary)]" />
          <input
            value={zip}
            onChange={(event) => setZip(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleSearch();
              }
            }}
            placeholder="Enter ZIP code"
            inputMode="numeric"
            className="w-full bg-transparent text-sm font-semibold text-[color:var(--color-accent)] outline-none placeholder:text-[color:var(--color-subtle)]"
            aria-label="Enter ZIP code"
          />
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setMode('shelter')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
              isShelter
                ? 'border border-transparent bg-[#FFF1E7] text-[color:var(--color-primary)] shadow-[var(--shadow-tight)]'
                : 'border border-[color:var(--color-card-border)] bg-white text-[color:var(--color-subtle)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]'
            }`}
            aria-pressed={isShelter}
          >
            <DropIcon className="h-4 w-4" />
            Shelter
          </button>
          <button
            type="button"
            onClick={() => setMode('vet')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
              !isShelter
                ? 'border border-transparent bg-[#FFF1E7] text-[color:var(--color-primary)] shadow-[var(--shadow-tight)]'
                : 'border border-[color:var(--color-card-border)] bg-white text-[color:var(--color-subtle)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]'
            }`}
            aria-pressed={!isShelter}
          >
            <VetIcon className="h-4 w-4" />
            Veterinarian
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="relative">
            <select
              value={petType}
              onChange={(event) => setPetType(event.target.value)}
              className={`${sharedSelectClasses} pr-10`}
            >
              {petTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <CaretIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-subtle)]" />
          </div>
          <div className="relative">
            <select
              value={rating}
              onChange={(event) => setRating(event.target.value)}
              className={`${sharedSelectClasses} pr-10`}
            >
              {ratingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <CaretIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-subtle)]" />
          </div>
          <div className="relative">
            <select
              value={openNow}
              onChange={(event) => setOpenNow(event.target.value)}
              className={`${sharedSelectClasses} pr-10`}
            >
              {openOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <CaretIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-subtle)]" />
          </div>
        </div>
        {error && <p className="text-xs font-medium text-[color:var(--color-primary)]">{error}</p>}
      </div>
      <button
        type="button"
        onClick={handleSearch}
        className="mt-6 rounded-full bg-[color:var(--color-primary)] py-3 text-base font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
      >
        Search
      </button>
    </div>
  );
};

export default SearchCard;
