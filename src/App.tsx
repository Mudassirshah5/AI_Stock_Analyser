/**
 * ============================================================================
 * AI Stock Analyzer — Client Application Root (App.tsx)
 * ============================================================================
 * Orchestrates application state and coordinates user interactions:
 *   - Search and NASDAQ constituent selection
 *   - Analysis execution across 7 timeframes (1D to 5Y)
 *   - Interactive SVG charting with real-time target price lines
 *   - Persistent Favorites Watchlist with 30s background price polling
 *   - Dynamic target price breach banners
 *   - Educational methodology and full 15-point research dossier modals
 */

import React, { useEffect, useState } from 'react';
import { AnalysisPayload, AnalysisPeriod } from './types/stock';
import { Header } from './components/Header';
import { SearchControls } from './components/SearchControls';
import { LoadingStages } from './components/LoadingStages';
import { QuickAssessmentCard } from './components/QuickAssessmentCard';
import { EvidenceColumns } from './components/EvidenceColumns';
import { ReasoningTrace } from './components/ReasoningTrace';
import { PriceChart } from './components/PriceChart';
import { MarketDataTable } from './components/MarketDataTable';
import { FundamentalsSection } from './components/FundamentalsSection';
import { NewsSection } from './components/NewsSection';
import { EducationalDrawer } from './components/EducationalDrawer';
import { FullReportModal } from './components/FullReportModal';
import { ErrorMessage } from './components/ErrorMessage';
import { TargetPriceBanner } from './components/TargetPriceBanner';
import { TargetPriceCard, TargetPriceSetting } from './components/TargetPriceCard';
import { WatchlistSidebar } from './components/WatchlistSidebar';
import { WatchlistFloatingButton } from './components/WatchlistFloatingButton';
import { WatchlistItem } from './types/watchlist';
import { AlertCircle, ShieldAlert } from 'lucide-react';

const STORAGE_KEY_TARGETS = 'ai_stock_analyzer_target_prices';
const STORAGE_KEY_WATCHLIST = 'ai_stock_analyzer_watchlist';

const DEFAULT_WATCHLIST: WatchlistItem[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', addedAt: new Date().toISOString() },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', addedAt: new Date().toISOString() },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', addedAt: new Date().toISOString() },
  { symbol: 'BLK', name: 'BlackRock, Inc.', exchange: 'NYSE', addedAt: new Date().toISOString() },
  { symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ', addedAt: new Date().toISOString() },
];

