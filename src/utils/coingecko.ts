// Minimal CoinGecko helpers (no API key)

export interface GlobalStatsResponse {
  data: {
    total_market_cap: Record<string, number>;
    total_volume: Record<string, number>;
    market_cap_change_percentage_24h_usd: number;
    market_cap_percentage: { btc: number; eth: number };
  };
}

export async function fetchGlobalStats(): Promise<{
  marketCapUsd: number;
  volume24hUsd: number;
  btcDominance: number;
  ethDominance: number;
  marketCapChange24h: number;
}> {
  const res = await fetch('https://api.coingecko.com/api/v3/global', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load global stats');
  const json: GlobalStatsResponse = await res.json();
  const usdCap = json.data.total_market_cap.usd || 0;
  const usdVol = json.data.total_volume.usd || 0;
  return {
    marketCapUsd: usdCap,
    volume24hUsd: usdVol,
    btcDominance: json.data.market_cap_percentage.btc ?? 0,
    ethDominance: json.data.market_cap_percentage.eth ?? 0,
    marketCapChange24h: json.data.market_cap_change_percentage_24h_usd ?? 0,
  };
}

export interface MarketRowResponse {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
}

export async function fetchTopMarkets(): Promise<MarketRowResponse[]> {
  const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&price_change_percentage=24h';
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load markets');
  const json: MarketRowResponse[] = await res.json();
  return json;
}


