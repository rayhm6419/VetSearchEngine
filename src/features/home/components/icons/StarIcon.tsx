import type { SVGProps } from 'react';

const StarIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="currentColor" className={className} {...props}>
    <path d="m10 2.5 2.2 4.7 5.2.7-3.8 3.6.9 5.1-4.5-2.4-4.5 2.4.9-5.1-3.8-3.6 5.2-.7L10 2.5Z" />
  </svg>
);

export default StarIcon;
