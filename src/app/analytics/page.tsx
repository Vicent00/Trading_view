'use client';

import { useBinanceWebSocket } from '@/hooks/useBinanceWebSocket';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { SymbolSelector } from '@/components/SymbolSelector';
import { Chart } from '@/components/Chart';
import { AppLayout } from '@/components/layout/AppLayout';

export default function AnalyticsPage() {
  useBinanceWebSocket();

  return (
    <AppLayout>
      <div className="min-h-full bg-gradient-to-br from-black via-gray-900 to-slate-900">
        <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Header - Stack on mobile, horizontal on desktop */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
              Analytics Dashboard
            </h1>
            <ConnectionStatus />
          </div>

          {/* Symbol Selector */}
          <SymbolSelector />

          {/* Chart Full Width */}
          <div className="w-full">
            <Chart />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
