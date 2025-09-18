import Image from 'next/image';
import StarIcon from './icons/StarIcon';

interface CardPlaceProps {
  title: string;
  rating?: number;
  reads: string;
  image: string;
}

const CardPlace = ({ title, rating = 5, reads, image }: CardPlaceProps) => {
  return (
    <article className="flex h-[220px] w-full max-w-[360px] flex-col rounded-[16px] bg-white shadow-[var(--shadow-tight)] transition hover:shadow-[var(--shadow-soft)]">
      <div className="relative h-[140px] w-full overflow-hidden rounded-t-[16px]">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 360px"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 px-4 py-3">
        <h3 className="text-base font-semibold leading-6 text-[color:var(--color-accent)]">{title}</h3>
        <div className="flex items-center gap-2 text-xs font-medium text-[color:var(--color-subtle)]">
          <div className="flex items-center gap-1 text-[color:var(--color-star)]">
            {Array.from({ length: Math.round(rating) }).map((_, index) => (
              <StarIcon key={index} className="h-4 w-4 text-[color:var(--color-star)]" />
            ))}
          </div>
          <span>{reads}</span>
        </div>
      </div>
    </article>
  );
};

export default CardPlace;
