'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';

const navLinks = [
  { href: '/analytics', label: 'Analytics' },
  { href: '/market-overview', label: 'Market Overview' },
];

export function Navbar() {
  const pathname = usePathname();
  const toggleMobileSidebar = useUIStore((state) => state.toggleMobileSidebar);

  return (
    <nav className="h-[60px] sticky top-0 backdrop-blur bg-gray-900/70 border-b border-gray-800/60 flex items-center px-4 md:px-6 z-50 shadow-md">
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
                CryptoVista
              </div>
            </div>
          </Link>
        </div>

        {/* Center - Navigation Links (hidden on mobile, visible on desktop) */}
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

        {/* Right side - Social Links */}
        <div className="flex items-center gap-2">
          {/* GitHub Link */}
          <a
            href="https://github.com/Vicent00"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/60 transition-all duration-300 hover:scale-105"
            aria-label="GitHub Profile"
            title="GitHub Profile"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>

          {/* LinkedIn Link */}
          <a
            href="https://www.linkedin.com/in/vicente-aguilar00/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/60 transition-all duration-300 hover:scale-105"
            aria-label="LinkedIn Profile"
            title="LinkedIn Profile"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
        </div>
      </div>
    </nav>
  );
}
