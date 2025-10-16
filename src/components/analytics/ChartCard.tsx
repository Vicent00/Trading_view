'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, UTCTimestamp, CandlestickData, CandlestickSeries } from 'lightweight-charts';
import { useBinanceChart } from '@/hooks/useBinanceChart';
import { useAnalyticsStore, type Timeframe } from '@/store/analyticsStore';
import type { CryptoSymbol } from '@/types/market';

interface ChartCardProps {
  chartId: string;
  symbol: CryptoSymbol;
  timeframe: Timeframe;
}

// Información de cada crypto para display
const CRYPTO_INFO: Record<CryptoSymbol, { name: string; color: string }> = {
  btcusdt: { name: 'BTC', color: '#F7931A' },
  ethusdt: { name: 'ETH', color: '#627EEA' },
  solusdt: { name: 'SOL', color: '#9945FF' },
  bnbusdt: { name: 'BNB', color: '#F3BA2F' },
  xrpusdt: { name: 'XRP', color: '#23292F' },
  adausdt: { name: 'ADA', color: '#0033AD' },
  dogeusdt: { name: 'DOGE', color: '#C2A633' },
  maticusdt: { name: 'MATIC', color: '#8247E5' },
  dotusdt: { name: 'DOT', color: '#E6007A' },
  avaxusdt: { name: 'AVAX', color: '#E84142' },
  linkusdt: { name: 'LINK', color: '#2A5ADA' },
  uniusdt: { name: 'UNI', color: '#FF007A' },
  ltcusdt: { name: 'LTC', color: '#345D9D' },
  trxusdt: { name: 'TRX', color: '#FF060A' },
  atomusdt: { name: 'ATOM', color: '#2E3148' },
};

const AVAILABLE_SYMBOLS: CryptoSymbol[] = [
  'btcusdt', 'ethusdt', 'solusdt', 'bnbusdt', 'avaxusdt', 'maticusdt',
  'adausdt', 'dogeusdt', 'linkusdt', 'dotusdt', 'xrpusdt', 'uniusdt',
];

export const ChartCard = ({ chartId, symbol, timeframe }: ChartCardProps) => {
  const { candles, currentPrice, priceChangePercent, isLoading } = useBinanceChart(symbol, timeframe);
  const updateChartSymbol = useAnalyticsStore((state) => state.updateChartSymbol);

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const cryptoInfo = CRYPTO_INFO[symbol];

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Crear chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94A3B8',
      },
      grid: {
        vertLines: { color: '#1E293B', style: 1 },
        horzLines: { color: '#1E293B', style: 1 },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
      },
      leftPriceScale: {
        visible: false,
      },
      handleScroll: {
        vertTouchDrag: false,
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, []);

  // Actualizar datos del chart
  useEffect(() => {
    if (!seriesRef.current || candles.length === 0) return;

    try {
      const chartData: CandlestickData<UTCTimestamp>[] = candles.map((candle) => ({
        time: candle.time as UTCTimestamp,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }));

      seriesRef.current.setData(chartData);
    } catch (error) {
      console.error(`[ChartCard ${chartId}] Error updating chart:`, error);
    }
  }, [candles, chartId]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSymbolChange = (newSymbol: CryptoSymbol) => {
    updateChartSymbol(chartId, newSymbol);
    setShowMenu(false);
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return '---';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const formatPercent = (percent: number | null) => {
    if (percent === null) return '0.00';
    return percent.toFixed(2);
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg border border-slate-700/50 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/50">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: cryptoInfo.color }}
          />
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="font-bold text-white text-sm">{cryptoInfo.name}</span>
            <span className="text-xs text-gray-400">/USDT</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Precio y cambio */}
          <div className="flex flex-col items-end">
            <span className="text-white font-semibold text-sm whitespace-nowrap">
              {formatPrice(currentPrice)}
            </span>
            {priceChangePercent !== null && (
              <span
                className={`text-xs font-medium ${
                  priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {priceChangePercent >= 0 ? '↗' : '↘'} {formatPercent(priceChangePercent)}%
              </span>
            )}
          </div>

          {/* Menú dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <circle cx="8" cy="3" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="8" cy="13" r="1.5" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 min-w-[160px] max-h-[300px] overflow-y-auto">
                <div className="py-1">
                  <div className="px-3 py-1.5 text-xs text-gray-400 font-medium">
                    Cambiar símbolo
                  </div>
                  {AVAILABLE_SYMBOLS.map((sym) => {
                    const info = CRYPTO_INFO[sym];
                    return (
                      <button
                        key={sym}
                        onClick={() => handleSymbolChange(sym)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-700 transition-colors flex items-center gap-2 ${
                          sym === symbol ? 'bg-slate-700/50 text-white' : 'text-gray-300'
                        }`}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: info.color }}
                        />
                        <span>{info.name}/USDT</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 relative min-h-0">
        <div ref={chartContainerRef} className="absolute inset-0" />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <div className="text-gray-400 text-xs">Cargando...</div>
            </div>
          </div>
        )}
      </div>

      {/* Timeframe indicator */}
      <div className="px-3 py-1.5 border-t border-slate-700/50 bg-slate-800/30">
        <span className="text-xs text-gray-400 uppercase">{timeframe}</span>
      </div>
    </div>
  );
};
