'use client';

import { useMarketStore } from '@/store/marketStore';

export const TradesList = () => {
  const trades = useMarketStore((state) => state.trades);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-5 shadow-2xl border border-slate-700 h-full">
      <h3 className="text-xl font-bold text-white mb-4">Trades Recientes</h3>
      <div className="space-y-1 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {trades.length === 0 ? (
          <div className="text-slate-500 text-sm text-center py-8 bg-slate-900/50 rounded-lg">
            No hay trades disponibles aún...
          </div>
        ) : (
          trades.map((trade) => (
            <div
              key={trade.id}
              className="flex items-center justify-between text-sm py-3 px-3 rounded-lg hover:bg-slate-800/50 transition-colors border-b border-slate-700/50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-md text-xs font-bold shadow-sm ${
                    trade.isBuyerMaker
                      ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                      : 'bg-green-500/30 text-green-300 border border-green-500/50'
                  }`}
                >
                  {trade.isBuyerMaker ? 'SELL' : 'BUY'}
                </span>
                <span className="text-gray-400 text-xs">{formatTime(trade.time)}</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-white font-bold text-sm">
                  ${trade.price.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="text-gray-500 text-xs">
                  {trade.quantity.toFixed(6)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
