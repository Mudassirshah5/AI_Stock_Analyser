export interface WatchlistItem {
  symbol: string;
  name: string;
  exchange?: string;
  addedAt: string;
  price?: number;
  previousClose?: number;
  change?: number;
  changePercent?: number;
  currency?: string;
  updatedAt?: string;
}
