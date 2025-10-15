import { create } from 'zustand';
import type { WatchlistState, Watchlist, AvailableToken } from '@/types/watchlist';

const STORAGE_KEY = 'crypto-tracker-watchlists';

// All available tokens with metadata
const AVAILABLE_TOKENS: AvailableToken[] = [
  { symbol: 'BTC', name: 'Bitcoin', icon: '', tradingPair: 'btcusdt' },
  { symbol: 'ETH', name: 'Ethereum', icon: '', tradingPair: 'ethusdt' },
  { symbol: 'SOL', name: 'Solana', icon: '', tradingPair: 'solusdt' },
  { symbol: 'BNB', name: 'Binance Coin', icon: '', tradingPair: 'bnbusdt' },
  { symbol: 'XRP', name: 'Ripple', icon: '', tradingPair: 'xrpusdt' },
  { symbol: 'ADA', name: 'Cardano', icon: '', tradingPair: 'adausdt' },
  { symbol: 'DOGE', name: 'Dogecoin', icon: '', tradingPair: 'dogeusdt' },
  { symbol: 'MATIC', name: 'Polygon', icon: '', tradingPair: 'maticusdt' },
  { symbol: 'DOT', name: 'Polkadot', icon: '', tradingPair: 'dotusdt' },
  { symbol: 'AVAX', name: 'Avalanche', icon: '', tradingPair: 'avaxusdt' },
  { symbol: 'LINK', name: 'Chainlink', icon: '', tradingPair: 'linkusdt' },
  { symbol: 'UNI', name: 'Uniswap', icon: '', tradingPair: 'uniusdt' },
  { symbol: 'LTC', name: 'Litecoin', icon: '', tradingPair: 'ltcusdt' },
  { symbol: 'TRX', name: 'Tron', icon: '', tradingPair: 'trxusdt' },
  { symbol: 'ATOM', name: 'Cosmos', icon: '', tradingPair: 'atomusdt' },
];

// Default watchlists
const DEFAULT_WATCHLISTS: Watchlist[] = [
  {
    id: 'favorites',
    title: 'Favorites',
    icon: '⭐',
    symbols: ['BTC', 'ETH', 'SOL', 'BNB', 'XRP'],
    isDefault: true,
    createdAt: Date.now(),
  },
  {
    id: 'defi',
    title: 'DeFi',
    icon: '🚀',
    symbols: ['AVAX', 'MATIC', 'LINK', 'UNI'],
    isDefault: false,
    createdAt: Date.now(),
  },
];

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  watchlists: DEFAULT_WATCHLISTS,
  availableTokens: AVAILABLE_TOKENS,

  addWatchlist: (title: string, icon: string) => {
    const newWatchlist: Watchlist = {
      id: `watchlist-${Date.now()}`,
      title,
      icon,
      symbols: [],
      isDefault: false,
      createdAt: Date.now(),
    };

    set((state) => ({
      watchlists: [...state.watchlists, newWatchlist],
    }));

    get().saveToLocalStorage();
  },

  removeWatchlist: (id: string) => {
    set((state) => ({
      watchlists: state.watchlists.filter((w) => w.id !== id && !w.isDefault),
    }));

    get().saveToLocalStorage();
  },

  updateWatchlist: (id: string, updates: Partial<Omit<Watchlist, 'id' | 'createdAt'>>) => {
    set((state) => ({
      watchlists: state.watchlists.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
    }));

    get().saveToLocalStorage();
  },

  addTokenToWatchlist: (watchlistId: string, symbol: string) => {
    set((state) => ({
      watchlists: state.watchlists.map((w) =>
        w.id === watchlistId && !w.symbols.includes(symbol)
          ? { ...w, symbols: [...w.symbols, symbol] }
          : w
      ),
    }));

    get().saveToLocalStorage();
  },

  removeTokenFromWatchlist: (watchlistId: string, symbol: string) => {
    set((state) => ({
      watchlists: state.watchlists.map((w) =>
        w.id === watchlistId
          ? { ...w, symbols: w.symbols.filter((s) => s !== symbol) }
          : w
      ),
    }));

    get().saveToLocalStorage();
  },

  toggleFavorite: (symbol: string) => {
    const favoritesWatchlist = get().watchlists.find((w) => w.id === 'favorites');

    if (!favoritesWatchlist) return;

    const isFavorite = favoritesWatchlist.symbols.includes(symbol);

    if (isFavorite) {
      get().removeTokenFromWatchlist('favorites', symbol);
    } else {
      get().addTokenToWatchlist('favorites', symbol);
    }
  },

  initializeWatchlists: () => {
    get().loadFromLocalStorage();
  },

  loadFromLocalStorage: () => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const watchlists = JSON.parse(stored) as Watchlist[];
        set({ watchlists });
        console.log('[WatchlistStore] Loaded watchlists from localStorage');
      }
    } catch (error) {
      console.error('[WatchlistStore] Error loading from localStorage:', error);
    }
  },

  saveToLocalStorage: () => {
    if (typeof window === 'undefined') return;

    try {
      const { watchlists } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlists));
      console.log('[WatchlistStore] Saved watchlists to localStorage');
    } catch (error) {
      console.error('[WatchlistStore] Error saving to localStorage:', error);
    }
  },
}));
