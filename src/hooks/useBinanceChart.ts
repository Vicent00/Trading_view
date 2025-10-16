import { useEffect, useRef, useState, useCallback } from 'react';
import type { CryptoSymbol, Candle, BinanceKlineRaw, BinanceStreamMessage, BinanceKlineMessage, ConnectionState } from '@/types/market';
import type { Timeframe } from '@/store/analyticsStore';

const BASE_URL = 'wss://stream.binance.com:9443/stream?streams=';
const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

// Mapeo de timeframes a intervalos de Binance
const TIMEFRAME_TO_INTERVAL: Record<Timeframe, string> = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '1h': '1h',
};

interface UseBinanceChartReturn {
  candles: Candle[];
  currentPrice: number | null;
  priceChange: number | null;
  priceChangePercent: number | null;
  connectionState: ConnectionState;
  isLoading: boolean;
}

/**
 * Hook para manejar WebSocket y datos de un chart individual
 * Cada instancia de este hook gestiona su propia conexión WebSocket
 */
export const useBinanceChart = (
  symbol: CryptoSymbol,
  timeframe: Timeframe
): UseBinanceChartReturn => {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number | null>(null);
  const [priceChangePercent, setPriceChangePercent] = useState<number | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [isLoading, setIsLoading] = useState(true);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY);
  const shouldConnectRef = useRef(true);
  const isCleaningUpRef = useRef(false);

  // Calcular cambio de precio cuando se actualizan las velas
  const calculatePriceChange = useCallback((candleData: Candle[]) => {
    if (candleData.length < 2) return;

    const latestCandle = candleData[candleData.length - 1];
    const firstCandle = candleData[0];

    const change = latestCandle.close - firstCandle.open;
    const changePercent = ((change / firstCandle.open) * 100);

    setPriceChange(change);
    setPriceChangePercent(changePercent);
  }, []);

  // Actualizar vela existente o agregar nueva
  const updateCandleData = useCallback((newCandle: Candle) => {
    setCandles((prevCandles) => {
      const existingIndex = prevCandles.findIndex((c) => c.time === newCandle.time);

      let updatedCandles: Candle[];
      if (existingIndex !== -1) {
        // Actualizar vela existente
        updatedCandles = [...prevCandles];
        updatedCandles[existingIndex] = newCandle;
      } else {
        // Agregar nueva vela y ordenar
        updatedCandles = [...prevCandles, newCandle].sort((a, b) => a.time - b.time);
        // Limitar a 500 velas máximo
        if (updatedCandles.length > 500) {
          updatedCandles = updatedCandles.slice(-500);
        }
      }

      calculatePriceChange(updatedCandles);
      return updatedCandles;
    });

    setCurrentPrice(newCandle.close);
  }, [calculatePriceChange]);

  useEffect(() => {
    shouldConnectRef.current = true;
    isCleaningUpRef.current = false;

    const interval = TIMEFRAME_TO_INTERVAL[timeframe];

    // Cargar datos históricos
    const loadHistorical = async () => {
      setIsLoading(true);
      try {
        const limit = timeframe === '1m' ? 500 : timeframe === '5m' ? 288 : timeframe === '15m' ? 96 : 168;
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${limit}`
        );

        if (!res.ok) {
          console.error(`[Chart ${symbol}] Failed to load historical data`);
          setIsLoading(false);
          return;
        }

        const data = await res.json();
        const historicalCandles: Candle[] = (data as BinanceKlineRaw[]).map((d) => ({
          time: Math.floor(d[0] / 1000),
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
          volume: parseFloat(d[5]),
        }));

        if (shouldConnectRef.current && !isCleaningUpRef.current) {
          setCandles(historicalCandles);
          if (historicalCandles.length > 0) {
            const latest = historicalCandles[historicalCandles.length - 1];
            setCurrentPrice(latest.close);
            calculatePriceChange(historicalCandles);
          }
          setIsLoading(false);
        }
      } catch (e) {
        console.error(`[Chart ${symbol}] Error loading historical klines:`, e);
        if (shouldConnectRef.current) {
          setIsLoading(false);
        }
      }
    };

    const connect = () => {
      if (!shouldConnectRef.current) return;

      try {
        setConnectionState('connecting');

        const stream = `${symbol}@kline_${interval}`;
        const url = `${BASE_URL}${stream}`;

        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log(`[Chart ${symbol}] WebSocket connected (${timeframe})`);
          setConnectionState('connected');
          reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
        };

        ws.onmessage = (event) => {
          if (isCleaningUpRef.current) return;

          try {
            const message: BinanceStreamMessage = JSON.parse(event.data);

            if (message.stream.includes('@kline')) {
              const klineData = message.data as BinanceKlineMessage;
              const k = klineData.k;

              const candle: Candle = {
                time: Math.floor(k.t / 1000),
                open: parseFloat(k.o),
                high: parseFloat(k.h),
                low: parseFloat(k.l),
                close: parseFloat(k.c),
                volume: parseFloat(k.v),
              };

              updateCandleData(candle);
            }
          } catch (error) {
            console.error(`[Chart ${symbol}] Error parsing WebSocket message:`, error);
          }
        };

        ws.onerror = (error) => {
          console.error(`[Chart ${symbol}] WebSocket error:`, error);
          setConnectionState('error');
        };

        ws.onclose = () => {
          console.log(`[Chart ${symbol}] WebSocket closed`);
          setConnectionState('disconnected');
          wsRef.current = null;

          if (shouldConnectRef.current) {
            reconnectTimeoutRef.current = setTimeout(() => {
              if (!shouldConnectRef.current) return;
              console.log(`[Chart ${symbol}] Reconnecting in ${reconnectDelayRef.current}ms...`);
              connect();
              reconnectDelayRef.current = Math.min(
                reconnectDelayRef.current * 2,
                MAX_RECONNECT_DELAY
              );
            }, reconnectDelayRef.current);
          }
        };
      } catch (error) {
        console.error(`[Chart ${symbol}] Error creating WebSocket:`, error);
        setConnectionState('error');
      }
    };

    // Cargar histórico y conectar WebSocket
    loadHistorical().then(() => {
      if (shouldConnectRef.current) {
        connect();
      }
    });

    // Cleanup
    return () => {
      console.log(`[Chart ${symbol}] Cleaning up`);
      isCleaningUpRef.current = true;
      shouldConnectRef.current = false;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
    };
  }, [symbol, timeframe, updateCandleData, calculatePriceChange]);

  return {
    candles,
    currentPrice,
    priceChange,
    priceChangePercent,
    connectionState,
    isLoading,
  };
};
