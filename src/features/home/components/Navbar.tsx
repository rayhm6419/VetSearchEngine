'use client';

import PawIcon from './icons/PawIcon';
import LocationIcon from './icons/LocationIcon';

const links = ['Home', 'Shelters', 'Vets', 'Tips', 'About', 'Contact'];

const Navbar = () => {
  return (
    <nav className="sticky top-0 left-0 right-0 z-40 bg-[#FFFDFB]/90 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-6 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[color:var(--color-primary)] shadow-[var(--shadow-tight)]">
            <PawIcon className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-[color:var(--color-accent)]">PawPoint</span>
        </div>
        <div className="hidden items-center gap-6 text-sm font-medium text-[rgba(23,59,90,0.8)] md:flex">
          {links.map((item) => (
            <button
              key={item}
              type="button"
              className="transition-colors hover:text-[rgba(23,59,90,1)]"
            >
              {item}
            </button>
          ))}
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-[color:var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--color-primary-hover)]"
          >
            <LocationIcon className="h-4 w-4 text-white" />
            Search Nearby
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
