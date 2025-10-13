'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gray-700 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-32">
          <div className="text-center">
            {/* Logo/Title */}
            <div className="mb-8">
              <h1 className="text-6xl sm:text-7xl font-bold text-white mb-4 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-300 via-white to-gray-400">
                  Crypto Tracker
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 font-light">
                Monitoriza tus criptomonedas favoritas en tiempo real
              </p>
            </div>

            {/* CTA Button */}
            <div className="mb-16">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg shadow-lg hover:from-gray-700 hover:to-gray-600 transform hover:scale-105 transition-all duration-200 hover:shadow-xl border border-gray-600"
              >
                Ir al Dashboard
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Feature 1 */}
              <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-500 transition-all duration-300 hover:transform hover:scale-105">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold text-white mb-2">Datos en Tiempo Real</h3>
                <p className="text-gray-400">
                  Conexión directa con el WebSocket de Binance para actualizaciones instantáneas
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-500 transition-all duration-300 hover:transform hover:scale-105">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-white mb-2">Gráficos Interactivos</h3>
                <p className="text-gray-400">
                  Visualiza velas de 1 minuto con gráficos profesionales de TradingView
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-500 transition-all duration-300 hover:transform hover:scale-105">
                <div className="text-4xl mb-4">💎</div>
                <h3 className="text-xl font-semibold text-white mb-2">Múltiples Criptos</h3>
                <p className="text-gray-400">
                  Monitoriza Bitcoin (BTC), Ethereum (ETH) y Solana (SOL) en un solo lugar
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            Powered by{' '}
            <span className="text-gray-300 font-semibold">Binance WebSocket API</span>
            {' '}&{' '}
            <span className="text-gray-300 font-semibold">Lightweight Charts</span>
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Crypto Tracker © 2025 - Datos en tiempo real sin necesidad de API keys
          </p>
        </div>
      </footer>
    </div>
  );
}
