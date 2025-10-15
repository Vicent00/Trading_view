import { create } from 'zustand';
import type { TickerState, TickerData } from '@/types/ticker';

export const useTickerStore = create<TickerState>((set) => ({
  tickers: {},
  isLoading: false,
  error: null,

  setTickers: (tickers: TickerData[]) =>
    set(() => {
      const tickersMap: Record<string, TickerData> = {};
      tickers.forEach((ticker) => {
        tickersMap[ticker.symbol] = ticker;
      });
      return { tickers: tickersMap, error: null };
    }),

  updateTicker: (ticker: TickerData) =>
    set((state) => ({
      tickers: {
        ...state.tickers,
        [ticker.symbol]: ticker,
      },
    })),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error }),
}));
