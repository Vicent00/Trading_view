'use client';

import type { Timeframe } from '@/store/analyticsStore';

interface TimeframeSelectorProps {
  currentTimeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
}

const TIMEFRAMES: { value: Timeframe; label: string; description: string }[] = [
  { value: '1m', label: '1m', description: '~8 horas' },
  { value: '5m', label: '5m', description: '~1 día' },
  { value: '15m', label: '15m', description: '~1 día' },
  { value: '30m', label: '30m', description: '~2 días' },
  { value: '1h', label: '1h', description: '~1 semana' },
  { value: '4h', label: '4h', description: '~1 mes' },
  { value: '1d', label: '1D', description: '~1 año' },
  { value: '1w', label: '1W', description: '~5 años' },
  { value: '1M', label: '1M', description: '~5 años' },
];

export const TimeframeSelector = ({ currentTimeframe, onTimeframeChange }: TimeframeSelectorProps) => {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf.value}
          onClick={() => onTimeframeChange(tf.value)}
          title={tf.description}
          className={`
            px-2 py-1 text-xs font-medium rounded transition-all duration-200
            ${
              currentTimeframe === tf.value
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700 hover:text-white'
            }
          `}
        >
          {tf.label}
        </button>
      ))}
    </div>
  );
};
