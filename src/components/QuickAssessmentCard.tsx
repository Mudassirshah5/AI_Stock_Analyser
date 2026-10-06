import React from 'react';
import {
  ShieldCheck,
  Info,
  Calendar,
  Database,
  FileText,
  Clock,
  TrendingUp,
  TrendingDown,
  Star,
} from 'lucide-react';
import { AnalysisPayload } from '../types/stock';

interface QuickAssessmentCardProps {
  payload: AnalysisPayload;
  onOpenReport: () => void;
  onOpenEducation: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const QuickAssessmentCard: React.FC<QuickAssessmentCardProps> = ({
  payload,
  onOpenReport,
  onOpenEducation,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const { marketData, aiAssessment, period, timestamp } = payload;
  const isBuy = aiAssessment.primary_assessment === 'BUY';

  // Format date
  const formattedTime = new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const qualityColor =
    aiAssessment.evidence_quality === 'HIGH'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : aiAssessment.evidence_quality === 'LOW'
      ? 'text-amber-800 bg-amber-50 border-amber-200'
      : 'text-sky-800 bg-sky-50 border-sky-200';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8 shadow-xs">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl font-black tracking-tight text-slate-950 font-mono">
              {marketData.ticker}
            </span>

            {onToggleFavorite && (
              <button
                type="button"
                onClick={onToggleFavorite}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isFavorite
                    ? 'bg-amber-50 text-amber-500 border-amber-300 hover:bg-amber-100'
                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700 hover:bg-slate-100'
                }`}
                title={isFavorite ? 'Remove from favorites watchlist' : 'Save to favorites watchlist'}
              >
                <Star
                  className={`w-4 h-4 transition-transform active:scale-125 ${
                    isFavorite ? 'fill-amber-400 text-amber-500' : ''
                  }`}
                />
              </button>
            )}

            <span className="text-slate-400">·</span>
            <span className="text-base font-semibold text-slate-700 truncate max-w-xs sm:max-w-md">
              {marketData.companyName}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
            <span>{marketData.exchange}</span>
            <span aria-hidden="true">·</span>
            <span>Currency: {marketData.currency}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3 text-slate-400" />
              <span>Data source: yfinance</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Retrieved: {formattedTime}</span>
            </span>
          </div>
        </div>

        <button
          onClick={onOpenReport}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <FileText className="w-3.5 h-3.5 text-slate-300" />
          <span>Generate Full Report</span>
        </button>
      </div>

      {/* Primary Assessment Showcase */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Assessment Card & Big Numbers */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              AI Assessment
            </span>
            <div
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded border ${qualityColor}`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Evidence Quality: {aiAssessment.evidence_quality}</span>
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block uppercase">
                Primary Assessment
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                {isBuy ? (
                  <TrendingUp className="w-7 h-7 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-7 h-7 text-rose-600" />
                )}
                <span
                  className={`text-4xl font-extrabold tracking-tight ${
                    isBuy ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {aiAssessment.primary_assessment}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-medium text-slate-500 block">Period</span>
              <span className="text-base font-bold text-slate-800 font-mono">
                {period}
              </span>
            </div>
          </div>

          {/* Buy vs Sell Distribution Display */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs font-mono font-bold mb-1.5">
              <span className="text-emerald-700">BUY {aiAssessment.buy_percentage}%</span>
              <span className="text-slate-400">vs</span>
              <span className="text-rose-700">SELL {aiAssessment.sell_percentage}%</span>
            </div>

            {/* Split Distribution Bar */}
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${aiAssessment.buy_percentage}%` }}
                className="bg-emerald-600 transition-all duration-500"
                title={`BUY ${aiAssessment.buy_percentage}%`}
              />
              <div
                style={{ width: `${aiAssessment.sell_percentage}%` }}
                className="bg-rose-600 transition-all duration-500"
                title={`SELL ${aiAssessment.sell_percentage}%`}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>Assessment Distribution</span>
              <button
                onClick={onOpenEducation}
                className="text-slate-600 hover:text-slate-900 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
              >
                <Info className="w-3 h-3" />
                <span>What does this mean?</span>
              </button>
            </div>
          </div>
        </div>

        {/* Executive Summary & Evidence Disclaimer */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-2">
              Reasoning Summary
            </h3>
            <p className="text-sm text-slate-800 leading-relaxed font-normal bg-white p-4 rounded-lg border border-slate-200/80">
              {aiAssessment.assessment_summary}
            </p>
          </div>

          {/* Critical Statistical Probability Disclaimer */}
          <div className="mt-4 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-900 leading-normal">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-amber-950">Important:</strong>{' '}
                These percentages represent the model&apos;s relative assessment between{' '}
                <span className="font-semibold">BUY</span> and{' '}
                <span className="font-semibold">SELL</span> based only on the supplied
                evidence. They are <em>not</em> statistically validated probabilities of future
                price movement.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
