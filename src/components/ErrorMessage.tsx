import React, { useEffect, useState } from 'react';
import { AlertCircle, RotateCcw, Clock } from 'lucide-react';

interface ErrorMessageProps {
  error: string;
  onRetry: () => void;
  onSelectSample?: (ticker: string) => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
}) => {
  const isRateLimit =
    error.toLowerCase().includes('rate limit') ||
    error.toLowerCase().includes('quota') ||
    error.toLowerCase().includes('429');

  const [countdown, setCountdown] = useState<number | null>(isRateLimit ? 10 : null);

  useEffect(() => {
    if (!isRateLimit) return;
    setCountdown(10);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          onRetry();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [error, isRateLimit]);

  return (
    <div className="max-w-2xl mx-auto my-12 p-6 sm:p-8 bg-rose-50/70 border border-rose-200 rounded-xl shadow-xs">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-bold text-rose-950 uppercase tracking-wide">
            {isRateLimit ? 'AI Model Quota Cooldown' : 'Unable to Complete Market Analysis'}
          </h3>
          <p className="mt-1 text-xs text-rose-800 leading-relaxed font-normal">
            {error || "We couldn't find usable market data for this ticker. Check the symbol and try again."}
          </p>

          {isRateLimit && countdown !== null && (
            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-rose-900 bg-rose-100/70 p-2.5 rounded-lg border border-rose-200">
              <Clock className="w-4 h-4 animate-spin text-rose-700" />
              <span>Auto-retrying request in <strong>{countdown}s</strong>...</span>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-900 hover:bg-rose-950 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isRateLimit ? 'Retry Now' : 'Retry Request'}</span>
            </button>
            <span className="text-xs text-rose-700">
              Use the live search bar above to search by company name or ticker symbol.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
