// Binance WebSocket trade message structure
export interface BinanceTradeMessage {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  t: number; // Trade ID
  p: string; // Price
  q: string; // Quantity
  b: number; // Buyer order ID
  a: number; // Seller order ID
  T: number; // Trade time
  m: boolean; // Is buyer maker
  M: boolean; // Ignore
}

// Binance WebSocket kline (candlestick) message structure
export interface BinanceKlineMessage {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  k: {
    t: number; // Kline start time
    T: number; // Kline close time
    s: string; // Symbol
    i: string; // Interval
    f: number; // First trade ID
    L: number; // Last trade ID
    o: string; // Open price
    c: string; // Close price
    h: string; // High price
    l: string; // Low price
    v: string; // Base asset volume
    n: number; // Number of trades
    x: boolean; // Is kline closed
    q: string; // Quote asset volume
    V: string; // Taker buy base asset volume
    Q: string; // Taker buy quote asset volume
    B: string; // Ignore
  };
}

// Binance WebSocket stream wrapper
export interface BinanceStreamMessage {
  stream: string;
  data: BinanceTradeMessage | BinanceKlineMessage;
}

// Internal trade representation (parsed)
export interface Trade {
  id: number;
  price: number;
  quantity: number;
  time: number;
  isBuyerMaker: boolean;
}

// Binance API kline response (raw array format)
export type BinanceKlineRaw = [
  number,  // 0: Open time
  string,  // 1: Open
  string,  // 2: High
  string,  // 3: Low
  string,  // 4: Close
  string,  // 5: Volume
  number,  // 6: Close time
  string,  // 7: Quote asset volume
  number,  // 8: Number of trades
  string,  // 9: Taker buy base asset volume
  string,  // 10: Taker buy quote asset volume
  string   // 11: Ignore
];

// Internal candlestick representation (parsed)
export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Supported cryptocurrency symbols
export type CryptoSymbol =
  | 'btcusdt'   // Bitcoin
  | 'ethusdt'   // Ethereum
  | 'solusdt'   // Solana
  | 'bnbusdt'   // Binance Coin
  | 'xrpusdt'   // Ripple
  | 'adausdt'   // Cardano
  | 'dogeusdt'  // Dogecoin
  | 'maticusdt' // Polygon
  | 'dotusdt'   // Polkadot
  | 'avaxusdt'  // Avalanche
  | 'linkusdt'  // Chainlink
  | 'uniusdt'   // Uniswap
  | 'ltcusdt'   // Litecoin
  | 'trxusdt'   // Tron
  | 'atomusdt'; // Cosmos

// WebSocket connection states
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

// Market store state interface
export interface MarketState {
  symbol: CryptoSymbol;
  currentPrice: number | null;
  trades: Trade[];
  candles: Candle[];
  connectionState: ConnectionState;
  isLoading: boolean;

  // Actions
  setSymbol: (symbol: CryptoSymbol) => void;
  setCurrentPrice: (price: number, symbol: CryptoSymbol) => void;
  addTrade: (trade: Trade, symbol: CryptoSymbol) => void;
  updateCandle: (candle: Candle, symbol: CryptoSymbol) => void;
  setCandles: (candles: Candle[], symbol: CryptoSymbol) => void;
  setConnectionState: (state: ConnectionState) => void;
  setIsLoading: (isLoading: boolean) => void;
  reset: () => void;
}
