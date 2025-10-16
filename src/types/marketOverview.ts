export interface GlobalStats {
  marketCapUsd: number;
  volume24hUsd: number;
  btcDominance: number;
  ethDominance: number;
  marketCapChange24h: number;
}

export interface MarketRow {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  priceChange24hPct: number;
  marketCap: number;
  totalVolume: number;
}


