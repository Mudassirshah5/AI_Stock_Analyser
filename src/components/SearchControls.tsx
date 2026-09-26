import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, Building2, ChevronRight, Check } from 'lucide-react';
import { AnalysisPeriod } from '../types/stock';

interface SearchControlsProps {
  onAnalyze: (ticker: string, period: AnalysisPeriod) => void;
  isLoading: boolean;
  currentTicker: string;
  currentPeriod: AnalysisPeriod;
}

export interface SearchResultItem {
  symbol: string;
  name: string;
  exchange: string;
  quoteType: string;
  isNasdaq: boolean;
}

const PERIODS: { id: AnalysisPeriod; label: string }[] = [
  { id: '1D', label: '1D' },
  { id: '5D', label: '5D' },
  { id: '1M', label: '1M' },
  { id: '3M', label: '3M' },
  { id: '6M', label: '6M' },
  { id: '1Y', label: '1Y' },
  { id: '5Y', label: '5Y' },
];

export const SearchControls: React.FC<SearchControlsProps> = ({
  onAnalyze,
  isLoading,
  currentTicker,
  currentPeriod,
}) => {
  const [tickerInput, setTickerInput] = useState(currentTicker || 'AAPL');
  const [period, setPeriod] = useState<AnalysisPeriod>(currentPeriod || '1M');

  // Autocomplete search state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [nasdaqOnly, setNasdaqOnly] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync props
  useEffect(() => {
    if (currentTicker) setTickerInput(currentTicker);
  }, [currentTicker]);

  useEffect(() => {
    if (currentPeriod) setPeriod(currentPeriod);
  }, [currentPeriod]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search results with debouncing
  useEffect(() => {
    if (!isDropdownOpen) return;

    const trimmed = tickerInput.trim();
    let isCancelled = false;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const queryParam = encodeURIComponent(trimmed);
        const url = `/api/search?q=${queryParam}&nasdaq=${nasdaqOnly}`;
        const res = await fetch(url);
        if (res.ok && !isCancelled) {
          const data: SearchResultItem[] = await res.json();
          setSearchResults(data);
          setSelectedIndex(-1);
        }
      } catch (err) {
        console.warn('Search query failed:', err);
      } finally {
        if (!isCancelled) setIsSearching(false);
      }
    }, 180);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [tickerInput, nasdaqOnly, isDropdownOpen]);

  const handleSelectResult = (item: SearchResultItem) => {
    setTickerInput(item.symbol);
    setIsDropdownOpen(false);
    onAnalyze(item.symbol, period);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (selectedIndex >= 0 && searchResults[selectedIndex]) {
      handleSelectResult(searchResults[selectedIndex]);
      return;
    }

    if (!tickerInput.trim()) return;
    setIsDropdownOpen(false);
    onAnalyze(tickerInput.trim().toUpperCase(), period);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectResult(searchResults[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  const handlePeriodChange = (p: AnalysisPeriod) => {
    if (isLoading || p === period) return;
    setPeriod(p);
    if (tickerInput.trim()) {
      onAnalyze(tickerInput.trim().toUpperCase(), p);
    }
  };

  const handleClear = () => {
    setTickerInput('');
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <section className="bg-white border-b border-slate-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          {/* Autocomplete Ticker & Company Search Box */}
          <div ref={containerRef} className="relative flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </div>

              <input
                ref={inputRef}
                type="text"
                value={tickerInput}
                onChange={(e) => {
                  setTickerInput(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder="Search every company on NASDAQ & global markets (e.g. Apple, NVDA, Microsoft, BLK)..."
                disabled={isLoading}
                autoComplete="off"
                className="w-full pl-11 pr-20 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 font-medium tracking-wide focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors disabled:bg-slate-100 disabled:text-slate-500 text-sm"
              />

              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
                {isSearching && (
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                )}
                {tickerInput && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Live Autocomplete Results Dropdown */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in-50 duration-150">
                {/* Dropdown Header & Filter Tabs */}
                <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Company Search</span>
                    <span className="text-[11px] font-normal text-slate-500">
                      ({searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'})
                    </span>
                  </div>

                  {/* Filter Toggle: All vs NASDAQ Only */}
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setNasdaqOnly(false)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                        !nasdaqOnly
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All Markets
                    </button>
                    <button
                      type="button"
                      onClick={() => setNasdaqOnly(true)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                        nasdaqOnly
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-indigo-600'
                      }`}
                    >
                      NASDAQ Only
                    </button>
                  </div>
                </div>

                {/* Results List */}
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {searchResults.length > 0 ? (
                    searchResults.map((item, index) => {
                      const isSelected = selectedIndex === index;
                      const isCurrent =
                        item.symbol.toUpperCase() === currentTicker.toUpperCase();

                      return (
                        <div
                          key={`${item.symbol}-${index}`}
                          onClick={() => handleSelectResult(item)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`px-4 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-slate-100 text-slate-900'
                              : 'hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="font-mono font-bold text-sm text-slate-900 w-16 shrink-0">
                              {item.symbol}
                            </span>
                            <span className="text-xs text-slate-600 truncate font-medium">
                              {item.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {item.isNasdaq ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                                NASDAQ
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                                {item.exchange}
                              </span>
                            )}

                            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                              {item.quoteType}
                            </span>

                            {isCurrent ? (
                              <Check className="w-4 h-4 text-emerald-600 ml-1" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-300" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-500">
                      {isSearching ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                          <span>Searching companies...</span>
                        </div>
                      ) : (
                        <span>
                          No companies found matching &ldquo;{tickerInput}&rdquo;. Try another company name or ticker.
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer hint */}
                <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Use ↑ and ↓ arrows to navigate, Enter to select</span>
                  <span className="font-medium text-slate-500">Instant Market Resolution</span>
                </div>
              </div>
            )}
          </div>

          {/* Analysis Period Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start lg:self-auto border border-slate-200 shrink-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 select-none">
              Period:
            </span>
            {PERIODS.map((p) => {
              const isActive = period === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePeriodChange(p.id)}
                  disabled={isLoading}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading || !tickerInput.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-medium text-sm rounded-lg shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                <span>Analyzing Evidence...</span>
              </>
            ) : (
              <span>Analyze Evidence</span>
            )}
          </button>
        </form>
      </div>
    </section>
  );
};
