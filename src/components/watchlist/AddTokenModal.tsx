'use client';

import { useState, useMemo } from 'react';
import { useWatchlistStore } from '@/store/watchlistStore';
import { useTickerStore } from '@/store/tickerStore';

interface AddTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  watchlistId: string;
  currentSymbols: string[];
}

export function AddTokenModal({ isOpen, onClose, watchlistId, currentSymbols }: AddTokenModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const availableTokens = useWatchlistStore((state) => state.availableTokens);
  const addTokenToWatchlist = useWatchlistStore((state) => state.addTokenToWatchlist);
  const tickers = useTickerStore((state) => state.tickers);

  // useMemo must be called before any early return
  const filteredTokens = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return availableTokens
      .filter(
        (token) =>
          !currentSymbols.includes(token.symbol) &&
          (token.symbol.toLowerCase().includes(query) ||
            token.name.toLowerCase().includes(query))
      )
      .sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [searchQuery, availableTokens, currentSymbols]);

  if (!isOpen) return null;

  const handleAddToken = (symbol: string) => {
    addTokenToWatchlist(watchlistId, symbol);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold text-[#e0e0e0]">Add Token</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="px-6 py-4 border-b border-[#2a2a2a] flex-shrink-0">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search token..."
              className="w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-[#e0e0e0] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* Token List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredTokens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <svg
                className="w-16 h-16 mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-sm">No tokens found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredTokens.map((token) => {
                const ticker = tickers[token.symbol];
                return (
                  <button
                    key={token.symbol}
                    onClick={() => handleAddToken(token.symbol)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors duration-200 rounded-lg group"
                  >
                    <div className="flex items-center space-x-3">
                      {/* Icon removed intentionally */}
                      <div className="flex flex-col items-start">
                        <span className="text-[#e0e0e0] text-sm font-semibold">
                          {token.symbol}
                        </span>
                        <span className="text-gray-500 text-xs">{token.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {ticker && (
                        <div className="flex flex-col items-end">
                          <span className="text-[#e0e0e0] text-sm font-mono">
                            ${ticker.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span
                            className={`text-xs font-mono ${
                              ticker.change24h >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'
                            }`}
                          >
                            {ticker.change24h >= 0 ? '+' : ''}
                            {ticker.change24h.toFixed(2)}%
                          </span>
                        </div>
                      )}
                      <svg
                        className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#2a2a2a] flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#2a2a2a] hover:bg-[#353535] text-gray-300 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
