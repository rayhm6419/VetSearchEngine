import Image from 'next/image';
import ShareIcon from './icons/ShareIcon';

const Hero = () => {
  return (
    <section className="mx-auto mt-8 flex max-w-[1200px] overflow-hidden" style={{ height: 420 }}>
      <div className="relative flex-[0.55] overflow-hidden rounded-tl-[48px]">
        <Image
          src="/images/hero-shepherd.jpg"
          alt="German shepherd with flower on head"
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover object-center"
        />
      </div>
      <div className="flex flex-[0.45] flex-col justify-center bg-gradient-to-br from-white/90 to-[#F9F1EA] px-12">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-subtle)]">
          A warm welcome to pet owners
        </p>
        <h1 className="text-[52px] leading-tight font-bold text-[color:var(--color-accent)]">
          Find Loving
          <br />
          Shelters &amp;
          <br />
          Trusted Vets
          <br />
          Near You
        </h1>
        <p className="mt-4 text-base font-medium text-[color:var(--color-subtle)]">A warm welcome to pet owners</p>
        <div className="mt-8 flex items-center gap-4">
          <button
            type="button"
            className="rounded-full bg-[color:var(--color-primary)] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[color:var(--color-primary-hover)]"
          >
            Search Nearby
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-[#F7F9FC] px-5 py-3 text-base font-semibold text-[rgba(23,59,90,0.8)] shadow-[var(--shadow-tight)] transition-colors hover:text-[rgba(23,59,90,1)]"
            aria-label="Share PawFinder"
          >
            <ShareIcon className="h-5 w-5 text-[rgba(23,59,90,0.8)]" />
            Share
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
