import { useCallback, useEffect, useRef } from 'react';
import { useTickerStore } from '@/store/tickerStore';
import { useWatchlistStore } from '@/store/watchlistStore';
import { mapTradingPairToSymbol } from '@/utils/symbolMapper';
import type { Binance24hrTicker, TickerData } from '@/types/ticker';
import type { CryptoSymbol } from '@/types/market';

const BINANCE_API_BASE = 'https://api.binance.com/api/v3';
const UPDATE_INTERVAL = 10000; // 10 seconds

/**
 * Hook to fetch and maintain real-time ticker data for watchlist cryptocurrencies
 * Uses Binance public API (no authentication required)
 * Updates every 10 seconds
 * Automatically tracks all tokens from watchlistStore.availableTokens
 */
export const useBinanceTicker = () => {
  const setTickers = useTickerStore((state) => state.setTickers);
  const setLoading = useTickerStore((state) => state.setLoading);
  const setError = useTickerStore((state) => state.setError);
  const availableTokens = useWatchlistStore((state) => state.availableTokens);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const fetchTickerData = useCallback(async () => {
    try {
      // Build symbols array from available tokens (e.g., ['BTCUSDT', 'ETHUSDT', ...])
      const symbolsToTrack = availableTokens.map((token) => token.tradingPair.toUpperCase());

      if (symbolsToTrack.length === 0) {
        console.warn('[useBinanceTicker] No symbols to track');
        return;
      }

      // Build symbols query parameter
      const symbolsParam = JSON.stringify(symbolsToTrack);
      const url = `${BINANCE_API_BASE}/ticker/24hr?symbols=${encodeURIComponent(symbolsParam)}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status}`);
      }

      const data: Binance24hrTicker[] = await response.json();

      // Only update if component is still mounted
      if (!isMountedRef.current) return;

      // Transform API response to internal format
      const tickers: TickerData[] = data.map((ticker) => {
        // Convert BTCUSDT -> btcusdt -> BTC
        const shortSymbol = mapTradingPairToSymbol(ticker.symbol.toLowerCase() as CryptoSymbol);

        return {
          symbol: shortSymbol,
          price: parseFloat(ticker.lastPrice),
          change24h: parseFloat(ticker.priceChangePercent),
          lastUpdated: Date.now(),
        };
      });

      setTickers(tickers);
      setLoading(false);
      setError(null);

      console.log(`[useBinanceTicker] Updated ${tickers.length} tickers`);
    } catch (error) {
      console.error('[useBinanceTicker] Error fetching ticker data:', error);

      if (isMountedRef.current) {
        setError(error instanceof Error ? error.message : 'Failed to fetch ticker data');
        setLoading(false);
      }
    }
  }, [availableTokens, setTickers, setLoading, setError]);

  useEffect(() => {
    isMountedRef.current = true;
    setLoading(true);

    // Initial fetch
    fetchTickerData();

    // Setup periodic updates
    intervalRef.current = setInterval(() => {
      fetchTickerData();
    }, UPDATE_INTERVAL);

    // Cleanup
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchTickerData, setLoading]);
};
