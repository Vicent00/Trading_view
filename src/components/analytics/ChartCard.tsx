'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, UTCTimestamp, CandlestickData, CandlestickSeries } from 'lightweight-charts';
import { useBinanceChart } from '@/hooks/useBinanceChart';
import { useAnalyticsStore, type Timeframe } from '@/store/analyticsStore';
import { useWatchlistStore } from '@/store/watchlistStore';
import { useTickerStore } from '@/store/tickerStore';
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

  const handleSymbolChange = (tradingPair: CryptoSymbol) => {
    console.log(`[ChartCard] 🔄 Changing ${chartId} from ${symbol} to ${tradingPair}`);
    updateChartSymbol(chartId, tradingPair);
    setShowMenu(false);
    setSearchQuery('');
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
        className={`w-full px-3 py-2.5 text-left hover:bg-slate-700/50 transition-colors flex items-center justify-between group ${
          isSelected ? 'bg-slate-700/70' : ''
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: tokenColor }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5">
              <span className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                {token.symbol}
              </span>
              <span className="text-xs text-gray-400 truncate">{token.name}</span>
            </div>
          </div>
        </div>

        {ticker && (
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <span className="text-xs text-gray-300 font-medium">
              {formatPrice(ticker.price)}
            </span>
            <span
              className={`text-xs font-medium ${
                ticker.change24h >= 0 ? 'text-green-400' : 'text-red-400'
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
              <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 min-w-[320px] max-w-[400px] max-h-[500px] overflow-hidden flex flex-col">
                {/* Barra de búsqueda */}
                <div className="p-3 border-b border-slate-700/50">
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
                      className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
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
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                  {/* Favoritos */}
                  {favoriteTokens.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs text-gray-400 font-semibold uppercase tracking-wider bg-slate-800/50 sticky top-0 z-10">
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
                      <div className="px-3 py-2 text-xs text-gray-400 font-semibold uppercase tracking-wider bg-slate-800/50 sticky top-0 z-10">
                        📊 Todos los tokens
                      </div>
                      <div>
                        {allTokens.map((token) => renderTokenItem(token))}
                      </div>
                    </div>
                  )}

                  {/* No results */}
                  {favoriteTokens.length === 0 && allTokens.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
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

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
};
