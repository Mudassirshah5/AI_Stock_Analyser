import React from 'react';
import { AnalysisPayload } from '../types/stock';

interface MarketDataTableProps {
  payload: AnalysisPayload;
}

export const MarketDataTable: React.FC<MarketDataTableProps> = ({ payload }) => {
  const { marketData, calculations } = payload;

  const rows: Array<{
    metric: string;
    value: string;
    type: 'Source data' | 'Calculated';
    note?: string;
  }> = [
    {
      metric: 'Latest Price',
      value: `$${marketData.latestPrice.toFixed(2)}`,
      type: 'Source data',
      note: 'Most recent trade/close price',
    },
    {
      metric: 'Starting Price (Period)',
      value: `$${calculations.startingPrice.toFixed(2)}`,
      type: 'Source data',
      note: 'First observation in selected period',
    },
    {
      metric: 'Period Return',
      value: `${calculations.periodReturnPercent >= 0 ? '+' : ''}${calculations.periodReturnPercent}%`,
      type: 'Calculated',
      note: '((Latest - Starting) / Starting) * 100',
    },
    {
      metric: 'Period High',
      value: `$${calculations.periodHigh.toFixed(2)}`,
      type: 'Source data',
      note: 'Highest trade within period',
    },
    {
      metric: 'Period Low',
      value: `$${calculations.periodLow.toFixed(2)}`,
      type: 'Source data',
      note: 'Lowest trade within period',
    },
    {
      metric: 'Latest Volume',
      value: `${(calculations.latestVolume / 1_000_000).toFixed(2)}M`,
      type: 'Source data',
      note: 'Shares traded in last session',
    },
    {
      metric: 'Average Volume (Period)',
      value: `${(calculations.averageVolume / 1_000_000).toFixed(2)}M`,
      type: 'Calculated',
      note: 'Mean daily volume across period',
    },
    {
      metric: 'Volume Delta vs Avg',
      value: `${calculations.volumeDiffPercent >= 0 ? '+' : ''}${calculations.volumeDiffPercent}%`,
      type: 'Calculated',
      note: 'Comparison against period average',
    },
    {
      metric: '52-Week High',
      value: marketData.fiftyTwoWeekHigh ? `$${marketData.fiftyTwoWeekHigh.toFixed(2)}` : 'Not available',
      type: 'Source data',
    },
    {
      metric: '52-Week High Distance',
      value:
        calculations.fiftyTwoWeekHighDistancePercent !== null
          ? `${calculations.fiftyTwoWeekHighDistancePercent}%`
          : 'Not available',
      type: 'Calculated',
      note: 'Distance below 52-week peak',
    },
    {
      metric: '52-Week Low',
      value: marketData.fiftyTwoWeekLow ? `$${marketData.fiftyTwoWeekLow.toFixed(2)}` : 'Not available',
      type: 'Source data',
    },
    {
      metric: '52-Week Low Distance',
      value:
        calculations.fiftyTwoWeekLowDistancePercent !== null
          ? `+${calculations.fiftyTwoWeekLowDistancePercent}%`
          : 'Not available',
      type: 'Calculated',
      note: 'Distance above 52-week trough',
    },
    {
      metric: '20-Period Moving Avg (SMA 20)',
      value: calculations.sma20 !== null ? `$${calculations.sma20.toFixed(2)}` : 'Insufficient history',
      type: 'Calculated',
    },
    {
      metric: 'Price vs SMA 20',
      value:
        calculations.priceVsSma20Percent !== null
          ? `${calculations.priceVsSma20Percent >= 0 ? '+' : ''}${calculations.priceVsSma20Percent}%`
          : 'Insufficient history',
      type: 'Calculated',
    },
    {
      metric: 'Annualized Historical Volatility',
      value:
        calculations.historicalVolatilityAnnualizedPercent !== null
          ? `${calculations.historicalVolatilityAnnualizedPercent}%`
          : 'Insufficient history',
      type: 'Calculated',
      note: 'Standard deviation of log returns * sqrt(252)',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Market Metrics &amp; Provenance
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Strict separation of factual source data from mathematical application calculations
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Metric</th>
              <th className="py-3 px-4 text-right">Value</th>
              <th className="py-3 px-4 text-center">Data Type</th>
              <th className="py-3 px-4">Description / Formula</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-900">{row.metric}</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-950">
                  {row.value}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide border ${
                      row.type === 'Source data'
                        ? 'bg-slate-100 text-slate-700 border-slate-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {row.type}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-500">{row.note || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
