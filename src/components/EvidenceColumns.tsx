import React from 'react';
import { PlusCircle, MinusCircle, AlertTriangle, Scale } from 'lucide-react';
import { AIAnalysisResult } from '../types/stock';

interface EvidenceColumnsProps {
  assessment: AIAnalysisResult;
}

export const EvidenceColumns: React.FC<EvidenceColumnsProps> = ({ assessment }) => {
  const { buy_supporting_evidence, sell_supporting_evidence, contradictions } = assessment;

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-slate-700" />
            <span>Evidence Behind the Assessment</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent comparison of factual data and calculated signals supporting each position
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BUY Supporting Evidence */}
        <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-emerald-200/60">
            <PlusCircle className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider">
              Evidence Supporting BUY ({buy_supporting_evidence.length})
            </h3>
          </div>

          {buy_supporting_evidence.length > 0 ? (
            <ul className="space-y-2.5">
              {buy_supporting_evidence.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-slate-800 leading-relaxed bg-white/90 p-3 rounded-lg border border-emerald-100 shadow-2xs"
                >
                  <span className="font-bold text-emerald-700 mt-0.5 shrink-0">+</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic p-3 bg-white/50 rounded-lg">
              No strong positive signals identified in the supplied dataset.
            </p>
          )}
        </div>

        {/* SELL Supporting Evidence */}
        <div className="border border-rose-200 bg-rose-50/40 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-rose-200/60">
            <MinusCircle className="w-4 h-4 text-rose-700" />
            <h3 className="text-sm font-bold text-rose-950 uppercase tracking-wider">
              Evidence Supporting SELL ({sell_supporting_evidence.length})
            </h3>
          </div>

          {sell_supporting_evidence.length > 0 ? (
            <ul className="space-y-2.5">
              {sell_supporting_evidence.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-slate-800 leading-relaxed bg-white/90 p-3 rounded-lg border border-rose-100 shadow-2xs"
                >
                  <span className="font-bold text-rose-700 mt-0.5 shrink-0">-</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic p-3 bg-white/50 rounded-lg">
              No strong negative or risk signals identified in the supplied dataset.
            </p>
          )}
        </div>
      </div>

      {/* Contradictions & Conflicting Signals */}
      {contradictions && contradictions.length > 0 && (
        <div className="mt-6 border border-amber-200 bg-amber-50/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Identified Contradictions &amp; Mixed Signals
            </h4>
          </div>
          <p className="text-xs text-amber-900/80 mb-3">
            Real markets frequently present conflicting indicators. Gemini does not hide discrepancies:
          </p>
          <ul className="space-y-2">
            {contradictions.map((conflict, cIdx) => (
              <li
                key={cIdx}
                className="text-xs text-slate-800 bg-white p-3 rounded-md border border-amber-200/80 leading-relaxed"
              >
                {conflict}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
