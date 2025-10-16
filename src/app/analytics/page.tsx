'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { LayoutControls } from '@/components/analytics/LayoutControls';
import { GridLayout } from '@/components/analytics/GridLayout';
import { useBinanceTicker } from '@/hooks/useBinanceTicker';

export default function AnalyticsPage() {
  // Activar ticker para precios en tiempo real en el dropdown
  useBinanceTicker();

  return (
    <AppLayout>
      <div className="min-h-full bg-gradient-to-br from-black via-gray-900 to-slate-900">
        <div className="max-w-[1920px] mx-auto p-3 sm:p-4 md:p-6 space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
              Analytics Dashboard
            </h1>
            <div className="text-xs sm:text-sm text-gray-400 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
              Multi-Chart View • Realtime Updates
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
