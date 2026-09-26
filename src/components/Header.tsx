import React from 'react';
import { Activity, ShieldAlert, BookOpen, Star } from 'lucide-react';

interface HeaderProps {
  onOpenEducation: () => void;
  onOpenWatchlist?: () => void;
  watchlistCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenEducation,
  onOpenWatchlist,
  watchlistCount = 0,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                AI Stock Analyzer
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Evidence-based stock analysis powered by real market data and Gemini.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {onOpenWatchlist && (
              <button
                type="button"
                onClick={onOpenWatchlist}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 hover:text-slate-950 bg-white hover:bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-md transition-colors cursor-pointer shadow-2xs"
                title="View favorite stock tickers"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>Watchlist</span>
                <span className="ml-0.5 text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-full border border-slate-200">
                  {watchlistCount}
                </span>
              </button>
            )}

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50/80 border border-amber-200/80 px-3 py-1.5 rounded-md">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span>Educational &amp; research tool — not financial advice</span>
            </div>

            <button
              onClick={onOpenEducation}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/70 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
              title="Methodology and Understanding the Assessment"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Methodology</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

