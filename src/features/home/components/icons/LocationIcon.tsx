import type { SVGProps } from 'react';

const LocationIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <path
      d="M12 2.5a7 7 0 0 0-7 7c0 4.6 5.5 11 6.6 12.3.2.2.6.2.8 0C13.5 20.5 19 14 19 9.5a7 7 0 0 0-7-7Zm0 9.2a2.3 2.3 0 1 1 0-4.6 2.3 2.3 0 0 1 0 4.6Z"
      fill="currentColor"
    />
  </svg>
);

export default LocationIcon;
