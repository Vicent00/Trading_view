import { useEffect, useState } from 'react';
import type { CryptoSymbol, Candle, BinanceKlineRaw, BinanceStreamMessage, BinanceKlineMessage, ConnectionState } from '@/types/market';
import type { Timeframe } from '@/store/analyticsStore';

const BASE_URL = 'wss://stream.binance.com:9443/stream?streams=';
const RECONNECT_DELAY = 3000; // Delay fijo y simple para reconexión

// Mapeo de timeframes a intervalos de Binance
const TIMEFRAME_TO_INTERVAL: Record<Timeframe, string> = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  '1h': '1h',
  '4h': '4h',
  '1d': '1d',
  '1w': '1w',
  '1M': '1M',
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
 * Hook simplificado para manejar WebSocket y datos de un chart individual
 * Versión refactorizada para eliminar race conditions y simplificar el código
 *
 * @param chartId - ID único del chart
 * @param symbol - Símbolo de la criptomoneda
 * @param timeframe - Intervalo de tiempo
 */
export const useBinanceChart = (
  chartId: string,
  symbol: CryptoSymbol,
  timeframe: Timeframe
): UseBinanceChartReturn => {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number | null>(null);
  const [priceChangePercent, setPriceChangePercent] = useState<number | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const instanceId = `${chartId}:${symbol}-${timeframe}`;
    console.log(`[Chart:${instanceId}] 🎬 Iniciando`);

    // Variables locales para este efecto específico
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;
    let connectionTimer: NodeJS.Timeout | null = null;
    let isCancelled = false;

    const interval = TIMEFRAME_TO_INTERVAL[timeframe];

    // Función para calcular cambio de precio
    const calculatePriceChange = (candleData: Candle[]) => {
      if (candleData.length < 2) return;

      const latestCandle = candleData[candleData.length - 1];
      const firstCandle = candleData[0];

      const change = latestCandle.close - firstCandle.open;
      const changePercent = ((change / firstCandle.open) * 100);

      setPriceChange(change);
      setPriceChangePercent(changePercent);
    };

    // Función para actualizar velas
    const updateCandleData = (newCandle: Candle) => {
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
    };

    // Función para cargar datos históricos
    const loadHistorical = async () => {
      if (isCancelled) return;

      setIsLoading(true);
      try {
        // Determinar la cantidad óptima de velas por timeframe
        // Límite máximo de Binance: 1000 velas por request
        const getLimit = (): number => {
          switch (timeframe) {
            case '1m': return 500;   // ~8 horas
            case '5m': return 288;   // ~24 horas (1 día)
            case '15m': return 96;   // ~24 horas (1 día)
            case '30m': return 96;   // ~2 días
            case '1h': return 168;   // ~7 días (1 semana)
            case '4h': return 180;   // ~30 días (1 mes)
            case '1d': return 365;   // ~1 año
            case '1w': return 260;   // ~5 años
            case '1M': return 60;    // ~5 años
            default: return 200;
          }
        };

        const limit = getLimit();
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${limit}`
        );

        if (!res.ok) {
          console.error(`[Chart:${instanceId}] ❌ Error cargando histórico`);
          if (!isCancelled) setIsLoading(false);
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

        if (!isCancelled) {
          setCandles(historicalCandles);
          if (historicalCandles.length > 0) {
            const latest = historicalCandles[historicalCandles.length - 1];
            setCurrentPrice(latest.close);
            calculatePriceChange(historicalCandles);
          }
          setIsLoading(false);
          console.log(`[Chart:${instanceId}] ✅ Histórico cargado (${historicalCandles.length} velas)`);
        }
      } catch (e) {
        console.error(`[Chart:${instanceId}] ❌ Error en fetch:`, e);
        if (!isCancelled) setIsLoading(false);
      }
    };

    // Función para conectar WebSocket
    const connect = () => {
      if (isCancelled) {
        console.log(`[Chart:${instanceId}] ⚠️  Conexión cancelada antes de iniciar`);
        return;
      }

      try {
        setConnectionState('connecting');

        const stream = `${symbol}@kline_${interval}`;
        const url = `${BASE_URL}${stream}`;

        console.log(`[Chart:${instanceId}] 🔌 Conectando a ${stream}`);

        ws = new WebSocket(url);

        ws.onopen = () => {
          if (isCancelled) {
            console.log(`[Chart:${instanceId}] ⚠️  Conectado pero cancelado, cerrando`);
            ws?.close();
            return;
          }
          console.log(`[Chart:${instanceId}] ✅ Conectado`);
          setConnectionState('connected');
        };

        ws.onmessage = (event) => {
          if (isCancelled) return;

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
            console.error(`[Chart:${instanceId}] ❌ Error parseando mensaje:`, error);
          }
        };

        ws.onerror = (error) => {
          console.error(`[Chart:${instanceId}] ❌ WebSocket error:`, error);
          if (!isCancelled) setConnectionState('error');
        };

        ws.onclose = () => {
          console.log(`[Chart:${instanceId}] 🔌 Desconectado`);
          if (!isCancelled) {
            setConnectionState('disconnected');

            // Reconexión simple después de 3 segundos
            console.log(`[Chart:${instanceId}] 🔄 Reconectando en ${RECONNECT_DELAY}ms`);
            reconnectTimer = setTimeout(() => {
              if (!isCancelled) {
                console.log(`[Chart:${instanceId}] 🔄 Intentando reconectar`);
                connect();
              }
            }, RECONNECT_DELAY);
          }
        };
      } catch (error) {
        console.error(`[Chart:${instanceId}] ❌ Error creando WebSocket:`, error);
        if (!isCancelled) setConnectionState('error');
      }
    };

    // Iniciar carga y conexión
    const init = async () => {
      await loadHistorical();

      if (!isCancelled) {
        // Delay mínimo de 100ms antes de conectar
        connectionTimer = setTimeout(() => {
          if (!isCancelled) {
            connect();
          }
        }, 100);
      }
    };

    init();

    // Cleanup function - SE EJECUTA CUANDO EL COMPONENTE SE DESMONTA O LAS DEPENDENCIAS CAMBIAN
    return () => {
      console.log(`[Chart:${instanceId}] 🧹 CLEANUP`);

      // Marcar como cancelado PRIMERO
      isCancelled = true;

      // Cancelar todos los timers
      if (connectionTimer) {
        clearTimeout(connectionTimer);
        connectionTimer = null;
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      // Cerrar WebSocket
      if (ws) {
        ws.onclose = null; // Prevenir que se ejecute el callback de reconexión
        ws.onerror = null;
        ws.onmessage = null;
        ws.onopen = null;
        ws.close();
        ws = null;
      }

      console.log(`[Chart:${instanceId}] ✅ Cleanup completo`);
    };
  }, [chartId, symbol, timeframe]); // Solo las dependencias esenciales

  return {
    candles,
    currentPrice,
    priceChange,
    priceChangePercent,
    connectionState,
    isLoading,
  };
};
