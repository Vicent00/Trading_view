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
    <nav className="h-[60px] bg-[#0a0a0a] border-b border-gray-800 flex items-center px-4 md:px-6 relative z-50">
      <div className="flex items-center justify-between w-full">
        {/* Mobile: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Button (visible only on mobile) */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="text-lg md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-300 via-white to-gray-400">
              Crypto Analytics
            </div>
          </Link>
        </div>

        {/* Navigation Links (hidden on mobile, visible on desktop) */}
        <div className="hidden lg:flex items-center space-x-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
