import { ReactNode } from 'react';
import StarIcon from './icons/StarIcon';

interface CardArticleProps {
  title: string;
  meta: string;
  illustration: 'dog' | 'catHouse' | 'blueDog' | 'greenHouse' | 'orangeCat';
  background: string;
  compact?: boolean;
}

const illustrations: Record<CardArticleProps['illustration'], ReactNode> = {
  dog: (
    <svg viewBox="0 0 160 140" className="h-full w-full">
      <rect width="160" height="140" rx="20" fill="#FFCFAD" />
      <circle cx="80" cy="60" r="32" fill="#FFA66E" />
      <rect x="64" y="78" width="32" height="26" rx="16" fill="#FFBE94" />
      <circle cx="70" cy="56" r="6" fill="#2E3A47" />
      <circle cx="90" cy="56" r="6" fill="#2E3A47" />
      <path d="M80 63c8 0 8 10 0 10s-8-10 0-10z" fill="#2E3A47" />
    </svg>
  ),
  catHouse: (
    <svg viewBox="0 0 160 140" className="h-full w-full">
      <rect width="160" height="140" rx="24" fill="#E0EFFD" />
      <path d="M40 84h80v32H40z" fill="#94C3FF" />
      <path d="M32 84l48-40 48 40H32z" fill="#173B5A" opacity="0.85" />
      <rect x="68" y="84" width="24" height="32" rx="6" fill="#FFA66E" />
      <circle cx="80" cy="110" r="12" fill="#FFBE94" />
      <path d="M70 106h4l6-8 6 8h4" stroke="#173B5A" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  ),
  blueDog: (
    <svg viewBox="0 0 160 140" className="h-full w-full">
      <rect width="160" height="140" rx="20" fill="#D1EBFF" />
      <ellipse cx="56" cy="80" rx="34" ry="28" fill="#81BFFF" />
      <circle cx="52" cy="56" r="22" fill="#6EA8FF" />
      <circle cx="48" cy="54" r="6" fill="#2E3A47" />
      <path d="M44 88h24" stroke="#2E3A47" strokeWidth="4" strokeLinecap="round" />
      <rect x="92" y="92" width="48" height="12" rx="6" fill="#6EA8FF" />
    </svg>
  ),
  greenHouse: (
    <svg viewBox="0 0 160 140" className="h-full w-full">
      <rect width="160" height="140" rx="24" fill="#DFF2DA" />
      <path d="M40 94h80v32H40z" fill="#A4D68A" />
      <path d="M32 94l48-44 48 44H32z" fill="#5E9C76" />
      <rect x="68" y="94" width="24" height="32" rx="6" fill="#FFF7F1" />
      <path d="M20 118h120" stroke="#A4D68A" strokeWidth="6" strokeLinecap="round" />
    </svg>
  ),
  orangeCat: (
    <svg viewBox="0 0 160 140" className="h-full w-full">
      <rect width="160" height="140" rx="24" fill="#FFD6CC" />
      <path d="M54 36l-14 18h28L54 36zM106 36l14 18h-28l14-18z" fill="#FF9E82" />
      <circle cx="80" cy="72" r="32" fill="#FFA66E" />
      <circle cx="68" cy="68" r="6" fill="#2E3A47" />
      <circle cx="92" cy="68" r="6" fill="#2E3A47" />
      <path d="M80 74c4 0 4 6 0 6s-4-6 0-6z" fill="#2E3A47" />
      <path d="M70 94c8 6 12 6 20 0" stroke="#E57D53" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  ),
};

const CardArticle = ({ title, meta, illustration, background, compact = false }: CardArticleProps) => {
  return (
    <article
      className="flex w-full max-w-[360px] flex-col rounded-[16px] bg-white shadow-[var(--shadow-tight)] transition hover:shadow-[var(--shadow-soft)]"
      style={{ height: compact ? 180 : 220 }}
    >
      <div className="w-full overflow-hidden rounded-t-[16px]" style={{ height: compact ? 100 : 140 }}>
        <div className="h-full w-full" style={{ background }}>
          {illustrations[illustration]}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-4 py-3">
        <h3 className="text-base font-semibold leading-6 text-[color:var(--color-accent)]">{title}</h3>
        <div className="flex items-center gap-2 text-xs font-medium text-[color:var(--color-subtle)]">
          <StarIcon className="h-4 w-4 text-[color:var(--color-star)]" />
          {meta}
        </div>
      </div>
    </article>
  );
};

export default CardArticle;
