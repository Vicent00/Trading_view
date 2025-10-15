// types only used by store; no UI imports here

// Watchlist with unique ID
export interface Watchlist {
  id: string;
  title: string;
  icon: string;
  symbols: string[]; // Array of symbol codes (BTC, ETH, etc.)
  isDefault: boolean; // Can't be deleted if true
  createdAt: number;
}

// Available token with metadata
export interface AvailableToken {
  symbol: string;
  name: string;
  icon: string;
  tradingPair: string; // e.g., "btcusdt"
}

// Watchlist store state
export interface WatchlistState {
  watchlists: Watchlist[];
  availableTokens: AvailableToken[];

  // Actions
  addWatchlist: (title: string, icon: string) => void;
  removeWatchlist: (id: string) => void;
  updateWatchlist: (id: string, updates: Partial<Omit<Watchlist, 'id' | 'createdAt'>>) => void;
  addTokenToWatchlist: (watchlistId: string, symbol: string) => void;
  removeTokenFromWatchlist: (watchlistId: string, symbol: string) => void;
  toggleFavorite: (symbol: string) => void;
  initializeWatchlists: () => void;
  loadFromLocalStorage: () => void;
  saveToLocalStorage: () => void;
}