export default function App() {
  const [ticker, setTicker] = useState('AAPL');
  const [period, setPeriod] = useState<AnalysisPeriod>('1M');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<AnalysisPayload | null>(null);

  // Watchlist & Favorites state
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WATCHLIST);
      return saved ? JSON.parse(saved) : DEFAULT_WATCHLIST;
    } catch {
      return DEFAULT_WATCHLIST;
    }
  });
  const [isRefreshingQuotes, setIsRefreshingQuotes] = useState(false);
  const [lastQuotesUpdated, setLastQuotesUpdated] = useState<string | null>(null);

  // Save watchlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WATCHLIST, JSON.stringify(watchlist));
    } catch (e) {
      console.warn('Failed to save watchlist to localStorage:', e);
    }
  }, [watchlist]);

  // Batch quotes refresh for real-time price monitoring
  const refreshWatchlistQuotes = async () => {
    if (watchlist.length === 0) return;
    setIsRefreshingQuotes(true);
    try {
      const symbols = watchlist.map((w) => w.symbol).join(',');
      const res = await fetch(`/api/batch-quotes?symbols=${encodeURIComponent(symbols)}`);
      if (res.ok) {
        const quotes: Array<{
          symbol: string;
          price: number;
          previousClose: number;
          change: number;
          changePercent: number;
          currency: string;
          updatedAt: string;
        }> = await res.json();

        const quoteMap = new Map(quotes.map((q) => [q.symbol.toUpperCase(), q]));

        setWatchlist((prev) =>
          prev.map((item) => {
            const q = quoteMap.get(item.symbol.toUpperCase());
            if (!q) return item;
            return {
              ...item,
              price: q.price,
              previousClose: q.previousClose,
              change: q.change,
              changePercent: q.changePercent,
              currency: q.currency,
              updatedAt: q.updatedAt,
            };
          })
        );
        setLastQuotesUpdated(new Date().toISOString());
      }
    } catch (err) {
      console.warn('Failed to refresh watchlist quotes:', err);
    } finally {
      setIsRefreshingQuotes(false);
    }
  };

  // Initial quotes refresh on mount
  useEffect(() => {
    refreshWatchlistQuotes();
  }, []);

  // Poll quotes every 30 seconds when watchlist is open
  useEffect(() => {
    if (!isWatchlistOpen) return;
    refreshWatchlistQuotes();
    const interval = setInterval(refreshWatchlistQuotes, 30000);
    return () => clearInterval(interval);
  }, [isWatchlistOpen]);

  const handleAddToWatchlist = async (item: { symbol: string; name: string; exchange?: string }) => {
    const sym = item.symbol.toUpperCase();
    if (watchlist.some((w) => w.symbol.toUpperCase() === sym)) return;

    const newItem: WatchlistItem = {
      symbol: sym,
      name: item.name || sym,
      exchange: item.exchange,
      addedAt: new Date().toISOString(),
    };

    setWatchlist((prev) => [newItem, ...prev]);

    // Fetch quote for the new item
    try {
      const res = await fetch(`/api/batch-quotes?symbols=${encodeURIComponent(sym)}`);
      if (res.ok) {
        const [q] = await res.json();
        if (q) {
          setWatchlist((prev) =>
            prev.map((w) =>
              w.symbol.toUpperCase() === sym
                ? {
                    ...w,
                    price: q.price,
                    previousClose: q.previousClose,
                    change: q.change,
                    changePercent: q.changePercent,
                    currency: q.currency,
                    updatedAt: q.updatedAt,
                  }
                : w
            )
          );
        }
      }
    } catch (err) {
      console.warn('Failed to fetch quote for new favorite:', err);
    }
  };

  const handleRemoveFromWatchlist = (symbol: string) => {
    setWatchlist((prev) => prev.filter((w) => w.symbol.toUpperCase() !== symbol.toUpperCase()));
  };

  const handleToggleCurrentFavorite = () => {
    if (!payload?.marketData.ticker) return;
    const currentSym = payload.marketData.ticker.toUpperCase();
    const isFav = watchlist.some((w) => w.symbol.toUpperCase() === currentSym);
    if (isFav) {
      handleRemoveFromWatchlist(currentSym);
    } else {
      handleAddToWatchlist({
        symbol: currentSym,
        name: payload.marketData.companyName,
        exchange: payload.marketData.exchange,
      });
    }
  };

  const isCurrentFavorite = payload
    ? watchlist.some((w) => w.symbol.toUpperCase() === payload.marketData.ticker.toUpperCase())
    : false;

  // Local state for target prices per ticker
  const [targets, setTargets] = useState<{ [ticker: string]: TargetPriceSetting }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TARGETS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save to localStorage when targets state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TARGETS, JSON.stringify(targets));
    } catch (e) {
      console.warn('Failed to save target prices to localStorage:', e);
    }
  }, [targets]);

  // Modals
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isEducationOpen, setIsEducationOpen] = useState(false);

  const handleSaveTarget = (setting: TargetPriceSetting) => {
    if (!payload?.marketData.ticker) return;
    setTargets((prev) => ({
      ...prev,
      [payload.marketData.ticker]: setting,
    }));
  };

  const handleClearTarget = () => {
    if (!payload?.marketData.ticker) return;
    setTargets((prev) => {
      const updated = { ...prev };
      delete updated[payload.marketData.ticker];
      return updated;
    });
  };

  const handleDismissBanner = () => {
    if (!payload?.marketData.ticker) return;
    setTargets((prev) => {
      const current = prev[payload.marketData.ticker];
      if (!current) return prev;
      return {
        ...prev,
        [payload.marketData.ticker]: {
          ...current,
          isDismissed: true,
        },
      };
    });
  };

  const handleScrollToTargetCard = () => {
    const el = document.getElementById('target-price-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Check if target price threshold is crossed for currently displayed stock
  const currentTickerTarget = payload ? targets[payload.marketData.ticker] || null : null;
  const isTargetTriggered =
    payload &&
    currentTickerTarget &&
    !currentTickerTarget.isDismissed &&
    ((currentTickerTarget.condition === 'above' &&
      payload.marketData.latestPrice >= currentTickerTarget.targetPrice) ||
      (currentTickerTarget.condition === 'below' &&
        payload.marketData.latestPrice <= currentTickerTarget.targetPrice));

  const runAnalysis = async (targetTicker: string, targetPeriod: AnalysisPeriod) => {
    setIsLoading(true);
    setError(null);
    setTicker(targetTicker);
    setPeriod(targetPeriod);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: targetTicker, period: targetPeriod }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            `We couldn't find usable market data for "${targetTicker}". Check the symbol and try again.`
        );
      }

      setPayload(data);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setError(
        err.message ||
          "We couldn't find usable market data for this ticker. Check the symbol and try again."
      );
      setPayload(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial analysis on first load
  useEffect(() => {
    runAnalysis('AAPL', '1M');
  }, []);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white antialiased">
      {/* 1. Header */}
      <Header
        onOpenEducation={() => setIsEducationOpen(true)}
        onOpenWatchlist={() => setIsWatchlistOpen(true)}
        watchlistCount={watchlist.length}
      />

      {/* 2. Search & Controls */}
      <SearchControls
        onAnalyze={runAnalysis}
        isLoading={isLoading}
        currentTicker={ticker}
        currentPeriod={period}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading Sequential State */}
        {isLoading && <LoadingStages ticker={ticker} />}

        {/* Error State */}
        {!isLoading && error && (
          <ErrorMessage
            error={error}
            onRetry={() => runAnalysis(ticker, period)}
            onSelectSample={(sym) => runAnalysis(sym, period)}
          />
        )}

        {/* Successful Analysis Results */}
        {!isLoading && !error && payload && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Target Price Reached Alert Banner */}
            {isTargetTriggered && currentTickerTarget && (
              <TargetPriceBanner
                ticker={payload.marketData.ticker}
                currentPrice={payload.marketData.latestPrice}
                targetPrice={currentTickerTarget.targetPrice}
                condition={currentTickerTarget.condition}
                currency={payload.marketData.currency}
                onDismiss={handleDismissBanner}
                onEditTarget={handleScrollToTargetCard}
              />
            )}

            {/* A. Quick Assessment Card */}
            <QuickAssessmentCard
              payload={payload}
              onOpenReport={() => setIsReportOpen(true)}
              onOpenEducation={() => setIsEducationOpen(true)}
              isFavorite={isCurrentFavorite}
              onToggleFavorite={handleToggleCurrentFavorite}
            />

            {/* Target Price Alert Configuration & Monitor */}
            <TargetPriceCard
              ticker={payload.marketData.ticker}
              currentPrice={payload.marketData.latestPrice}
              currency={payload.marketData.currency}
              targetSetting={currentTickerTarget}
              onSaveTarget={handleSaveTarget}
              onClearTarget={handleClearTarget}
            />

            {/* B. Evidence Behind the Assessment (Two Columns + Contradictions) */}
            <EvidenceColumns assessment={payload.aiAssessment} />

            {/* C. Trace & Reasoning Pipeline */}
            <ReasoningTrace payload={payload} />

            {/* D. Interactive Price Chart */}
            <PriceChart
              history={payload.history}
              ticker={payload.marketData.ticker}
              currency={payload.marketData.currency}
              period={payload.period}
              targetPrice={currentTickerTarget?.targetPrice}
            />

            {/* E. Market Data Table with Provenance */}
            <MarketDataTable payload={payload} />

            {/* F. Fundamentals Section */}
            <FundamentalsSection
              fundamentals={payload.fundamentals}
              marketData={payload.marketData}
            />

            {/* G. Recent Headlines (News) */}
            <NewsSection news={payload.news} />

            {/* H. Missing Information & System Limitations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                  <AlertCircle className="w-4 h-4 text-slate-500" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Missing Information Disclosures
                  </h4>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                  {payload.aiAssessment.missing_information.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                  <ShieldAlert className="w-4 h-4 text-slate-500" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Analytical Limitations
                  </h4>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                  {payload.aiAssessment.limitations.map((l, idx) => (
                    <li key={idx}>{l}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            AI Stock Analyzer · Built for educational &amp; research inquiry. Not financial advice.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsEducationOpen(true)}
              className="hover:text-slate-900 transition-colors underline cursor-pointer"
            >
              Methodology &amp; Disclaimers
            </button>
            <span aria-hidden="true">·</span>
            <span>Real market data via public yfinance endpoints</span>
          </div>
        </div>
      </footer>

      {/* Modals & Slide-out Drawers */}
      {payload && (
        <FullReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          payload={payload}
        />
      )}

      <EducationalDrawer
        isOpen={isEducationOpen}
        onClose={() => setIsEducationOpen(false)}
      />

      {/* Favorites Watchlist Slide-out Sidebar */}
      <WatchlistSidebar
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchlist={watchlist}
        currentTicker={payload?.marketData.ticker || ticker}
        onSelectTicker={(selectedSym) => {
          runAnalysis(selectedSym, period);
          // On small screens, close the sidebar after selection for quick viewing
          if (window.innerWidth < 768) {
            setIsWatchlistOpen(false);
          }
        }}
        onAddToWatchlist={handleAddToWatchlist}
        onRemoveFromWatchlist={handleRemoveFromWatchlist}
        onRefreshQuotes={refreshWatchlistQuotes}
        isRefreshing={isRefreshingQuotes}
        lastUpdated={lastQuotesUpdated}
      />

      {/* Floating Watchlist Button */}
      <WatchlistFloatingButton
        count={watchlist.length}
        isOpen={isWatchlistOpen}
        onClick={() => setIsWatchlistOpen((prev) => !prev)}
      />
    </div>
  );
}
