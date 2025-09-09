import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="text-gray-400 mx-2" aria-hidden="true">
                /
              </span>
            )}
            {item.href && !item.current ? (
              <Link
                href={item.href}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`${
                  item.current
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-600'
                }`}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
