'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/analytics', label: 'Analytics' },
  { href: '/market-overview', label: 'Market Overview' },
  { href: '/compare', label: 'Compare' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="h-[60px] bg-[#0a0a0a] border-b border-gray-800 flex items-center px-6">
      <div className="flex items-center justify-between w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-300 via-white to-gray-400">
            Crypto Analytics
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-1">
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
