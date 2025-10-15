// Binance 24hr ticker API response structure
export interface Binance24hrTicker {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

// Internal ticker representation (parsed)
export interface TickerData {
  symbol: string; // Short symbol (BTC, ETH, SOL, etc.)
  price: number;
  change24h: number; // Percentage change
  lastUpdated: number; // Timestamp
}

// Ticker store state
export interface TickerState {
  tickers: Record<string, TickerData>; // Map of symbol -> ticker data
  isLoading: boolean;
  error: string | null;

  // Actions
  setTickers: (tickers: TickerData[]) => void;
  updateTicker: (ticker: TickerData) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}
