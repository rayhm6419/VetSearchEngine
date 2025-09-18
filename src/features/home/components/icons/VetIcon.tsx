import type { SVGProps } from 'react';

const VetIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M6 12h12" />
    <path d="M12 6v12" />
    <circle cx="12" cy="12" r="9" />
  </svg>
);

export default VetIcon;
