export interface CryptoItem {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  icon: string;
}

export interface WatchlistGroupData {
  title: string;
  icon: string;
  items: CryptoItem[];
  defaultExpanded?: boolean;
}
