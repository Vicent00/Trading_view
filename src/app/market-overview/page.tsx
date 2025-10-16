"use client";

import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { fetchGlobalStats, fetchTopMarkets, MarketRowResponse } from '@/utils/coingecko';
import { GlobalStats, MarketRow } from '@/types/marketOverview';

export default function MarketOverviewPage() {
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [markets, setMarkets] = useState<MarketRow[]>([]);
  const [showAll, setShowAll] = useState(false);
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
    } catch (e: any) {
      setError(e?.message || 'Failed to load data');
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
    return showAll ? markets : markets.slice(0, 8);
  }, [markets, showAll]);

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-200">Market Overview</h1>
          {loading && <span className="text-xs text-gray-500">Actualizando…</span>}
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-900/20 border border-red-900 rounded p-3">
            {error}
          </div>
        )}

        {/* Global Stats */}
        {globalStats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <StatCard label="Market Cap" value={formatCurrency(globalStats.marketCapUsd)} delta={globalStats.marketCapChange24h} />
            <StatCard label="24h Volume" value={formatCurrency(globalStats.volume24hUsd)} />
          </div>
        )}

        {/* Top Movers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MoversList title="Top Gainers (24h)" items={topGainers} positive />
          <MoversList title="Top Losers (24h)" items={topLosers} />
        </div>

        {/* Top 100 Table */}
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-4 py-2 text-xs text-gray-400 border-b border-gray-800 bg-[#0b0b0b]">
            <div>Name</div>
            <div className="text-right">Price</div>
            <div className="text-right">24h %</div>
            <div className="text-right">Market Cap</div>
            <div className="text-right">Volume</div>
          </div>
          <div className="divide-y divide-gray-800">
            {displayedMarkets.map((m) => (
              <div key={m.id} className="px-4 py-3 md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr] md:items-center">
                {/* Mobile stacked */}
                <div className="flex items-center gap-3">
                  <img src={m.image} alt={m.name} className="w-6 h-6 rounded-full" />
                  <div className="flex items-center gap-2">
                    <span className="text-gray-200 text-sm">{m.name}</span>
                    <span className="text-gray-500 text-xs uppercase">{m.symbol}</span>
                  </div>
                </div>
                <div className="mt-2 md:mt-0 md:text-right text-gray-200">{formatCurrency(m.currentPrice)}</div>
                <div className={`mt-1 md:mt-0 md:text-right ${m.priceChange24hPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatPercent(m.priceChange24hPct)}
                </div>
                <div className="mt-1 md:mt-0 md:text-right text-gray-200">{formatCurrency(m.marketCap)}</div>
                <div className="mt-1 md:mt-0 md:text-right text-gray-200">{formatCurrency(m.totalVolume)}</div>
              </div>
            ))}
          </div>
          {!showAll && markets.length > 8 && (
            <div className="p-3 flex justify-center bg-[#0f0f0f]">
              <button
                onClick={() => setShowAll(true)}
                className="px-4 py-2 text-sm rounded bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700"
              >
                Ver más
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ label, value, delta }: { label: string; value: string; delta?: number }) {
  const deltaColor = delta === undefined ? '' : delta >= 0 ? 'text-emerald-400' : 'text-red-400';
  return (
    <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-4">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-lg font-semibold text-gray-200 mt-1">{value}</div>
      {delta !== undefined && (
        <div className={`text-xs mt-1 ${deltaColor}`}>{formatPercent(delta)}</div>
      )}
    </div>
  );
}

function MoversList({ title, items, positive }: { title: string; items: MarketRow[]; positive?: boolean }) {
  return (
    <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-4">
      <div className="text-sm font-semibold text-gray-200 mb-3">{title}</div>
      <div className="space-y-2">
        {items.map((m) => (
          <div key={m.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <img src={m.image} alt={m.name} className="w-5 h-5 rounded-full" />
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-gray-200 text-sm truncate max-w-[140px] sm:max-w-[200px]">{m.name}</span>
                <span className="text-gray-500 text-xs uppercase">{m.symbol}</span>
              </div>
            </div>
            <div className={`text-sm ${m.priceChange24hPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatPercent(m.priceChange24hPct)}
            </div>
          </div>
        ))}
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
