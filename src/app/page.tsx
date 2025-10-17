'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background overlays (radial glow + subtle grid) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent_60%)] opacity-20"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px] opacity-10"></div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-32">
          <div className="text-center">
            {/* Logo/Title */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-center gap-4 mb-3 sm:mb-4">
                <Image 
                  src="/transparentlogo.png" 
                  alt="CryptoVista Logo" 
                  width={64} 
                  height={64} 
                  className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24"
                  priority
                />
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-100 via-white to-gray-200 drop-shadow-[0_0_12px_rgba(255,255,255,0.08)]">
                    CryptoVista
                  </span>
                </h1>
              </div>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 font-light px-4">
                Monitor your favorite cryptocurrencies in real-time
              </p>
            </div>

            {/* CTA Button */}
            <div className="mb-12 sm:mb-16">
              <Link
                href="/analytics"
                className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white rounded-xl bg-white/5 hover:bg_white/10 border border-white/15 shadow-lg hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] ring-1 ring-white/10 hover:ring-white/30 transition-all duration-300 backdrop-blur"
              >
                Go to Dashboard
                <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto px-4">
              {/* Feature 1 */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-0.5">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Real-Time Data</h3>
                <p className="text-sm sm:text-base text-gray-400">
                  Direct connection to Binance WebSocket for instant updates
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-0.5">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Interactive Charts</h3>
                <p className="text-sm sm:text-base text-gray-400">
                  Visualize 1-minute candles with professional TradingView charts
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-0.5 sm:col-span-2 md:col-span-1">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Multiple Cryptos</h3>
                <p className="text-sm sm:text-base text-gray-400">
                  Monitor Bitcoin (BTC), Ethereum (ETH) and Solana (SOL) in one place
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-gray-800 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm sm:text-base text-gray-400">
            Powered by{' '}
            <span className="text-gray-300 font-semibold">Binance WebSocket API</span>
            {' '}&{' '}
            <span className="text-gray-300 font-semibold">Lightweight Charts</span>
          </p>
          <p className="text-gray-500 text-xs sm:text-sm mt-2">
            CryptoVista © 2025 - Real-time data without API keys required
          </p>
        </div>
      </footer>
    </div>
  );
}
