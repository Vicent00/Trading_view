'use client';

import { useState } from 'react';
import { useMarketStore } from '@/store/marketStore';
import type { CryptoSymbol } from '@/types/market';

const SYMBOLS: { symbol: CryptoSymbol; label: string; color: string }[] = [
  { symbol: 'btcusdt', label: 'BTC', color: 'bg-orange-500 hover:bg-orange-600' },
  { symbol: 'ethusdt', label: 'ETH', color: 'bg-blue-500 hover:bg-blue-600' },
  { symbol: 'solusdt', label: 'SOL', color: 'bg-purple-500 hover:bg-purple-600' },
  { symbol: 'bnbusdt', label: 'BNB', color: 'bg-yellow-500 hover:bg-yellow-600' },
  { symbol: 'xrpusdt', label: 'XRP', color: 'bg-slate-500 hover:bg-slate-600' },
  { symbol: 'adausdt', label: 'ADA', color: 'bg-cyan-500 hover:bg-cyan-600' },
  { symbol: 'dogeusdt', label: 'DOGE', color: 'bg-amber-500 hover:bg-amber-600' },
  { symbol: 'maticusdt', label: 'MATIC', color: 'bg-indigo-500 hover:bg-indigo-600' },
  { symbol: 'dotusdt', label: 'DOT', color: 'bg-pink-500 hover:bg-pink-600' },
  { symbol: 'avaxusdt', label: 'AVAX', color: 'bg-red-500 hover:bg-red-600' },
  { symbol: 'linkusdt', label: 'LINK', color: 'bg-sky-500 hover:bg-sky-600' },
  { symbol: 'uniusdt', label: 'UNI', color: 'bg-fuchsia-500 hover:bg-fuchsia-600' },
  { symbol: 'ltcusdt', label: 'LTC', color: 'bg-gray-500 hover:bg-gray-600' },
  { symbol: 'trxusdt', label: 'TRX', color: 'bg-rose-500 hover:bg-rose-600' },
  { symbol: 'atomusdt', label: 'ATOM', color: 'bg-violet-500 hover:bg-violet-600' },
];

export const SymbolSelector = () => {
  const symbol = useMarketStore((state) => state.symbol);
  const setSymbol = useMarketStore((state) => state.setSymbol);
  const [isChanging, setIsChanging] = useState(false);

  const handleSymbolChange = (newSymbol: CryptoSymbol) => {
    if (isChanging || newSymbol === symbol) return;

    setIsChanging(true);
    setSymbol(newSymbol);

    // Re-enable buttons after 800ms to prevent rapid switching
    setTimeout(() => {
      setIsChanging(false);
    }, 800);
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-xl border border-slate-700">
      <h3 className="text-xs sm:text-sm font-semibold text-gray-400 mb-2 md:mb-3">Select Cryptocurrency</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-2 md:gap-3">
        {SYMBOLS.map((s) => (
          <button
            key={s.symbol}
            onClick={() => handleSymbolChange(s.symbol)}
            disabled={isChanging}
            className={`px-2 sm:px-3 md:px-4 py-2 md:py-3 rounded-lg font-bold text-white text-xs sm:text-sm md:text-base transition-all duration-200 transform ${
              symbol === s.symbol
                ? `${s.color} ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-105 shadow-lg`
                : isChanging
                ? 'bg-slate-800 opacity-50 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-700 hover:scale-105'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
};
