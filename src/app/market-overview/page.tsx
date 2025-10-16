"use client";

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { AppLayout } from '@/components/layout/AppLayout';
import { fetchGlobalStats, fetchTopMarkets, MarketRowResponse } from '@/utils/coingecko';
import { GlobalStats, MarketRow } from '@/types/marketOverview';

export default function MarketOverviewPage() {
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [markets, setMarkets] = useState<MarketRow[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [sortColumn, setSortColumn] = useState<keyof MarketRow | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      const [gs, mkt] = await Promise.all([
        fetchGlobalStats(),
        fetchTopMarkets(),
      ]);

      const mapped: MarketRow[] = mkt.map((r: MarketRowResponse) => ({
        id: r.id,
        symbol: r.symbol,
        name: r.name,
        image: r.image,
        currentPrice: r.current_price,
        priceChange24hPct: r.price_change_percentage_24h,
        marketCap: r.market_cap,
        totalVolume: r.total_volume,
      }));

      setGlobalStats(gs);
      setMarkets(mapped);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to load data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await load();
    })();
    const id = setInterval(load, 60_000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const topGainers = useMemo(() => {
    return [...markets]
      .sort((a, b) => (b.priceChange24hPct ?? -Infinity) - (a.priceChange24hPct ?? -Infinity))
      .slice(0, 5);
  }, [markets]);

  const topLosers = useMemo(() => {
    return [...markets]
      .sort((a, b) => (a.priceChange24hPct ?? Infinity) - (b.priceChange24hPct ?? Infinity))
      .slice(0, 5);
  }, [markets]);

  const displayedMarkets = useMemo(() => {
    const result = [...markets];
    
    if (sortColumn) {
      result.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return 0;
      });
    }
    
    return showAll ? result : result.slice(0, 8);
  }, [markets, showAll, sortColumn, sortDirection]);

  const handleSort = (column: keyof MarketRow) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-200">Market Overview</h1>
          {loading && <span className="text-xs text-gray-500 animate-pulse">Updating…</span>}
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-900/20 border border-red-900 rounded p-3">
            {error}
          </div>
        )}

        {/* Global Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {globalStats ? (
            <>
              <StatCard label="Market Cap" value={formatCurrency(globalStats.marketCapUsd)} delta={globalStats.marketCapChange24h} icon="chart" />
              <StatCard label="24h Volume" value={formatCurrency(globalStats.volume24hUsd)} icon="volume" />
            </>
          ) : (
            <>
              <SkeletonStatCard />
              <SkeletonStatCard />
            </>
          )}
        </div>

        {/* Top Movers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MoversList title="Top Gainers" items={topGainers} type="gainers" />
          <MoversList title="Top Losers" items={topLosers} type="losers" />
        </div>

        {/* Top 100 Table */}
        <MarketTable 
          markets={displayedMarkets}
          loading={loading}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          showAll={showAll}
          onShowAll={() => setShowAll(true)}
          onShowLess={() => setShowAll(false)}
          hasMore={markets.length > 8}
        />
      </div>
    </AppLayout>
  );
}

