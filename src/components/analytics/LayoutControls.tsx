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
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700/50 p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        {/* Layout selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 font-medium whitespace-nowrap">Layout:</span>
          <div className="flex gap-1.5">
            {LAYOUTS.map((layoutOption) => (
              <button
                key={layoutOption.type}
                onClick={() => setLayout(layoutOption.type)}
                className={`
                  relative px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-2 group
                  ${
                    layout === layoutOption.type
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white'
                  }
                `}
                title={layoutOption.label}
              >
                {layoutOption.icon}
                <span className="text-xs font-medium hidden sm:inline">{layoutOption.label}</span>

                {/* Indicator para layout activo */}
                {layout === layoutOption.type && (
                  <div className="absolute inset-0 rounded-md border-2 border-blue-400 pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-slate-700" />

        {/* Info text */}
        <div className="text-xs text-gray-400 hidden lg:block">
          Each chart updates in real-time with its own WebSocket
        </div>
      </div>
    </div>
  );
};
