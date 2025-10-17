'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { LayoutControls } from '@/components/analytics/LayoutControls';
import { GridLayout } from '@/components/analytics/GridLayout';
import { useBinanceTicker } from '@/hooks/useBinanceTicker';

export default function AnalyticsPage() {
  // Enable ticker for real-time prices in dropdown
  useBinanceTicker();

  return (
    <AppLayout>
      <div className="min-h-full bg-gradient-to-br from-[#0a0e27] via-[#0f1436] to-[#14183a] relative overflow-hidden">
        {/* Fondo con efectos de luz */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-[1920px] mx-auto p-3 sm:p-4 md:p-6 space-y-4 relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-purple-200 to-blue-300 drop-shadow-[0_0_15px_rgba(147,197,253,0.3)]">
              Analytics Dashboard
            </h1>
            <div className="text-xs sm:text-sm text-blue-200/80 bg-[#0f1436]/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-blue-500/30 shadow-lg shadow-blue-500/10">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                Multi-Chart View • Realtime Updates
              </span>
            </div>
          </div>

          {/* Layout Controls */}
          <LayoutControls />

          {/* Grid de Charts */}
          <GridLayout />
        </div>
      </div>
    </AppLayout>
  );
}
