'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, UTCTimestamp, CandlestickData, CandlestickSeries } from 'lightweight-charts';
import { useBinanceChart } from '@/hooks/useBinanceChart';
import { useAnalyticsStore, type Timeframe } from '@/store/analyticsStore';
import { useWatchlistStore } from '@/store/watchlistStore';
import { useTickerStore } from '@/store/tickerStore';
import { TimeframeSelector } from '@/components/analytics/TimeframeSelector';
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

export const ChartCard = ({ chartId, symbol, timeframe }: ChartCardProps) => {
  // Debug: Log mount/unmount
  useEffect(() => {
    console.log(`[ChartCard] 🎨 Mounted - ${chartId} with ${symbol} (${timeframe})`);
    return () => {
      console.log(`[ChartCard] 💀 Unmounted - ${chartId}`);
    };
  }, [chartId, symbol, timeframe]);

  const { candles, currentPrice, priceChangePercent, isLoading } = useBinanceChart(chartId, symbol, timeframe);
  const updateChartSymbol = useAnalyticsStore((state) => state.updateChartSymbol);
  const updateChartTimeframe = useAnalyticsStore((state) => state.updateChartTimeframe);

  // Watchlist & Ticker data
  const availableTokens = useWatchlistStore((state) => state.availableTokens);
  const watchlists = useWatchlistStore((state) => state.watchlists);
  const tickers = useTickerStore((state) => state.tickers);

  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const cryptoInfo = CRYPTO_INFO[symbol];

  // Filtrar y organizar tokens
  const { favoriteTokens, allTokens } = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    // Get favorites from watchlist
    const favoritesWatchlist = watchlists.find((w) => w.id === 'favorites');
    const favoriteSymbols = favoritesWatchlist?.symbols || [];

    // Filtrar tokens disponibles
    const filtered = availableTokens.filter((token) => {
      if (!query) return true;
      return (
        token.name.toLowerCase().includes(query) ||
        token.symbol.toLowerCase().includes(query) ||
        token.tradingPair.toLowerCase().includes(query)
      );
    });

    // Separar favoritos y todos
    const favorites = filtered.filter((token) =>
      favoriteSymbols.includes(token.symbol)
    );

    const all = filtered.filter((token) =>
      !favoriteSymbols.includes(token.symbol)
    );

    return {
      favoriteTokens: favorites,
      allTokens: all,
    };
  }, [availableTokens, searchQuery, watchlists]);

  // Cerrar menú al hacer click fuera y auto-focus en búsqueda
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setSearchQuery('');
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto-focus en el input de búsqueda
      setTimeout(() => searchInputRef.current?.focus(), 100);
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
        textColor: '#93C5FD',
      },
      grid: {
        vertLines: { color: '#1a1f3a', style: 1 },
        horzLines: { color: '#1a1f3a', style: 1 },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: false,
        fixRightEdge: false,
      },
      rightPriceScale: {
        borderVisible: false,
        autoScale: true,
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

    // Usar ResizeObserver para detectar cambios de tamaño del contenedor
    const resizeObserver = new ResizeObserver((entries) => {
      if (!chartRef.current || !chartContainerRef.current) return;

      const { width, height } = entries[0].contentRect;

      // Solo actualizar si las dimensiones son válidas
      if (width > 0 && height > 0) {
        chartRef.current.applyOptions({ width, height });

        // Ajustar el contenido del chart después del resize
        setTimeout(() => {
          if (chartRef.current) {
            chartRef.current.timeScale().fitContent();
          }
        }, 0);
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    // Ajustar contenido inicial después de un pequeño delay para asegurar que el DOM está renderizado
    setTimeout(() => {
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }, 100);

    return () => {
      resizeObserver.disconnect();
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

      // Ajustar AMBAS escalas: tiempo (horizontal) Y precio (vertical)
      if (chartRef.current) {
        // Ajustar escala de tiempo
        chartRef.current.timeScale().fitContent();

        // Forzar reescalado del precio (eje Y) - crítico al cambiar de cripto
        chartRef.current.timeScale().scrollToPosition(0, false);
      }
    } catch (error) {
      console.error(`[ChartCard ${chartId}] Error updating chart:`, error);
    }
  }, [candles, chartId]);

  const handleSymbolChange = (tradingPair: CryptoSymbol) => {
    console.log(`[ChartCard] 🔄 Changing ${chartId} from ${symbol} to ${tradingPair}`);
    updateChartSymbol(chartId, tradingPair);
    setShowMenu(false);
    setSearchQuery('');
  };

  const handleTimeframeChange = (newTimeframe: Timeframe) => {
    console.log(`[ChartCard] ⏱️  Changing ${chartId} timeframe from ${timeframe} to ${newTimeframe}`);
    updateChartTimeframe(chartId, newTimeframe);
  };

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return '---';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const formatPercent = (percent: number | null | undefined) => {
    if (percent === null || percent === undefined) return '0.00';
    return percent.toFixed(2);
  };

  // Helper para renderizar un token en el dropdown
  const renderTokenItem = (token: typeof availableTokens[0]) => {
    const ticker = tickers[token.symbol];
    const isSelected = token.tradingPair === symbol;
    const tokenColor = CRYPTO_INFO[token.tradingPair as CryptoSymbol]?.color || '#6B7280';

    return (
      <button
        key={token.tradingPair}
        onClick={() => handleSymbolChange(token.tradingPair as CryptoSymbol)}
        className={`w-full px-3 py-2.5 text-left hover:bg-blue-500/10 transition-all flex items-center justify-between group ${
          isSelected ? 'bg-blue-500/20 border-l-2 border-blue-400' : ''
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0 shadow-lg"
            style={{ backgroundColor: tokenColor, boxShadow: `0 0 8px ${tokenColor}40` }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5">
              <span className={`font-semibold text-sm ${isSelected ? 'text-blue-100' : 'text-blue-200/90'}`}>
                {token.symbol}
              </span>
              <span className="text-xs text-blue-300/50 truncate">{token.name}</span>
            </div>
          </div>
        </div>

        {ticker && (
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <span className="text-xs text-blue-200/80 font-medium">
              {formatPrice(ticker.price)}
            </span>
            <span
              className={`text-xs font-medium ${
                ticker.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {ticker.change24h >= 0 ? '↗' : '↘'} {formatPercent(ticker.change24h)}%
            </span>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="bg-[#0f1436]/70 backdrop-blur-md rounded-xl border border-blue-500/20 overflow-hidden flex flex-col h-full shadow-2xl shadow-blue-900/20">
      {/* Header */}
      <div className="px-3 py-2 border-b border-blue-500/20 flex items-center justify-between bg-gradient-to-r from-[#1a1f3a]/60 to-[#0f1436]/60">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: cryptoInfo.color }}
          />
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="font-bold text-blue-100 text-sm">{cryptoInfo.name}</span>
            <span className="text-xs text-blue-300/60">/USDT</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Precio y cambio */}
          <div className="flex flex-col items-end">
            <span className="text-blue-50 font-semibold text-sm whitespace-nowrap">
              {formatPrice(currentPrice)}
            </span>
            {priceChangePercent !== null && (
              <span
                className={`text-xs font-medium ${
                  priceChangePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
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
              className="text-blue-300/60 hover:text-blue-100 transition-all p-1 hover:bg-blue-500/20 rounded-md"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <circle cx="8" cy="3" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="8" cy="13" r="1.5" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-[#0f1436]/95 backdrop-blur-lg border border-blue-500/30 rounded-xl shadow-2xl shadow-blue-900/30 z-50 min-w[320px] max-w-[400px] max-h-[500px] overflow-hidden flex flex-col min-h-0">
                {/* Barra de búsqueda */}
                <div className="p-3 border-b border-blue-500/20">
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/60"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar token..."
                      className="w-full pl-10 pr-3 py-2 bg-[#1a1f3a]/60 border border-blue-500/30 rounded-lg text-sm text-blue-100 placeholder-blue-300/40 focus:outline-none focus:border-blue-400 focus:shadow-lg focus:shadow-blue-500/20 transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300/60 hover:text-blue-100"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Lista de tokens scrollable */}
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scrollbar-stable px-2 pb-2 after:content-[''] after:block after:h-2">
                  {/* Favoritos */}
                  {favoriteTokens.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs text-blue-200/70 font-semibold uppercase tracking-wider bg-[#1a1f3a]/40 sticky top-0 z-10 backdrop-blur-sm">
                        ⭐ Favoritos
                      </div>
                      <div>
                        {favoriteTokens.map((token) => renderTokenItem(token))}
                      </div>
                    </div>
                  )}

                  {/* Todos los tokens */}
                  {allTokens.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs text-blue-200/70 font-semibold uppercase tracking-wider bg-[#1a1f3a]/40 sticky top-0 z-10 backdrop-blur-sm">
                        📊 Todos los tokens
                      </div>
                      <div>
                        {allTokens.map((token) => renderTokenItem(token))}
                      </div>
                    </div>
                  )}

                  {/* No results */}
                  {favoriteTokens.length === 0 && allTokens.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-blue-300/50">
                      <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm">No se encontraron tokens</p>
                      <p className="text-xs mt-1">Intenta otra búsqueda</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="px-3 py-2 border-b border-blue-500/20 bg-gradient-to-r from-[#1a1f3a]/30 to-[#0f1436]/30">
        <TimeframeSelector currentTimeframe={timeframe} onTimeframeChange={handleTimeframeChange} />
      </div>

      {/* Chart Area */}
      <div className="flex-1 relative min-h-0 bg-gradient-to-br from-[#0a0e27]/50 to-[#14183a]/50">
        <div ref={chartContainerRef} className="absolute inset-0" />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0f1436]/90 backdrop-blur-md">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-t-2 border-blue-500"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-10 w-10 border border-blue-400/30"></div>
              </div>
              <div className="text-blue-200/80 text-xs font-medium">Cargando datos...</div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1f3a;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 3px;
          box-shadow: 0 0 6px rgba(59, 130, 246, 0.4);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #60a5fa 0%, #a78bfa 100%);
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
        }
      `}</style>
    </div>
  );
};