function StatCard({ label, value, delta, icon }: { label: string; value: string; delta?: number; icon: 'chart' | 'volume' }) {
  const deltaColor = delta === undefined ? '' : delta >= 0 ? 'text-emerald-400' : 'text-red-400';
  
  const iconSvg = icon === 'chart' ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
  
  const backgroundGradient = icon === 'chart' 
    ? 'bg-gradient-to-br from-blue-400/30 via-purple-500/25 to-indigo-600/35' 
    : 'bg-gradient-to-br from-emerald-400/30 via-teal-500/25 to-cyan-600/35';
  
  return (
    <div className={`${backgroundGradient} border border-gray-800 rounded-lg p-4 hover:scale-[1.02] hover:shadow-xl transition-all duration-200 group`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="text-gray-400 group-hover:text-gray-300 transition-colors">
          {iconSvg}
        </div>
        <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</div>
      </div>
      <div className="text-xl font-bold text-gray-200">{value}</div>
      {delta !== undefined && (
        <div className={`text-sm mt-2 font-medium ${deltaColor}`}>{formatPercent(delta)}</div>
      )}
    </div>
  );
}

function SkeletonStatCard() {
  return (
    <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 bg-gray-700 rounded"></div>
        <div className="h-3 w-20 bg-gray-700 rounded"></div>
      </div>
      <div className="h-6 w-24 bg-gray-700 rounded mb-2"></div>
      <div className="h-4 w-16 bg-gray-700 rounded"></div>
    </div>
  );
}

function MoversList({ title, items, type }: { title: string; items: MarketRow[]; type: 'gainers' | 'losers' }) {
  const isGainers = type === 'gainers';
  
  const customGradient = isGainers 
    ? 'linear-gradient(105deg, rgba(25, 255, 13, 1) 0%, rgba(36, 36, 36, 1) 85%)'
    : 'linear-gradient(274deg, rgba(20, 13, 13, 1) 28%, rgba(255, 0, 0, 1) 69%)';
  
  return (
    <div 
      className="border border-gray-800 rounded-lg p-4 hover:shadow-lg transition-all duration-300 group"
      style={{ background: customGradient }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${isGainers ? 'bg-emerald-400 group-hover:bg-teal-300' : 'bg-red-400 group-hover:bg-pink-300'}`}></div>
        <div className="text-sm font-bold text-white uppercase tracking-wider">{title}</div>
      </div>
      <div className="space-y-2">
        {items.map((m, index) => (
          <div key={m.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800/40 transition-colors duration-150">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white transition-all duration-300 ${
                isGainers ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-teal-500 hover:to-teal-600' : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-pink-500 hover:to-pink-600'
              }`}>
                {index + 1}
              </div>
              <Image src={m.image} alt={m.name} width={20} height={20} className="w-5 h-5 rounded-full" />
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-white text-sm font-medium truncate max-w-[120px] sm:max-w-[160px]">{m.name}</span>
                <span className="text-gray-200 text-xs uppercase font-medium">{m.symbol}</span>
              </div>
            </div>
            <div className={`text-sm font-bold transition-colors duration-300 ${m.priceChange24hPct >= 0 ? 'text-emerald-400 group-hover:text-teal-300' : 'text-red-400 group-hover:text-pink-300'}`}>
              {formatPercent(m.priceChange24hPct)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketTable({ 
  markets, 
  loading, 
  sortColumn, 
  sortDirection, 
  onSort, 
  showAll, 
  onShowAll, 
  onShowLess,
  hasMore 
}: {
  markets: MarketRow[];
  loading: boolean;
  sortColumn: keyof MarketRow | null;
  sortDirection: 'asc' | 'desc';
  onSort: (column: keyof MarketRow) => void;
  showAll: boolean;
  onShowAll: () => void;
  onShowLess: () => void;
  hasMore: boolean;
}) {
  const columns = [
    { key: 'name' as keyof MarketRow, label: 'Name', sortable: true },
    { key: 'currentPrice' as keyof MarketRow, label: 'Price', sortable: true },
    { key: 'priceChange24hPct' as keyof MarketRow, label: '24h %', sortable: true },
    { key: 'marketCap' as keyof MarketRow, label: 'Market Cap', sortable: true },
    { key: 'totalVolume' as keyof MarketRow, label: 'Volume', sortable: true },
  ];

  const SortIcon = ({ column }: { column: keyof MarketRow }) => {
    if (sortColumn !== column) return null;
    return (
      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
      </svg>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-700/50 via-gray-800/40 to-gray-900/60 border border-gray-600 rounded-lg overflow-hidden shadow-xl">
      {/* Header */}
      <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-4 py-3 text-xs text-gray-400 border-b border-gray-600 bg-gradient-to-r from-gray-700/70 via-gray-800/60 to-gray-700/70">
        {columns.map((col) => (
          <button
            key={col.key}
            onClick={() => col.sortable && onSort(col.key)}
            className={`flex items-center justify-end text-right font-medium uppercase tracking-wider transition-colors ${
              col.sortable ? 'hover:text-gray-300 cursor-pointer' : 'cursor-default'
            } ${col.key === 'name' ? 'justify-start text-left' : ''}`}
          >
            {col.label}
            {col.sortable && <SortIcon column={col.key} />}
          </button>
        ))}
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-800">
        {loading && markets.length === 0 ? (
          // Skeleton rows
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-4 py-3 md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr] md:items-center animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-20 bg-gray-700 rounded"></div>
                  <div className="h-3 w-8 bg-gray-700 rounded"></div>
                </div>
              </div>
              <div className="mt-2 md:mt-0 md:text-right">
                <div className="h-4 w-16 bg-gray-700 rounded"></div>
              </div>
              <div className="mt-1 md:mt-0 md:text-right">
                <div className="h-4 w-12 bg-gray-700 rounded"></div>
              </div>
              <div className="mt-1 md:mt-0 md:text-right">
                <div className="h-4 w-20 bg-gray-700 rounded"></div>
              </div>
              <div className="mt-1 md:mt-0 md:text-right">
                <div className="h-4 w-16 bg-gray-700 rounded"></div>
              </div>
            </div>
          ))
        ) : (
          markets.map((m) => (
            <div key={m.id} className="px-4 py-3 md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr] md:items-center hover:bg-gray-800/40 cursor-pointer transition-colors duration-150">
              {/* Mobile stacked */}
              <div className="flex items-center gap-3">
                <Image src={m.image} alt={m.name} width={24} height={24} className="w-6 h-6 rounded-full" />
                <div className="flex items-center gap-2">
                  <span className="text-gray-200 text-sm font-medium">{m.name}</span>
                  <span className="text-gray-500 text-xs uppercase font-medium">{m.symbol}</span>
                </div>
              </div>
              <div className="mt-2 md:mt-0 md:text-right text-gray-200 font-medium">{formatCurrency(m.currentPrice)}</div>
              <div className={`mt-1 md:mt-0 md:text-right font-medium ${m.priceChange24hPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatPercent(m.priceChange24hPct)}
              </div>
              <div className="mt-1 md:mt-0 md:text-right text-gray-200 font-medium">{formatCurrency(m.marketCap)}</div>
              <div className="mt-1 md:mt-0 md:text-right text-gray-200 font-medium">{formatCurrency(m.totalVolume)}</div>
            </div>
          ))
        )}
      </div>
      
      {/* Show More/Less Button */}
      <div className="p-4 flex justify-center bg-gradient-to-r from-gray-800/30 via-gray-900/20 to-gray-800/30">
        {!showAll && hasMore ? (
          <button
            onClick={onShowAll}
            className="px-8 py-3 text-sm rounded-xl bg-gradient-to-r from-slate-700 to-gray-800 hover:from-slate-600 hover:to-gray-700 text-white font-semibold border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
                Show more tokens
          </button>
        ) : showAll && hasMore ? (
          <button
            onClick={onShowLess}
            className="px-8 py-3 text-sm rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-semibold border border-gray-500/30 hover:border-gray-400/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
                Show less
          </button>
        ) : null}
      </div>
    </div>
  );
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

function formatPercent(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return '-';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}
