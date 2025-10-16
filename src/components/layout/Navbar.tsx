'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';

const navLinks = [
  { href: '/analytics', label: 'Analytics' },
  { href: '/market-overview', label: 'Market Overview' },
  { href: '/compare', label: 'Compare' },
];

export function Navbar() {
  const pathname = usePathname();
  const toggleMobileSidebar = useUIStore((state) => state.toggleMobileSidebar);

  return (
    <nav className="h-[60px] bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50 flex items-center px-4 md:px-6 relative z-50 shadow-lg">
      <div className="flex items-center justify-between w-full">
        {/* Mobile: Hamburger + Logo */}
        <div className="flex items-center gap-4">
          {/* Hamburger Menu Button (visible only on mobile) */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-700/60 transition-all duration-300 hover:scale-105"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-all duration-300 hover:scale-105">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-300 tracking-tight">
                Crypto Analytics
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Links (hidden on mobile, visible on desktop) */}
        <div className="hidden lg:flex items-center space-x-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative group ${
                  isActive
                    ? 'bg-gray-700/80 text-white shadow-md'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50 hover:shadow-sm'
                }`}
              >
                {link.label}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
