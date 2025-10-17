'use client';

import type { Timeframe } from '@/store/analyticsStore';

interface TimeframeSelectorProps {
  currentTimeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
}

// Configuración de timeframes con cantidad de velas
const TIMEFRAMES: { value: Timeframe; label: string; candles: number }[] = [
  { value: '1m', label: '1m', candles: 500 },
  { value: '5m', label: '5m', candles: 288 },
  { value: '15m', label: '15m', candles: 96 },
  { value: '30m', label: '30m', candles: 96 },
  { value: '1h', label: '1h', candles: 168 },
  { value: '4h', label: '4h', candles: 180 },
  { value: '1d', label: '1D', candles: 365 },
  { value: '1w', label: '1W', candles: 260 },
  { value: '1M', label: '1M', candles: 60 },
];

// Calcular fecha de inicio basada en el timeframe
const getStartDate = (timeframe: Timeframe, candles: number): Date => {
  const now = new Date();
  const start = new Date(now);

  switch (timeframe) {
    case '1m':
      start.setMinutes(now.getMinutes() - candles);
      break;
    case '5m':
      start.setMinutes(now.getMinutes() - candles * 5);
      break;
    case '15m':
      start.setMinutes(now.getMinutes() - candles * 15);
      break;
    case '30m':
      start.setMinutes(now.getMinutes() - candles * 30);
      break;
    case '1h':
      start.setHours(now.getHours() - candles);
      break;
    case '4h':
      start.setHours(now.getHours() - candles * 4);
      break;
    case '1d':
      start.setDate(now.getDate() - candles);
      break;
    case '1w':
      start.setDate(now.getDate() - candles * 7);
      break;
    case '1M':
      start.setMonth(now.getMonth() - candles);
      break;
  }

  return start;
};

// Formatear fecha de forma legible
const formatDate = (date: Date, timeframe: Timeframe): string => {
  const now = new Date();

  // Para timeframes de minutos/horas, mostrar hora
  if (['1m', '5m', '15m', '30m'].includes(timeframe)) {
    const hours = Math.abs(Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60)));
    if (hours < 24) {
      return `${hours}h atrás`;
    }
  }

  if (timeframe === '1h') {
    const hours = Math.abs(Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60)));
    if (hours < 48) {
      return `${hours}h atrás`;
    }
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  }

  if (timeframe === '4h') {
    const days = Math.abs(Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)));
    return `${days}d atrás`;
  }

  // Para días, semanas, meses: mostrar fecha real
  const day = date.getDate();
  const month = date.toLocaleString('es', { month: 'short' });
  const year = date.getFullYear();
  const currentYear = now.getFullYear();

  if (year === currentYear) {
    return `Desde ${day} ${month}`;
  }

  return `Desde ${day} ${month} ${year}`;
};

export const TimeframeSelector = ({ currentTimeframe, onTimeframeChange }: TimeframeSelectorProps) => {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {TIMEFRAMES.map((tf) => {
        const startDate = getStartDate(tf.value, tf.candles);
        const dateDescription = formatDate(startDate, tf.value);

        return (
          <button
            key={tf.value}
            onClick={() => onTimeframeChange(tf.value)}
            title={dateDescription}
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
        );
      })}
    </div>
  );
};
