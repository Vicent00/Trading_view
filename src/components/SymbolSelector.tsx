'use client';

import { useState } from 'react';
import { useMarketStore } from '@/store/marketStore';
import type { CryptoSymbol } from '@/types/market';

const SYMBOLS: { symbol: CryptoSymbol; label: string; color: string }[] = [
  { symbol: 'btcusdt', label: 'BTC', color: 'bg-orange-500 hover:bg-orange-600' },
  { symbol: 'ethusdt', label: 'ETH', color: 'bg-blue-500 hover:bg-blue-600' },
  { symbol: 'solusdt', label: 'SOL', color: 'bg-purple-500 hover:bg-purple-600' },
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
    <div className="bg-gray-800 rounded-xl p-4 shadow-xl border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-400 mb-3">Seleccionar Criptomoneda</h3>
      <div className="flex gap-3">
        {SYMBOLS.map((s) => (
          <button
            key={s.symbol}
            onClick={() => handleSymbolChange(s.symbol)}
            disabled={isChanging}
            className={`flex-1 px-6 py-3 rounded-lg font-bold text-white transition-all duration-200 transform ${
              symbol === s.symbol
                ? `${s.color} ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-105 shadow-lg`
                : isChanging
                ? 'bg-gray-700 opacity-50 cursor-not-allowed'
                : 'bg-gray-700 hover:bg-gray-600 hover:scale-105'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
};
