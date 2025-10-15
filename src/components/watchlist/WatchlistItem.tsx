'use client';

import { useRouter } from 'next/navigation';
import { useMarketStore } from '@/store/marketStore';
import { useWatchlistStore } from '@/store/watchlistStore';
import { mapSymbolToTradingPair, mapTradingPairToSymbol } from '@/utils/symbolMapper';
import { useUIStore } from '@/store/uiStore';
import { CryptoItem } from './types';

interface WatchlistItemProps extends CryptoItem {
  watchlistId: string;
  canRemove?: boolean;
}

export function WatchlistItem({
  symbol,
  name,
  price,
  change24h,
  icon,
  watchlistId,
  canRemove = true
}: WatchlistItemProps) {
  const router = useRouter();
  const currentSymbol = useMarketStore((state) => state.symbol);
  const setSymbol = useMarketStore((state) => state.setSymbol);
  const closeMobileSidebar = useUIStore((state) => state.closeMobileSidebar);

  const watchlists = useWatchlistStore((state) => state.watchlists);
  const toggleFavorite = useWatchlistStore((state) => state.toggleFavorite);
  const removeTokenFromWatchlist = useWatchlistStore((state) => state.removeTokenFromWatchlist);

  const isPositive = change24h >= 0;
  const changeColor = isPositive ? 'text-[#10b981]' : 'text-[#ef4444]';
  const changeIcon = isPositive ? '↗' : '↘';

  // Check if this item is currently active
  const isActive = mapTradingPairToSymbol(currentSymbol) === symbol;

  // Check if this token is in favorites
  const favoritesWatchlist = watchlists.find((w) => w.id === 'favorites');
  const isFavorite = favoritesWatchlist?.symbols.includes(symbol) ?? false;

  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on action buttons
    if ((e.target as HTMLElement).closest('.action-button')) {
      return;
    }

    const tradingPair = mapSymbolToTradingPair(symbol);

    if (tradingPair) {
      // Update store with new symbol
      setSymbol(tradingPair);

      // Navigate to analytics page
      closeMobileSidebar();
      router.push('/analytics');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;

    const tradingPair = mapSymbolToTradingPair(symbol);

    if (tradingPair) {
      setSymbol(tradingPair);
      closeMobileSidebar();
      router.push('/analytics');
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(symbol);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeTokenFromWatchlist(watchlistId, symbol);
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`w-full px-2 sm:px-3 py-2 flex items-center justify-between hover:bg-gray-800/50 transition-all duration-200 rounded-lg group cursor-pointer ${
        isActive ? 'bg-blue-500/10 border-2 border-blue-500' : 'border-2 border-transparent'
      }`}
    >
      {/* Left: Icon + Symbol */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1">
        <span className="text-base sm:text-lg flex-shrink-0">{icon}</span>
        <div className="flex flex-col items-start min-w-0">
          <span className="text-[#e0e0e0] text-xs sm:text-sm font-semibold truncate">
            {symbol}
          </span>
          <span className="text-gray-500 text-[10px] sm:text-xs truncate hidden sm:block">
            {name}
          </span>
        </div>
      </div>

      {/* Right: Price + Change + Actions */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <div className="flex flex-col items-end">
          <span className="text-[#e0e0e0] text-xs sm:text-sm font-mono font-medium">
            ${price.toLocaleString('en-US', { minimumFractionDigits: price < 1 ? 4 : 2, maximumFractionDigits: price < 1 ? 4 : 2 })}
          </span>
          <span className={`text-[10px] sm:text-xs font-mono font-medium ${changeColor} flex items-center`}>
            <span className="mr-0.5">{changeIcon}</span>
            {Math.abs(change24h).toFixed(2)}%
          </span>
        </div>

        {/* Action Buttons - Show on hover for desktop, always visible on mobile */}
        <div className="flex items-center gap-0.5 sm:gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className="action-button p-1 sm:p-1.5 rounded hover:bg-gray-700/50 transition-colors"
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors ${
                isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'
              }`}
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>

          {/* Remove Button */}
          {canRemove && watchlistId !== 'favorites' && (
            <button
              onClick={handleRemove}
              className="action-button p-1 sm:p-1.5 rounded hover:bg-red-500/20 transition-colors"
              title="Remove from watchlist"
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 hover:text-red-400 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
