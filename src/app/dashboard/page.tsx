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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/"
              className="text-slate-400 hover:text-cyan-400 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">Crypto Dashboard</h1>
          </div>
          <ConnectionStatus />
        </div>

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