import React, { useState } from 'react';
import { ChevronDown, ChevronRight, GitCommit, Layers, ArrowDown } from 'lucide-react';
import { AnalysisPayload } from '../types/stock';

interface ReasoningTraceProps {
  payload: AnalysisPayload;
}

export const ReasoningTrace: React.FC<ReasoningTraceProps> = ({ payload }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const { marketData, calculations, aiAssessment } = payload;

  const traceSteps = [
    {
      step: 1,
      title: 'Raw Market Evidence',
      summary: 'Sourced directly from live market feeds (yfinance)',
      content: (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-slate-500 block">Latest Price</span>
            <span className="font-mono font-bold text-slate-900">
              ${marketData.latestPrice.toFixed(2)}
            </span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-slate-500 block">Previous Close</span>
            <span className="font-mono font-bold text-slate-900">
              ${marketData.previousClose.toFixed(2)}
            </span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-slate-500 block">52-Week High</span>
            <span className="font-mono font-bold text-slate-900">
              {marketData.fiftyTwoWeekHigh ? `$${marketData.fiftyTwoWeekHigh.toFixed(2)}` : 'N/A'}
            </span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-slate-500 block">Latest Volume</span>
            <span className="font-mono font-bold text-slate-900">
              {(marketData.latestVolume / 1_000_000).toFixed(2)}M
            </span>
          </div>
        </div>
      ),
    },
    {
      step: 2,
      title: 'Calculated Signals',
      summary: 'Mathematical indicators computed by application code',
      content: (
        <div className="space-y-2">
          {aiAssessment.calculated_signals.map((sig, sIdx) => {
            const dirColor =
              sig.direction === 'positive'
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : sig.direction === 'negative'
                ? 'text-rose-700 bg-rose-50 border-rose-200'
                : 'text-slate-700 bg-slate-100 border-slate-200';

            return (
              <div
                key={sIdx}
                className="flex items-center justify-between p-2.5 rounded border border-slate-200 text-xs bg-white"
              >
                <div>
                  <span className="font-bold text-slate-900">{sig.name}</span>
                  <p className="text-slate-600 mt-0.5">{sig.evidence}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase shrink-0 ${dirColor}`}>
                  {sig.direction}
                </span>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      step: 3,
      title: 'Supporting BUY Evidence',
      summary: 'Metrics providing positive momentum or supportive valuation',
      content: (
        <ul className="space-y-1.5 text-xs text-slate-800">
          {aiAssessment.buy_supporting_evidence.map((item, bIdx) => (
            <li key={bIdx} className="flex items-start gap-2 bg-emerald-50/50 p-2 rounded border border-emerald-100">
              <span className="text-emerald-700 font-bold shrink-0">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      step: 4,
      title: 'Supporting SELL Evidence',
      summary: 'Metrics reflecting downward pressure, elevated valuation, or volatility',
      content: (
        <ul className="space-y-1.5 text-xs text-slate-800">
          {aiAssessment.sell_supporting_evidence.map((item, sIdx) => (
            <li key={sIdx} className="flex items-start gap-2 bg-rose-50/50 p-2 rounded border border-rose-100">
              <span className="text-rose-700 font-bold shrink-0">✕</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      step: 5,
      title: 'Contradictions & Signal Reconciliation',
      summary: 'Auditing conflicts where technical, fundamental, or news signals diverge',
      content: (
        <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs text-slate-700">
          {aiAssessment.contradictions && aiAssessment.contradictions.length > 0 ? (
            <ul className="space-y-1">
              {aiAssessment.contradictions.map((c, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="italic text-slate-500">
              Signals demonstrated directional coherence with minimal direct contradictions.
            </p>
          )}
        </div>
      ),
    },
    {
      step: 6,
      title: 'AI Interpretation',
      summary: 'Gemini synthesis of the complete evidence package',
      content: (
        <div className="bg-white p-3.5 rounded border border-slate-200 text-xs text-slate-800 leading-relaxed font-normal">
          {aiAssessment.assessment_summary}
        </div>
      ),
    },
    {
      step: 7,
      title: 'Final Assessment Distribution',
      summary: `Resulting distribution: BUY ${aiAssessment.buy_percentage}% / SELL ${aiAssessment.sell_percentage}%`,
      content: (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 text-white p-4 rounded-lg">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 block font-bold">
              Primary Output
            </span>
            <span className="text-xl font-extrabold text-white">
              {aiAssessment.primary_assessment}
            </span>
          </div>
          <div className="text-center sm:text-right">
            <span className="text-xs font-mono text-emerald-400 font-bold">
              BUY: {aiAssessment.buy_percentage}%
            </span>
            <span className="mx-2 text-slate-500">|</span>
            <span className="text-xs font-mono text-rose-400 font-bold">
              SELL: {aiAssessment.sell_percentage}%
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Evidence Quality: {aiAssessment.evidence_quality}
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-left group flex items-center gap-2 cursor-pointer"
          >
            <Layers className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">
              How Did the AI Reach This Assessment?
            </h2>
            {isOpen ? (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-400" />
            )}
          </button>
          <p className="text-xs text-slate-500 mt-1">
            Traceable step-by-step evidence pipeline — no hidden chain-of-thought or black-box guessing
          </p>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline underline-offset-2 cursor-pointer"
        >
          {isOpen ? 'Collapse Trace' : 'Expand Trace'}
        </button>
      </div>

      {isOpen && (
        <div className="mt-6 relative">
          <div className="space-y-4">
            {traceSteps.map((s, idx) => (
              <div key={s.step} className="relative">
                <div
                  onClick={() => setActiveStep(activeStep === s.step ? null : s.step)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    activeStep === s.step
                      ? 'border-slate-900 bg-slate-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold font-mono flex items-center justify-center shrink-0">
                        {s.step}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                          {s.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">{s.summary}</p>
                      </div>
                    </div>
                    <div className="text-slate-400">
                      {activeStep === s.step ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Step Detail */}
                  {activeStep === s.step && <div className="mt-4 pt-3 border-t border-slate-200/80">{s.content}</div>}
                </div>

                {/* Connector arrow between steps */}
                {idx < traceSteps.length - 1 && (
                  <div className="flex justify-center my-1">
                    <ArrowDown className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
