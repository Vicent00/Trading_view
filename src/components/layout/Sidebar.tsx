'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WatchlistGroup } from '@/components/watchlist/WatchlistGroup';
import { WatchlistGroupData } from '@/components/watchlist/types';
import { AddWatchlistModal } from '@/components/watchlist/AddWatchlistModal';
import { AddTokenModal } from '@/components/watchlist/AddTokenModal';
import { useBinanceTicker } from '@/hooks/useBinanceTicker';
import { useTickerStore } from '@/store/tickerStore';
import { useWatchlistStore } from '@/store/watchlistStore';
import { useUIStore } from '@/store/uiStore';

const navLinks = [
  { href: '/analytics', label: 'Analytics' },
  { href: '/market-overview', label: 'Market Overview' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAddWatchlistModal, setShowAddWatchlistModal] = useState(false);
  const [addTokenModalState, setAddTokenModalState] = useState<{
    isOpen: boolean;
    watchlistId: string;
    currentSymbols: string[];
  }>({
    isOpen: false,
    watchlistId: '',
    currentSymbols: [],
  });

  const isMobileSidebarOpen = useUIStore((state) => state.isMobileSidebarOpen);
  const closeMobileSidebar = useUIStore((state) => state.closeMobileSidebar);

  // Fetch real-time ticker data
  useBinanceTicker();

  // Get stores data
  const tickers = useTickerStore((state) => state.tickers);
  const isLoading = useTickerStore((state) => state.isLoading);

  const watchlists = useWatchlistStore((state) => state.watchlists);
  const availableTokens = useWatchlistStore((state) => state.availableTokens);
  const removeWatchlist = useWatchlistStore((state) => state.removeWatchlist);
  const initializeWatchlists = useWatchlistStore((state) => state.initializeWatchlists);

  // Initialize watchlists from localStorage on mount
  useEffect(() => {
    initializeWatchlists();
  }, [initializeWatchlists]);

  // Build watchlist groups with real data
  const watchlistGroups: (WatchlistGroupData & { watchlistId: string; isDefault: boolean })[] = useMemo(() => {
    return watchlists.map((watchlist) => {
      const items = watchlist.symbols
        .map((symbol) => {
          const tokenConfig = availableTokens.find((t) => t.symbol === symbol);
          if (!tokenConfig) return null;

          const ticker = tickers[symbol];

          return {
            symbol,
            name: tokenConfig.name,
            icon: tokenConfig.icon,
            price: ticker?.price ?? 0,
            change24h: ticker?.change24h ?? 0,
          };
        })
        .filter((item) => item !== null);

      return {
        watchlistId: watchlist.id,
        title: watchlist.title,
        icon: watchlist.icon,
        items,
        defaultExpanded: true,
        isDefault: watchlist.isDefault,
      };
    });
  }, [watchlists, tickers, availableTokens]);

  const handleAddToken = (watchlistId: string, currentSymbols: string[]) => {
    setAddTokenModalState({
      isOpen: true,
      watchlistId,
      currentSymbols,
    });
  };

  const handleDeleteWatchlist = (watchlistId: string) => {
    if (confirm('Are you sure you want to delete this watchlist?')) {
      removeWatchlist(watchlistId);
    }
  };

  return (
    <>
      {/* Sidebar - Mobile: Fixed overlay drawer | Desktop: Sticky sidebar */}
      <aside
        className={`
          bg-[#141414] border-r border-[#1e1e1e] transition-all duration-300
          ${
            // Mobile: drawer overlay below navbar
            'fixed top-[60px] left-0 h-[calc(100vh-60px)] lg:sticky lg:top-[60px] lg:h-[calc(100vh-60px)] z-40'
          }
          ${
            // Mobile: slide in/out based on state
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }
          ${
            // Width handling - mobile full width, desktop respects collapse state
            isCollapsed ? 'w-full sm:w-[280px] lg:w-16' : 'w-full sm:w-[280px]'
          }
        `}
      >
        <div className="flex flex-col h-full">
          {/* Top spacing compact, toggle relocated into Watchlists header */}

          {/* Mobile Navigation Links (only visible on mobile) */}
          <div className="lg:hidden border-b border-[#1e1e1e] p-4">
            <h3 className="text-[#e0e0e0] text-xs font-bold uppercase tracking-wider mb-3">
              Navigation
            </h3>
            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileSidebar}
                    className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
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

          {/* Toggle button when collapsed (desktop only) */}
          {isCollapsed && (
            <div className="hidden lg:flex justify-center p-4">
              <button
                onClick={() => setIsCollapsed(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1a1a1a] transition-colors text-gray-400 hover:text-gray-200"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <svg
                  className="w-5 h-5 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Watchlists Content */}
          {(!isCollapsed || isMobileSidebarOpen) && (
            <div className="flex-1 overflow-y-auto">
              {/* Header */}
              <div className="p-4 border-b border-[#1e1e1e]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[#e0e0e0] text-xs font-bold uppercase tracking-wider">
                    Watchlists
                  </h2>
                  <div className="flex items-center gap-2">
                    {/* Add watchlist button */}
                    <button
                      onClick={() => setShowAddWatchlistModal(true)}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#1a1a1a] transition-colors text-gray-400 hover:text-gray-200"
                      title="Create new watchlist"
                    >
                      <svg
                        className="w-4 h-4"
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
                    </button>
                    {/* Close button (mobile only) */}
                    <button
                      onClick={closeMobileSidebar}
                      className="lg:hidden w-6 h-6 flex items-center justify-center rounded hover:bg-[#1a1a1a] transition-colors text-gray-400 hover:text-gray-200"
                      aria-label="Close sidebar"
                      title="Close sidebar"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    {/* Toggle collapse (desktop only) */}
                    <button
                      onClick={() => setIsCollapsed(!isCollapsed)}
                      className="hidden lg:flex w-6 h-6 items-center justify-center rounded hover:bg-[#1a1a1a] transition-colors text-gray-400 hover:text-gray-200"
                      aria-label="Toggle sidebar"
                      title="Collapse/Expand sidebar"
                    >
                      <svg
                        className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Watchlist Groups - Scrollable */}
              <div className="p-3 max-h-[calc(100vh-340px)] lg:max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                {isLoading && Object.keys(tickers).length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-gray-500">
                    <svg
                      className="animate-spin h-6 w-6 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Loading prices...
                  </div>
                ) : watchlistGroups.length === 0 ? (
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
                    <p className="text-sm mb-2">No watchlists</p>
                    <button
                      onClick={() => setShowAddWatchlistModal(true)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Create the first one
                    </button>
                  </div>
                ) : (
                  watchlistGroups.map((watchlist) => (
                    <WatchlistGroup
                      key={watchlist.watchlistId}
                      watchlistId={watchlist.watchlistId}
                      title={watchlist.title}
                      icon={watchlist.icon}
                      items={watchlist.items}
                      defaultExpanded={watchlist.defaultExpanded}
                      isDefault={watchlist.isDefault}
                      onAddToken={() => handleAddToken(watchlist.watchlistId, watchlist.items.map(i => i.symbol))}
                      onDelete={!watchlist.isDefault ? () => handleDeleteWatchlist(watchlist.watchlistId) : undefined}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Modals */}
      <AddWatchlistModal
        isOpen={showAddWatchlistModal}
        onClose={() => setShowAddWatchlistModal(false)}
      />

      <AddTokenModal
        isOpen={addTokenModalState.isOpen}
        onClose={() => setAddTokenModalState({ isOpen: false, watchlistId: '', currentSymbols: [] })}
        watchlistId={addTokenModalState.watchlistId}
        currentSymbols={addTokenModalState.currentSymbols}
      />

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f0f0f;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2a2a2a;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3a3a3a;
        }
      `}</style>
    </>
  );
}
