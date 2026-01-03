import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-black relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 px-8">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-white">
              Primer
            </Link>
          </div>
          <nav className="flex space-x-8">
            <Link
              href="/pricing"
              className="text-white hover:text-gray-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Pricing
            </Link>

            <Link
              href="/blog"
              className="text-white hover:text-gray-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Blog
            </Link>

            <Link
              href="/faq"
              className="text-white hover:text-gray-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              FAQ
            </Link>

            <button className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
              Download
            </button>
          </nav>
        </div>
      </div>
      <div className="bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-black via-white to-black" />
    </header>
  );
}
