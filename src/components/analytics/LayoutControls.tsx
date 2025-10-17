'use client';

import { useAnalyticsStore, type LayoutType } from '@/store/analyticsStore';
import type { ReactNode } from 'react';

const LAYOUTS: { type: LayoutType; icon: ReactNode; label: string }[] = [
  {
    type: 'single',
    label: 'Single',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    ),
  },
  {
    type: 'split2',
    label: 'Split 2',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="8" height="18" rx="1" />
        <rect x="13" y="3" width="8" height="18" rx="1" />
      </svg>
    ),
  },
  {
    type: 'grid4',
    label: 'Grid 4',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="8" height="8" rx="1" />
        <rect x="13" y="3" width="8" height="8" rx="1" />
        <rect x="3" y="13" width="8" height="8" rx="1" />
        <rect x="13" y="13" width="8" height="8" rx="1" />
      </svg>
    ),
  },
  {
    type: 'grid6',
    label: 'Grid 6',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="5" height="8" rx="1" />
        <rect x="9" y="3" width="5" height="8" rx="1" />
        <rect x="16" y="3" width="5" height="8" rx="1" />
        <rect x="2" y="13" width="5" height="8" rx="1" />
        <rect x="9" y="13" width="5" height="8" rx="1" />
        <rect x="16" y="13" width="5" height="8" rx="1" />
      </svg>
    ),
  },
];

export const LayoutControls = () => {
  const layout = useAnalyticsStore((state) => state.layout);
  const setLayout = useAnalyticsStore((state) => state.setLayout);

  return (
    <div className="bg-[#0f1436]/60 backdrop-blur-md rounded-xl border border-blue-500/20 p-3 sm:p-4 shadow-xl shadow-blue-900/10">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        {/* Layout selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-blue-200/70 font-medium whitespace-nowrap">Layout:</span>
          <div className="flex gap-1.5">
            {LAYOUTS.map((layoutOption) => (
              <button
                key={layoutOption.type}
                onClick={() => setLayout(layoutOption.type)}
                className={`
                  relative px-3 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 group
                  ${
                    layout === layoutOption.type
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/40'
                      : 'bg-[#1a1f3a]/60 text-blue-200/60 hover:bg-[#1a1f3a] hover:text-blue-100 hover:shadow-md hover:shadow-blue-500/20'
                  }
                `}
                title={layoutOption.label}
              >
                {layoutOption.icon}
                <span className="text-xs font-medium hidden sm:inline">{layoutOption.label}</span>

                {/* Indicator para layout activo */}
                {layout === layoutOption.type && (
                  <div className="absolute inset-0 rounded-lg border-2 border-blue-400/50 pointer-events-none animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-gradient-to-b from-blue-500/0 via-blue-500/50 to-blue-500/0" />

        {/* Info text */}
        <div className="text-xs text-blue-200/60 hidden lg:flex items-center gap-2">
          <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          <span>Each chart updates in real-time with its own WebSocket</span>
        </div>
      </div>
    </div>
  );
};
