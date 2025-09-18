import DropIcon from './icons/DropIcon';
import PawIcon from './icons/PawIcon';
import PlusIcon from './icons/PlusIcon';

const MapPanel = () => {
  return (
    <div className="relative h-full overflow-hidden rounded-[16px] bg-gradient-to-br from-[color:var(--color-map-land)] to-[color:var(--color-map-water)] shadow-[var(--shadow-soft)]">
      <div className="absolute inset-0 opacity-70">
        <svg width="100%" height="100%" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="120" height="120" patternUnits="userSpaceOnUse">
              <rect width="120" height="120" fill="transparent" stroke="#DDE6F5" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <path d="M0 120 C200 80, 300 160, 600 120" stroke="#FFD4AD" strokeWidth="6" fill="none" />
          <path d="M0 220 C260 180, 420 260, 800 200" stroke="#B6D7FF" strokeWidth="6" fill="none" />
        </svg>
      </div>

      <div className="absolute left-[28%] top-[45%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg">
          <DropIcon className="h-6 w-6 text-[color:var(--color-shelter-pin)]" />
        </div>
      </div>

      <div className="absolute right-[22%] top-[55%] flex -translate-y-1/2 flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-vet-pin)]">
            <PawIcon className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Expand map"
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-105"
      >
        <PlusIcon className="h-5 w-5 text-[color:var(--color-accent)]" />
      </button>
    </div>
  );
};

export default MapPanel;
