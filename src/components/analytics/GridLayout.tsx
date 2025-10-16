'use client';

import { useAnalyticsStore } from '@/store/analyticsStore';
import { ChartCard } from './ChartCard';

export const GridLayout = () => {
  const layout = useAnalyticsStore((state) => state.layout);
  const charts = useAnalyticsStore((state) => state.charts);

  // Clases CSS para cada tipo de layout
  const getGridClasses = () => {
    switch (layout) {
      case 'single':
        return 'grid grid-cols-1 gap-4 h-[calc(100vh-280px)] min-h-[500px]';
      case 'split2':
        return 'grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-280px)] min-h-[500px]';
      case 'grid4':
        return 'grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 h-[calc(100vh-280px)] min-h-[600px]';
      case 'grid6':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 h-[calc(100vh-280px)] min-h-[600px]';
      default:
        return 'grid grid-cols-1 gap-4';
    }
  };

  return (
    <div className={getGridClasses()}>
      {charts.map((chart) => (
        <ChartCard
          key={chart.id}
          chartId={chart.id}
          symbol={chart.symbol}
          timeframe={chart.timeframe}
        />
      ))}
    </div>
  );
};
