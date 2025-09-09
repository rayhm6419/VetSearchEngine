export type NavLink = {
  href: string;
  label: string;
  cta?: boolean;
};

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Story", href: "/story" },
  { label: "Add a Clinic", href: "/add-clinic", cta: true },
  { label: "Contact", href: "/contact" },
];


