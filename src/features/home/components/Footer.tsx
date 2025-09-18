import PawIcon from './icons/PawIcon';
import ShareIcon from './icons/ShareIcon';

const Footer = () => {
  const explore = ['Home', 'Shelters', 'Vets', 'Tips', 'About', 'Contact'];
  const support = ['Help Center', 'Safety', 'Terms', 'Privacy', 'Community'];

  return (
    <footer className="mt-16 border-t border-[color:var(--color-footer-border)] bg-[color:var(--color-footer-bg)] text-[color:var(--color-text)]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[color:var(--color-primary)] shadow-[var(--shadow-tight)]">
                <PawIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-semibold text-[color:var(--color-accent)]">PawPoint</span>
            </div>
            <p className="text-sm leading-6 text-[color:var(--color-subtle)]">
              Connecting caring pet owners with the warmest shelters and the most trusted vets around the corner.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--color-accent)]">Explore</h4>
            <ul className="mt-4 space-y-2 text-sm text-[color:var(--color-subtle)]">
              {explore.map((item) => (
                <li key={item}>
                  <a className="transition hover:text-[color:var(--color-primary)]" href="#">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--color-accent)]">Support</h4>
            <ul className="mt-4 space-y-2 text-sm text-[color:var(--color-subtle)]">
              {support.map((item) => (
                <li key={item}>
                  <a className="transition hover:text-[color:var(--color-primary)]" href="#">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-start justify-between gap-4 border-t border-[#F0E3D9] pt-6 text-xs text-[color:var(--color-subtle)] md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} PawFinder. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[var(--shadow-tight)] transition hover:scale-105"
              aria-label="Share PawFinder"
            >
              <ShareIcon className="h-4 w-4 text-[color:var(--color-accent)]" />
            </button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[var(--shadow-tight)] transition hover:scale-105"
              aria-label="Follow PawFinder"
            >
              <PawIcon className="h-4 w-4 text-[color:var(--color-primary)]" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
