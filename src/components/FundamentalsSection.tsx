import React from 'react';
import { Building2, AlertCircle } from 'lucide-react';
import { Fundamentals, MarketDataSummary } from '../types/stock';

interface FundamentalsSectionProps {
  fundamentals: Fundamentals;
  marketData: MarketDataSummary;
}

export const FundamentalsSection: React.FC<FundamentalsSectionProps> = ({
  fundamentals,
  marketData,
}) => {
  const formatMarketCap = (cap: number | null) => {
    if (cap === null || cap === undefined) return 'Not available';
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toLocaleString()}`;
  };

  const items = [
    {
      label: 'Market Capitalization',
      value: formatMarketCap(fundamentals.marketCap),
      available: fundamentals.marketCap !== null,
    },
    {
      label: 'Trailing P/E Ratio',
      value: fundamentals.trailingPE !== null ? `${fundamentals.trailingPE}x` : 'Not available',
      available: fundamentals.trailingPE !== null,
    },
    {
      label: 'Forward P/E Ratio',
      value: fundamentals.forwardPE !== null ? `${fundamentals.forwardPE}x` : 'Not available',
      available: fundamentals.forwardPE !== null,
    },
    {
      label: 'Dividend Yield',
      value: fundamentals.dividendYield !== null ? `${fundamentals.dividendYield}%` : 'Not available',
      available: fundamentals.dividendYield !== null,
    },
    {
      label: '52-Week High',
      value: marketData.fiftyTwoWeekHigh !== null ? `$${marketData.fiftyTwoWeekHigh.toFixed(2)}` : 'Not available',
      available: marketData.fiftyTwoWeekHigh !== null,
    },
    {
      label: '52-Week Low',
      value: marketData.fiftyTwoWeekLow !== null ? `$${marketData.fiftyTwoWeekLow.toFixed(2)}` : 'Not available',
      available: marketData.fiftyTwoWeekLow !== null,
    },
    {
      label: '50-Day Moving Average',
      value: fundamentals.fiftyDayAverage !== null ? `$${fundamentals.fiftyDayAverage.toFixed(2)}` : 'Not available',
      available: fundamentals.fiftyDayAverage !== null,
    },
    {
      label: '200-Day Moving Average',
      value: fundamentals.twoHundredDayAverage !== null ? `$${fundamentals.twoHundredDayAverage.toFixed(2)}` : 'Not available',
      available: fundamentals.twoHundredDayAverage !== null,
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
        <Building2 className="w-5 h-5 text-slate-700" />
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Company Fundamentals
          </h3>
          <p className="text-xs text-slate-500">
            Factual balance sheet &amp; valuation metrics from market filings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((it, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border text-xs transition-colors ${
              it.available
                ? 'bg-slate-50/70 border-slate-200'
                : 'bg-amber-50/30 border-amber-200/60'
            }`}
          >
            <span className="text-slate-500 block text-[11px] mb-1">{it.label}</span>
            <div className="flex items-center gap-1.5">
              {!it.available && (
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              )}
              <span
                className={`font-mono font-bold truncate ${
                  it.available ? 'text-slate-900 text-sm' : 'text-slate-400 text-xs italic'
                }`}
              >
                {it.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11px] text-slate-500 italic">
        * Data integrity rule: Values marked &quot;Not available&quot; are absent from the provider feed and are never synthetic or interpolated.
      </p>
    </div>
  );
};
