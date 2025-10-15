import type { CryptoSymbol } from '@/types/market';

/**
 * Maps short symbol names (BTC, ETH, SOL, etc.) to Binance trading pairs (btcusdt, ethusdt, etc.)
 */
export function mapSymbolToTradingPair(shortSymbol: string): CryptoSymbol | null {
  const symbolMap: Record<string, CryptoSymbol> = {
    'BTC': 'btcusdt',
    'ETH': 'ethusdt',
    'SOL': 'solusdt',
    'BNB': 'bnbusdt',
    'XRP': 'xrpusdt',
    'ADA': 'adausdt',
    'DOGE': 'dogeusdt',
    'MATIC': 'maticusdt',
    'DOT': 'dotusdt',
    'AVAX': 'avaxusdt',
    'LINK': 'linkusdt',
    'UNI': 'uniusdt',
    'LTC': 'ltcusdt',
    'TRX': 'trxusdt',
    'ATOM': 'atomusdt',
  };

  return symbolMap[shortSymbol.toUpperCase()] || null;
}

/**
 * Maps trading pairs (btcusdt) back to short symbols (BTC)
 */
export function mapTradingPairToSymbol(tradingPair: CryptoSymbol): string {
  const reverseMap: Record<CryptoSymbol, string> = {
    'btcusdt': 'BTC',
    'ethusdt': 'ETH',
    'solusdt': 'SOL',
    'bnbusdt': 'BNB',
    'xrpusdt': 'XRP',
    'adausdt': 'ADA',
    'dogeusdt': 'DOGE',
    'maticusdt': 'MATIC',
    'dotusdt': 'DOT',
    'avaxusdt': 'AVAX',
    'linkusdt': 'LINK',
    'uniusdt': 'UNI',
    'ltcusdt': 'LTC',
    'trxusdt': 'TRX',
    'atomusdt': 'ATOM',
  };

  return reverseMap[tradingPair];
}
