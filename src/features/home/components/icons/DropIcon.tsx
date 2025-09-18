import type { SVGProps } from 'react';

const DropIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" className={className} {...props}>
    <path d="M12 2.5c3 3.6 6.5 7.4 6.5 10.8a6.5 6.5 0 0 1-13 0C5.5 9.9 9 6.1 12 2.5Z" fill="currentColor" />
  </svg>
);

export default DropIcon;
