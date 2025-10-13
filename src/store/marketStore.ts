import { create } from 'zustand';
import type { MarketState, CryptoSymbol, Trade, Candle, ConnectionState } from '@/types/market';

const MAX_TRADES = 50;
const MAX_CANDLES = 500;

export const useMarketStore = create<MarketState>((set) => ({
  symbol: 'btcusdt',
  currentPrice: null,
  trades: [],
  candles: [],
  connectionState: 'disconnected',
  isLoading: true,

  setSymbol: (symbol: CryptoSymbol) =>
    set({
      symbol,
      currentPrice: null,
      trades: [],
      candles: [],
      connectionState: 'disconnected',
      isLoading: true,
    }),

  setCurrentPrice: (price: number, symbol: CryptoSymbol) =>
    set((state) => {
      // Only update if this price is for the current symbol
      if (state.symbol !== symbol) {
        console.log(`[Store] Ignoring price update for ${symbol}, current symbol is ${state.symbol}`);
        return state;
      }
      return { currentPrice: price };
    }),

  addTrade: (trade: Trade, symbol: CryptoSymbol) =>
    set((state) => {
      // Only add trade if it's for the current symbol
      if (state.symbol !== symbol) {
        console.log(`[Store] Ignoring trade for ${symbol}, current symbol is ${state.symbol}`);
        return state;
      }

      // Check if trade already exists (by id) to prevent duplicates
      const tradeExists = state.trades.some((t) => t.id === trade.id);
      if (tradeExists) {
        console.log(`[Store] Skipping duplicate trade ID: ${trade.id}`);
        return state;
      }

      const newTrades = [trade, ...state.trades].slice(0, MAX_TRADES);
      return { trades: newTrades };
    }),

  updateCandle: (candle: Candle, symbol: CryptoSymbol) =>
    set((state) => {
      // Only update candle if it's for the current symbol
      if (state.symbol !== symbol) {
        console.log(`[Store] Ignoring candle update for ${symbol}, current symbol is ${state.symbol}`);
        return state;
      }

      const existingIndex = state.candles.findIndex((c) => c.time === candle.time);

      let newCandles: Candle[];
      if (existingIndex !== -1) {
        // Update existing candle
        newCandles = [...state.candles];
        newCandles[existingIndex] = candle;
      } else {
        // Add new candle and sort by time
        newCandles = [...state.candles, candle].sort((a, b) => a.time - b.time);
        // Limit to MAX_CANDLES, keeping the most recent ones
        if (newCandles.length > MAX_CANDLES) {
          newCandles = newCandles.slice(-MAX_CANDLES);
        }
      }

      return { candles: newCandles };
    }),

  setCandles: (candles: Candle[], symbol: CryptoSymbol) =>
    set((state) => {
      // Only set candles if they're for the current symbol
      if (state.symbol !== symbol) {
        console.log(`[Store] Ignoring candles for ${symbol}, current symbol is ${state.symbol}`);
        return state;
      }
      // Ensure candles are sorted and limited to MAX_CANDLES
      const sorted = [...candles].sort((a, b) => a.time - b.time);
      const limited = sorted.length > MAX_CANDLES ? sorted.slice(-MAX_CANDLES) : sorted;
      return { candles: limited };
    }),

  setConnectionState: (connectionState: ConnectionState) =>
    set({ connectionState }),

  setIsLoading: (isLoading: boolean) =>
    set({ isLoading }),

  reset: () =>
    set({
      symbol: 'btcusdt',
      currentPrice: null,
      trades: [],
      candles: [],
      connectionState: 'disconnected',
      isLoading: true,
    }),
}));
