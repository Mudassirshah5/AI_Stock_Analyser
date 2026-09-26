import React, { useState, useEffect, useRef } from 'react';
import {
  Star,
  X,
  RefreshCw,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Search,
  Building2,
  Clock,
  ChevronRight,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { WatchlistItem } from '../types/watchlist';

interface WatchlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  watchlist: WatchlistItem[];
  currentTicker: string;
  onSelectTicker: (symbol: string) => void;
  onAddToWatchlist: (item: { symbol: string; name: string; exchange?: string }) => void;
  onRemoveFromWatchlist: (symbol: string) => void;
  onRefreshQuotes: () => Promise<void>;
  isRefreshing: boolean;
  lastUpdated: string | null;
}

export const WatchlistSidebar: React.FC<WatchlistSidebarProps> = ({
  isOpen,
  onClose,
  watchlist,
  currentTicker,
  onSelectTicker,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  onRefreshQuotes,
  isRefreshing,
  lastUpdated,
}) => {
  const [newSymbolInput, setNewSymbolInput] = useState('');
  const [isSearchingAdd, setIsSearchingAdd] = useState(false);
  const [addSuggestions, setAddSuggestions] = useState<
    Array<{ symbol: string; name: string; exchange: string }>
  >([]);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const addInputRef = useRef<HTMLInputElement>(null);
  const addContainerRef = useRef<HTMLDivElement>(null);

  // Close add dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addContainerRef.current && !addContainerRef.current.contains(e.target as Node)) {
        setIsAddMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for the Add Ticker input
  useEffect(() => {
    const trimmed = newSymbolInput.trim();
    if (!trimmed || !isAddMenuOpen) {
      setAddSuggestions([]);
      return;
    }

    let isCancelled = false;
    setIsSearchingAdd(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok && !isCancelled) {
          const list = await res.json();
          // Filter out items already in the watchlist
          const existing = new Set(watchlist.map((w) => w.symbol.toUpperCase()));
          setAddSuggestions(list.filter((item: any) => !existing.has(item.symbol.toUpperCase())).slice(0, 6));
        }
      } catch (err) {
        console.warn('Watchlist add search error:', err);
      } finally {
        if (!isCancelled) setIsSearchingAdd(false);
      }
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [newSymbolInput, isAddMenuOpen, watchlist]);

  // Handle direct add
  const handleDirectAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const sym = newSymbolInput.trim().toUpperCase();
    if (!sym) return;

    onAddToWatchlist({
      symbol: sym,
      name: sym,
    });
    setNewSymbolInput('');
    setIsAddMenuOpen(false);
  };

  const handleSelectSuggestion = (item: { symbol: string; name: string; exchange: string }) => {
    onAddToWatchlist({
      symbol: item.symbol,
      name: item.name,
      exchange: item.exchange,
    });
    setNewSymbolInput('');
    setIsAddMenuOpen(false);
  };

  const defaultStarterSuggestions = [
    { symbol: 'NVDA', name: 'NVIDIA Corp.', exchange: 'NASDAQ' },
    { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', exchange: 'NASDAQ' },
    { symbol: 'BLK', name: 'BlackRock Inc.', exchange: 'NYSE' },
    { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ' },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay for mobile */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 lg:hidden transition-opacity"
        onClick={onClose}
      />

      {/* Floating Slide-out Drawer */}
      <aside
        className="fixed top-0 right-0 bottom-0 w-full sm:w-96 max-w-full bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-250 font-sans"
        aria-label="Favorites Watchlist"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">Favorites Watchlist</h2>
                <span className="text-[11px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full">
                  {watchlist.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Instant access &amp; live price tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onRefreshQuotes()}
              disabled={isRefreshing || watchlist.length === 0}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Refresh real-time prices"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-slate-800' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
              title="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Add Ticker Section */}
        <div className="p-3.5 border-b border-slate-200 bg-white" ref={addContainerRef}>
          <form onSubmit={handleDirectAdd} className="relative">
            <div className="relative">
              <input
                ref={addInputRef}
                type="text"
                value={newSymbolInput}
                onChange={(e) => {
                  setNewSymbolInput(e.target.value);
                  setIsAddMenuOpen(true);
                }}
                onFocus={() => setIsAddMenuOpen(true)}
                placeholder="Add ticker (e.g. NVDA, BLK)..."
                className="w-full pl-8 pr-16 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 uppercase tracking-wider"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />

              <button
                type="submit"
                disabled={!newSymbolInput.trim()}
                className="absolute right-1 top-1 bottom-1 px-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>

            {/* Quick autocomplete dropdown for Add */}
            {isAddMenuOpen && newSymbolInput.trim().length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-20 overflow-hidden text-xs">
                {isSearchingAdd ? (
                  <div className="p-3 text-center text-slate-500 flex items-center justify-center gap-2 text-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                    <span>Searching symbols...</span>
                  </div>
                ) : addSuggestions.length > 0 ? (
                  <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                    {addSuggestions.map((item) => (
                      <button
                        key={item.symbol}
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                      >
                        <div className="min-w-0">
                          <span className="font-mono font-bold text-slate-900 mr-2">
                            {item.symbol}
                          </span>
                          <span className="text-slate-500 text-[11px] truncate">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {item.exchange}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-2.5 text-center text-slate-400 text-[11px]">
                    Press Enter to add &ldquo;{newSymbolInput.trim().toUpperCase()}&rdquo;
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Watchlist Items Scrollable Area */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
          {watchlist.length > 0 ? (
            watchlist.map((item) => {
              const isCurrent = item.symbol.toUpperCase() === currentTicker.toUpperCase();
              const hasPrice = item.price !== undefined;
              const isPositive = (item.change ?? 0) >= 0;

              return (
                <div
                  key={item.symbol}
                  className={`group relative rounded-lg p-3 transition-all ${
                    isCurrent
                      ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                      : 'bg-white hover:bg-slate-50 border border-slate-100/80 text-slate-900 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    {/* Left: Clickable ticker selection */}
                    <div
                      onClick={() => onSelectTicker(item.symbol)}
                      className="flex-1 cursor-pointer min-w-0"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold text-sm tracking-wide ${
                            isCurrent ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {item.symbol}
                        </span>
                        {item.exchange && (
                          <span
                            className={`text-[9px] font-mono uppercase px-1 py-0.2 rounded ${
                              isCurrent
                                ? 'bg-slate-800 text-slate-300'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {item.exchange}
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </div>

                      <p
                        className={`text-xs truncate font-medium mt-0.5 ${
                          isCurrent ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {item.name || item.symbol}
                      </p>
                    </div>

                    {/* Right: Real-time Price and % Change */}
                    <div
                      onClick={() => onSelectTicker(item.symbol)}
                      className="cursor-pointer text-right shrink-0"
                    >
                      {hasPrice ? (
                        <>
                          <div
                            className={`font-mono font-bold text-sm ${
                              isCurrent ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            ${item.price?.toFixed(2)}
                          </div>
                          <div
                            className={`flex items-center justify-end gap-0.5 text-[11px] font-mono font-semibold mt-0.5 ${
                              isPositive
                                ? isCurrent
                                  ? 'text-emerald-400'
                                  : 'text-emerald-600'
                                : isCurrent
                                ? 'text-rose-400'
                                : 'text-rose-600'
                            }`}
                          >
                            {isPositive ? (
                              <TrendingUp className="w-3 h-3 shrink-0" />
                            ) : (
                              <TrendingDown className="w-3 h-3 shrink-0" />
                            )}
                            <span>
                              {isPositive ? '+' : ''}
                              {item.changePercent !== undefined
                                ? `${item.changePercent.toFixed(2)}%`
                                : '$' + item.change?.toFixed(2)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Tracking...</span>
                      )}
                    </div>

                    {/* Remove Action */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromWatchlist(item.symbol);
                      }}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer shrink-0 ml-1 ${
                        isCurrent
                          ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title={`Remove ${item.symbol} from favorites`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-slate-500">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Your Watchlist is Empty
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Star companies or use the search above to add your favorite stocks for instant monitoring.
              </p>

              {/* Starter Presets */}
              <div className="text-left bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Suggested Favorites:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {defaultStarterSuggestions.map((s) => (
                    <button
                      key={s.symbol}
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-xs font-mono font-bold text-slate-800 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-slate-400" />
                      <span>{s.symbol}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Status & Timestamp */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isRefreshing ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'
              }`}
            />
            <span>{isRefreshing ? 'Updating quotes...' : 'Live Quotes Active'}</span>
          </div>

          {lastUpdated && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Clock className="w-3 h-3" />
              <span>{new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
