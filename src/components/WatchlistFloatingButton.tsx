import React from 'react';
import { Star } from 'lucide-react';

interface WatchlistFloatingButtonProps {
  count: number;
  isOpen: boolean;
  onClick: () => void;
}

export const WatchlistFloatingButton: React.FC<WatchlistFloatingButtonProps> = ({
  count,
  isOpen,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Toggle Favorites Watchlist"
      className={`fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full shadow-xl transition-all cursor-pointer select-none group border ${
        isOpen
          ? 'bg-slate-900 text-white border-slate-700 ring-2 ring-slate-900/20'
          : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 hover:shadow-2xl hover:scale-105 active:scale-95'
      }`}
    >
      <div className="relative">
        <Star
          className={`w-4 h-4 transition-transform group-hover:rotate-12 ${
            count > 0
              ? 'fill-amber-400 text-amber-500'
              : 'text-slate-400'
          }`}
        />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" />
        )}
      </div>

      <span className="text-xs font-bold tracking-tight">Watchlist</span>

      <span
        className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
          isOpen
            ? 'bg-slate-800 text-slate-200'
            : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
        }`}
      >
        {count}
      </span>
    </button>
  );
};
