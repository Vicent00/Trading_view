'use client';

import { useMarketStore } from '@/store/marketStore';
import { useEffect, useState } from 'react';

export const PriceTicker = () => {
  const currentPrice = useMarketStore((state) => state.currentPrice);
  const symbol = useMarketStore((state) => state.symbol);
  const [prevPrice, setPrevPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (currentPrice !== null && prevPrice !== null) {
      if (currentPrice > prevPrice) {
        setPriceChange('up');
      } else if (currentPrice < prevPrice) {
        setPriceChange('down');
      }

      const timeout = setTimeout(() => {
        setPriceChange(null);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [currentPrice, prevPrice]);

  useEffect(() => {
    if (currentPrice !== null) {
      setPrevPrice(currentPrice);
    }
  }, [currentPrice]);

  const getSymbolLabel = () => {
    return symbol.replace('usdt', '').toUpperCase();
  };

  const getPriceColor = () => {
    if (priceChange === 'up') return 'text-green-400';
    if (priceChange === 'down') return 'text-red-400';
    return 'text-white';
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm rounded-xl p-4 md:p-6 lg:p-8 shadow-xl border border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <div className="text-gray-400 text-sm md:text-base lg:text-lg font-medium">{getSymbolLabel()}/USDT</div>
        {priceChange && (
          <div className={`flex items-center gap-1 text-xs md:text-sm font-semibold ${
            priceChange === 'up' ? 'text-green-400' : 'text-red-400'
          }`}>
            {priceChange === 'up' ? '↑' : '↓'}
            {priceChange === 'up' ? 'Rising' : 'Falling'}
          </div>
        )}
      </div>
      <div className={`text-4xl md:text-5xl lg:text-6xl font-bold transition-all duration-300 ${getPriceColor()}`}>
        {currentPrice !== null ? (
          <>
            ${currentPrice.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </>
        ) : (
          <span className="text-gray-600">--</span>
        )}
      </div>
      <div className="mt-2 md:mt-3 text-xs text-gray-500">Updated in real-time</div>
    </div>
  );
};
