'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, UTCTimestamp, CandlestickData, CandlestickSeries } from 'lightweight-charts';
import { useMarketStore } from '@/store/marketStore';

export const Chart = () => {
  const candles = useMarketStore((state) => state.candles);
  const symbol = useMarketStore((state) => state.symbol);
  const isLoading = useMarketStore((state) => state.isLoading);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const previousSymbolRef = useRef(symbol);

  // Create chart only once on mount
  useEffect(() => {
    if (!chartContainerRef.current) return;

    console.log('[Chart] Creating chart instance');

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#1F2937' },
        textColor: '#9CA3AF',
      },
      grid: {
        vertLines: { color: '#374151' },
        horzLines: { color: '#374151' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
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

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup only on unmount
    return () => {
      console.log('[Chart] Cleaning up chart instance');
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, []); // Only run once on mount

  // Update chart data when candles or symbol changes
  useEffect(() => {
    if (!seriesRef.current || !chartRef.current) {
      return;
    }

    // If symbol changed, clear the chart
    if (previousSymbolRef.current !== symbol) {
      console.log(`[Chart] Symbol changed from ${previousSymbolRef.current} to ${symbol}, clearing chart`);
      seriesRef.current.setData([]);
      previousSymbolRef.current = symbol;
    }

    // Update chart with new data
    if (candles.length === 0) {
      return;
    }

    try {
      console.log(`[Chart] Updating chart data for ${symbol} with ${candles.length} candles`);

      const chartData: CandlestickData<UTCTimestamp>[] = candles.map((candle) => ({
        time: candle.time as UTCTimestamp,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }));

      // Validate that all candles have valid data
      const hasInvalidData = chartData.some(
        (d) => !d.time || isNaN(d.open) || isNaN(d.high) || isNaN(d.low) || isNaN(d.close)
      );

      if (!hasInvalidData) {
        seriesRef.current.setData(chartData);
        console.log(`[Chart] Chart data updated successfully`);
      } else {
        console.warn(`[Chart] Invalid candle data detected, skipping chart update`);
      }
    } catch (error) {
      console.error(`[Chart] Error updating chart data:`, error);
    }
  }, [candles, symbol]);

  const getSymbolLabel = () => {
    return symbol.replace('usdt', '').toUpperCase();
  };

  return (
    <div className="bg-gray-800 rounded-xl p-5 shadow-2xl border border-gray-700">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-1">
          {getSymbolLabel()}/USDT - Gráfico de 1 Minuto
        </h3>
        <p className="text-xs text-gray-400">Zona horaria: UTC (Hora Universal)</p>
      </div>
      <div className="relative rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
        <div ref={chartContainerRef} />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <div className="text-gray-300 font-medium">Cargando datos del gráfico...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
