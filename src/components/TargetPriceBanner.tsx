import React from 'react';
import { BellRing, ArrowUpRight, ArrowDownRight, X, Edit3 } from 'lucide-react';

interface TargetPriceBannerProps {
  ticker: string;
  currentPrice: number;
  targetPrice: number;
  condition: 'above' | 'below';
  currency: string;
  onDismiss: () => void;
  onEditTarget: () => void;
}

export const TargetPriceBanner: React.FC<TargetPriceBannerProps> = ({
  ticker,
  currentPrice,
  targetPrice,
  condition,
  currency,
  onDismiss,
  onEditTarget,
}) => {
  const diff = currentPrice - targetPrice;
  const diffPercent = ((diff / targetPrice) * 100).toFixed(2);
  const isAbove = condition === 'above';

  return (
    <div className="bg-emerald-900 text-white rounded-xl p-4 sm:p-5 shadow-lg border border-emerald-700/80 animate-in slide-in-from-top-4 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <BellRing className="w-5 h-5 text-emerald-300 animate-pulse" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-xs uppercase tracking-wider bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded border border-emerald-700">
                {ticker} Target Price Reached
              </span>
              <span className="text-xs text-emerald-200/80">
                Threshold: {isAbove ? '≥' : '≤'} ${targetPrice.toFixed(2)}
              </span>
            </div>

            <p className="text-sm font-semibold text-white mt-1">
              Market price of <span className="font-mono text-emerald-300">${currentPrice.toFixed(2)} {currency}</span> has{' '}
              {isAbove ? 'risen above' : 'fallen below'} your threshold of{' '}
              <span className="font-mono">${targetPrice.toFixed(2)}</span>.
            </p>

            <div className="flex items-center gap-2 mt-1 text-xs text-emerald-200">
              {diff >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>
                Delta from target: <strong className="font-mono font-bold">{diff >= 0 ? `+$${diff.toFixed(2)}` : `-$${Math.abs(diff).toFixed(2)}`} ({diffPercent}%)</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
          <button
            onClick={onEditTarget}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 rounded-lg text-xs font-medium transition-colors cursor-pointer border border-emerald-600/50"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Adjust Target</span>
          </button>
          <button
            onClick={onDismiss}
            className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-800/80 rounded-lg transition-colors cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
