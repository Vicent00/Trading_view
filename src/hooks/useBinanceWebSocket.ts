import { useEffect, useRef } from 'react';
import { useMarketStore } from '@/store/marketStore';
import type {
  BinanceStreamMessage,
  BinanceTradeMessage,
  BinanceKlineMessage,
  Trade,
  Candle,
} from '@/types/market';

const BASE_URL = 'wss://stream.binance.com:9443/stream?streams=';
const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

export const useBinanceWebSocket = () => {
  const symbol = useMarketStore((state) => state.symbol);
  const setCurrentPrice = useMarketStore((state) => state.setCurrentPrice);
  const addTrade = useMarketStore((state) => state.addTrade);
  const updateCandle = useMarketStore((state) => state.updateCandle);
  const setCandles = useMarketStore((state) => state.setCandles);
  const setConnectionState = useMarketStore((state) => state.setConnectionState);
  const setIsLoading = useMarketStore((state) => state.setIsLoading);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY);
  const shouldConnectRef = useRef(true);
  const currentSymbolRef = useRef(symbol);
  const isCleaningUpRef = useRef(false);

  useEffect(() => {
    // Update refs FIRST before any async operations
    shouldConnectRef.current = true;
    currentSymbolRef.current = symbol;
    isCleaningUpRef.current = false;

    // Load historical data before connecting WebSocket
    const loadHistorical = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=1m&limit=500`
        );
        if (!res.ok) {
          console.error('Failed to load historical data');
          setIsLoading(false);
          return;
        }
        const data = await res.json();
        const candles: Candle[] = (data as any[]).map((d) => ({
          time: Math.floor(d[0] / 1000),
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
          volume: parseFloat(d[5]),
        }));

        // Only update if we haven't switched symbols during the fetch
        if (currentSymbolRef.current === symbol) {
            setCandles(candles, symbol);
          if (candles.length) setCurrentPrice(candles[candles.length - 1].close, symbol);
          setIsLoading(false);
        }
      } catch (e) {
        console.error('Error loading historical klines:', e);
        if (currentSymbolRef.current === symbol) {
          setIsLoading(false);
        }
      }
    };

    const connect = () => {
      if (!shouldConnectRef.current) return;

      try {
        setConnectionState('connecting');

        const streams = `${symbol}@trade/${symbol}@kline_1m`;
        const url = `${BASE_URL}${streams}`;

        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connected');
          setConnectionState('connected');
          reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
        };

        ws.onmessage = (event) => {
          try {
            // Ignore all messages if we're cleaning up
            if (isCleaningUpRef.current) {
              return;
            }

            const message: BinanceStreamMessage = JSON.parse(event.data);

            // Extract symbol from stream name (e.g., "btcusdt@trade" -> "btcusdt")
            const messageSymbol = message.stream.split('@')[0];

            // Ignore messages from previous symbol
            if (messageSymbol !== currentSymbolRef.current) {
              console.log(`Ignoring message from old symbol: ${messageSymbol}`);
              return;
            }

            if (message.stream.includes('@trade')) {
              const tradeData = message.data as BinanceTradeMessage;
              const price = parseFloat(tradeData.p);

              setCurrentPrice(price, symbol);

              const trade: Trade = {
                id: tradeData.t,
                price,
                quantity: parseFloat(tradeData.q),
                time: tradeData.T,
                isBuyerMaker: tradeData.m,
              };

              addTrade(trade, symbol);
            } else if (message.stream.includes('@kline')) {
              const klineData = message.data as BinanceKlineMessage;
              const k = klineData.k;

              const candle: Candle = {
                time: Math.floor(k.t / 1000), // Convert to seconds for lightweight-charts
                open: parseFloat(k.o),
                high: parseFloat(k.h),
                low: parseFloat(k.l),
                close: parseFloat(k.c),
                volume: parseFloat(k.v),
              };

              updateCandle(candle, symbol);
              setCurrentPrice(candle.close, symbol);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionState('error');
        };

        ws.onclose = () => {
          console.log('WebSocket closed');
          setConnectionState('disconnected');
          wsRef.current = null;

          // Attempt reconnection with exponential backoff
          if (shouldConnectRef.current) {
            reconnectTimeoutRef.current = setTimeout(() => {
              // Double-check if we should still reconnect
              if (!shouldConnectRef.current) {
                console.log('Reconnection cancelled');
                return;
              }
              console.log(`Reconnecting in ${reconnectDelayRef.current}ms...`);
              connect();
              reconnectDelayRef.current = Math.min(
                reconnectDelayRef.current * 2,
                MAX_RECONNECT_DELAY
              );
            }, reconnectDelayRef.current);
          }
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        setConnectionState('error');
      }
    };

    // Load historical data first, then connect WebSocket
    loadHistorical().then(() => {
      // Only connect if we haven't switched symbols during the fetch
      if (currentSymbolRef.current === symbol) {
        connect();
      }
    });

    // Cleanup function
    return () => {
      console.log(`Cleaning up WebSocket for symbol: ${symbol}`);

      // IMPORTANT: Set these flags FIRST to prevent any operations
      isCleaningUpRef.current = true;
      shouldConnectRef.current = false;

      // Cancel any pending reconnection timeouts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Close the WebSocket connection
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      // Reset reconnect delay for next connection
      reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
    };
  }, [symbol, setCurrentPrice, addTrade, updateCandle, setConnectionState, setCandles, setIsLoading]);
};

