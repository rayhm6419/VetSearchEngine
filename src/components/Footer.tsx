import Link from 'next/link';

interface FooterProps {
  className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-700 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column A: Brand */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              🐾 PetCare
            </h2>
            <p className="text-gray-600 dark:text-neutral-300 text-sm">
              A simple way to find nearby vets & shelters.
            </p>
          </div>

          {/* Column B: Product links */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Product
            </h2>
            <nav aria-label="Footer Product Navigation" className="space-y-2">
              <Link 
                href="/" 
                className="block text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 rounded"
              >
                Home
              </Link>
              <Link 
                href="/about" 
                className="block text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 rounded"
              >
                About
              </Link>
              <Link 
                href="/story" 
                className="block text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 rounded"
              >
                Story
              </Link>
              <Link 
                href="/add-clinic" 
                className="block text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 rounded"
              >
                Add a Clinic
              </Link>
              <Link 
                href="/contact" 
                className="block text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 rounded"
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* Column C: Help & Legal */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Help & Legal
            </h2>
            <nav aria-label="Footer Help Navigation" className="space-y-2">
              <Link 
                href="/faq" 
                className="block text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 rounded"
              >
                FAQ
              </Link>
              <Link 
                href="/privacy" 
                className="block text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 rounded"
              >
                Privacy
              </Link>
              <Link 
                href="/terms" 
                className="block text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 rounded"
              >
                Terms
              </Link>
              <Link 
                href="/contact" 
                className="block text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 rounded"
              >
                Report an issue
              </Link>
            </nav>
          </div>

          {/* Column D: Stay in touch */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Stay in touch
            </h2>
            <div className="space-y-4">
              {/* Email */}
              <a 
                href="mailto:hello@petcare.example" 
                className="block text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 rounded"
              >
                hello@petcare.example
              </a>
              
              {/* Social links */}
              <div className="flex space-x-3">
                <a 
                  href="#" 
                  aria-label="Follow us on X (Twitter)"
                  className="text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 rounded"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a 
                  href="#" 
                  aria-label="Follow us on Instagram"
                  className="text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 rounded"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.328-1.297C4.243 14.794 3.8 13.643 3.8 12.346s.443-2.448 1.321-3.328c.88-.88 2.031-1.321 3.328-1.321s2.448.441 3.328 1.321c.88.88 1.321 2.031 1.321 3.328s-.441 2.448-1.321 3.328c-.88.807-2.031 1.297-3.328 1.297zm7.718-1.297c-.88.807-2.031 1.297-3.328 1.297s-2.448-.49-3.328-1.297c-.88-.88-1.321-2.031-1.321-3.328s.441-2.448 1.321-3.328c.88-.88 2.031-1.321 3.328-1.321s2.448.441 3.328 1.321c.88.88 1.321 2.031 1.321 3.328s-.441 2.448-1.321 3.328z"/>
                  </svg>
                </a>
                <a 
                  href="#" 
                  aria-label="Visit our GitHub"
                  className="text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 rounded"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>

              {/* Newsletter */}
              <div className="space-y-2">
                <label htmlFor="newsletter-email" className="block text-sm font-medium text-gray-900 dark:text-white">
                  Email address
                </label>
                <div className="flex">
                  <input 
                    type="email" 
                    id="newsletter-email"
                    name="newsletter-email"
                    className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 dark:border-neutral-600 rounded-l-md bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                    placeholder="Enter your email"
                    disabled
                  />
                  <button 
                    type="button"
                    disabled
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-400 dark:bg-neutral-600 border border-gray-400 dark:border-neutral-600 rounded-r-md cursor-not-allowed focus:outline-none"
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-sm text-gray-600 dark:text-neutral-300">
              © {currentYear} PetCare. Made with ❤️ for pets.
            </p>
            <div className="flex items-center space-x-4">
              <label htmlFor="locale-select" className="sr-only">
                Select language
              </label>
              <select 
                id="locale-select"
                className="text-sm border border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
              >
                <option value="en">EN</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
