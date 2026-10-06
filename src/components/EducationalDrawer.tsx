import React from 'react';
import { X, BookOpen, HelpCircle, Shield, CheckCircle2 } from 'lucide-react';

interface EducationalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EducationalDrawer: React.FC<EducationalDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Educational Transparency &amp; Methodology
              </h2>
              <p className="text-xs text-slate-500">
                Understanding how signals, percentages, and AI reasoning work
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-sm text-slate-700 leading-relaxed max-h-[75vh] overflow-y-auto">
          {/* Question 1 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>What does the percentage mean?</span>
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed font-normal">
              The <strong>BUY / SELL percentages</strong> represent the AI&apos;s relative assessment
              of the supplied evidence. They are <strong>not statistically validated probabilities</strong> of
              future price movement.
            </p>
            <p className="text-xs text-slate-600 mt-2">
              For example, <em>BUY 68% / SELL 32%</em> means that given the available price trends,
              volume metrics, and valuation indicators, the weight of the evidence leans predominantly
              toward positive signals over risk signals. It does <em>not</em> mean the stock has a 68%
              chance of increasing.
            </p>
          </div>

          {/* Question 2 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-sky-600" />
              <span>What does Evidence Quality mean?</span>
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed font-normal">
              <strong>Evidence Quality (HIGH / MODERATE / LOW)</strong> describes how complete and
              reliable the information available to the analysis is. It is strictly separate from the
              BUY/SELL assessment.
            </p>
            <ul className="mt-2 space-y-1 text-xs text-slate-600 list-disc list-inside">
              <li><strong>HIGH:</strong> Complete price history, key fundamentals (P/E, Market Cap), and multiple news headlines present.</li>
              <li><strong>MODERATE:</strong> Standard market data available, but some secondary metrics or filings were unsupplied.</li>
              <li><strong>LOW:</strong> Limited trading history, missing valuation metrics, or no recent news coverage.</li>
            </ul>
          </div>

          {/* Question 3 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-amber-600" />
              <span>What does the disclaimer mean?</span>
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed font-normal">
              This tool provides <strong>educational analysis</strong>, not personalized financial
              advice. Market outcomes are inherently uncertain, past performance does not guarantee
              future returns, and the final investment decision belongs exclusively to the user.
            </p>
          </div>

          {/* Transparent Scoring Methodology */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Heuristic Evidence Model
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded bg-emerald-50/60 border border-emerald-100">
                <span className="font-bold text-emerald-900 block mb-1">BUY-Supporting Signals</span>
                <ul className="space-y-1 text-slate-700">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Positive period return &amp; momentum</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Price above moving averages (SMA 20/50)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Confirming trading volume</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Reasonable or modest valuation (P/E)</span>
                  </li>
                </ul>
              </div>

              <div className="p-2.5 rounded bg-rose-50/60 border border-rose-100">
                <span className="font-bold text-rose-900 block mb-1">SELL-Supporting Signals</span>
                <ul className="space-y-1 text-slate-700">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Negative period return &amp; downward trend</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Price below key moving averages</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Elevated valuation multiples</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Elevated annualized volatility / risk</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
