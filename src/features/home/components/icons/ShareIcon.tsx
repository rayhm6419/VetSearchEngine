import type { SVGProps } from 'react';

const ShareIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
    <path d="M4.5 12a7.5 7.5 0 0 1 12.8-5.3l1.7 1.7M20 3v5.5h-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19.5 12a7.5 7.5 0 0 1-12.8 5.3l-1.7-1.7M4 21v-5.5h5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default ShareIcon;
