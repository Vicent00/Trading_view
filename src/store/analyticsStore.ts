import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CryptoSymbol } from '@/types/market';

// Tipos de timeframe soportados
export type Timeframe = '1m' | '5m' | '15m' | '1h';

// Tipos de layout disponibles
export type LayoutType = 'single' | 'split2' | 'grid4' | 'grid6';

// Configuración de un chart individual
export interface ChartConfig {
  id: string;
  symbol: CryptoSymbol;
  timeframe: Timeframe;
}

// Estado del store de Analytics
interface AnalyticsState {
  layout: LayoutType;
  charts: ChartConfig[];

  // Actions
  setLayout: (layout: LayoutType) => void;
  updateChartSymbol: (chartId: string, symbol: CryptoSymbol) => void;
  updateChartTimeframe: (chartId: string, timeframe: Timeframe) => void;
  initializeCharts: () => void;
}

// Configuraciones por defecto para cada layout
const getDefaultChartsForLayout = (layout: LayoutType): ChartConfig[] => {
  switch (layout) {
    case 'single':
      return [
        { id: 'chart-1', symbol: 'btcusdt', timeframe: '1m' }
      ];
    case 'split2':
      return [
        { id: 'chart-1', symbol: 'btcusdt', timeframe: '1m' },
        { id: 'chart-2', symbol: 'ethusdt', timeframe: '1m' }
      ];
    case 'grid4':
      return [
        { id: 'chart-1', symbol: 'btcusdt', timeframe: '1m' },
        { id: 'chart-2', symbol: 'ethusdt', timeframe: '1m' },
        { id: 'chart-3', symbol: 'solusdt', timeframe: '1m' },
        { id: 'chart-4', symbol: 'bnbusdt', timeframe: '1m' }
      ];
    case 'grid6':
      return [
        { id: 'chart-1', symbol: 'btcusdt', timeframe: '1m' },
        { id: 'chart-2', symbol: 'ethusdt', timeframe: '1m' },
        { id: 'chart-3', symbol: 'solusdt', timeframe: '1m' },
        { id: 'chart-4', symbol: 'bnbusdt', timeframe: '1m' },
        { id: 'chart-5', symbol: 'maticusdt', timeframe: '1m' },
        { id: 'chart-6', symbol: 'avaxusdt', timeframe: '1m' }
      ];
    default:
      return [{ id: 'chart-1', symbol: 'btcusdt', timeframe: '1m' }];
  }
};

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      layout: 'single',
      charts: getDefaultChartsForLayout('single'),

      setLayout: (layout: LayoutType) => {
        const currentCharts = get().charts;
        const newCharts = getDefaultChartsForLayout(layout);

        // Intentar preservar los symbols de los charts existentes
        const updatedCharts = newCharts.map((newChart, index) => {
          const existingChart = currentCharts[index];
          if (existingChart) {
            return {
              ...newChart,
              symbol: existingChart.symbol,
              timeframe: existingChart.timeframe,
            };
          }
          return newChart;
        });

        set({ layout, charts: updatedCharts });
      },

      updateChartSymbol: (chartId: string, symbol: CryptoSymbol) => {
        set((state) => ({
          charts: state.charts.map((chart) =>
            chart.id === chartId ? { ...chart, symbol } : chart
          ),
        }));
      },

      updateChartTimeframe: (chartId: string, timeframe: Timeframe) => {
        set((state) => ({
          charts: state.charts.map((chart) =>
            chart.id === chartId ? { ...chart, timeframe } : chart
          ),
        }));
      },

      initializeCharts: () => {
        const { layout } = get();
        set({ charts: getDefaultChartsForLayout(layout) });
      },
    }),
    {
      name: 'analytics-storage', // Key en localStorage
      partialize: (state) => ({
        layout: state.layout,
        charts: state.charts,
      }),
    }
  )
);
