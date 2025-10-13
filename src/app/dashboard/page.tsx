'use client';

import { useBinanceWebSocket } from '@/hooks/useBinanceWebSocket';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { SymbolSelector } from '@/components/SymbolSelector';
import { PriceTicker } from '@/components/PriceTicker';
import { TradesList } from '@/components/TradesList';
import { Chart } from '@/components/Chart';
import Link from 'next/link';

export default function Dashboard() {
  useBinanceWebSocket();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-gray-800 border-b border-gray-700 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-2xl font-bold text-white hover:text-blue-400 transition-colors"
            >
              🚀 Crypto Tracker
            </Link>
            <ConnectionStatus />
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Symbol Selector */}
        <SymbolSelector />

        {/* Price Ticker */}
        <PriceTicker />

        {/* Chart and Trades Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Chart />
          </div>
          <div>
            <TradesList />
          </div>
        </div>
      </div>
    </div>
  );
}
