import React, { useState } from 'react';
import { X, Printer, Copy, Check, FileText, ShieldAlert } from 'lucide-react';
import { AnalysisPayload } from '../types/stock';

interface FullReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: AnalysisPayload;
}

export const FullReportModal: React.FC<FullReportModalProps> = ({
  isOpen,
  onClose,
  payload,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const { marketData, fundamentals, calculations, news, aiAssessment, period, timestamp } =
    payload;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const md = `# AI Stock Analysis Report: ${marketData.ticker} (${marketData.companyName})
**Generated**: ${new Date(timestamp).toUTCString()}
**Data Source**: yfinance | **Period**: ${period}

---

## 1. Executive Summary
${aiAssessment.assessment_summary}

---

## 2. Primary Assessment
- **Primary Call**: ${aiAssessment.primary_assessment}
- **AI Assessment Distribution**: BUY ${aiAssessment.buy_percentage}% / SELL ${aiAssessment.sell_percentage}%
- **Evidence Quality**: ${aiAssessment.evidence_quality}
*(Note: Percentages represent relative evidence weighting, not future statistical probability).*

---

## 3. Market Overview
- **Latest Price**: $${marketData.latestPrice.toFixed(2)} ${marketData.currency}
- **Starting Price**: $${calculations.startingPrice.toFixed(2)}
- **Period Return**: ${calculations.periodReturnPercent >= 0 ? '+' : ''}${calculations.periodReturnPercent}%
- **Period High / Low**: $${calculations.periodHigh.toFixed(2)} / $${calculations.periodLow.toFixed(2)}
- **52-Week Range**: $${marketData.fiftyTwoWeekLow?.toFixed(2) || 'N/A'} - $${marketData.fiftyTwoWeekHigh?.toFixed(2) || 'N/A'}

---

## 4. Volume Analysis
- **Latest Volume**: ${(calculations.latestVolume / 1e6).toFixed(2)}M
- **Period Average Volume**: ${(calculations.averageVolume / 1e6).toFixed(2)}M
- **Volume Delta**: ${calculations.volumeDiffPercent >= 0 ? '+' : ''}${calculations.volumeDiffPercent}%

---

## 5. Technical / Calculated Signals
${aiAssessment.calculated_signals.map((s) => `- **${s.name}** [${s.direction.toUpperCase()}]: ${s.evidence}`).join('\n')}

---

## 6. Fundamentals
- **Market Cap**: ${fundamentals.marketCap ? `$${(fundamentals.marketCap / 1e9).toFixed(2)}B` : 'Not available'}
- **Trailing P/E**: ${fundamentals.trailingPE ? `${fundamentals.trailingPE}x` : 'Not available'}
- **Forward P/E**: ${fundamentals.forwardPE ? `${fundamentals.forwardPE}x` : 'Not available'}
- **Dividend Yield**: ${fundamentals.dividendYield ? `${fundamentals.dividendYield}%` : 'Not available'}

---

## 7. News Context
${news.length > 0 ? news.map((n) => `- "${n.title}" (${n.publisher}, ${n.publishedAt})`).join('\n') : 'No recent news available from data feed.'}

---

## 8. BUY Evidence
${aiAssessment.buy_supporting_evidence.map((b) => `+ ${b}`).join('\n')}

---

## 9. SELL Evidence
${aiAssessment.sell_supporting_evidence.map((s) => `- ${s}`).join('\n')}

---

## 10. Contradictions & Mixed Signals
${aiAssessment.contradictions && aiAssessment.contradictions.length > 0 ? aiAssessment.contradictions.map((c) => `* ${c}`).join('\n') : 'No significant contradictory signals identified.'}

---

## 11. Evidence Quality
**${aiAssessment.evidence_quality}** — Based on data availability and indicator completeness.

---

## 12. Missing Information
${aiAssessment.missing_information.map((m) => `- ${m}`).join('\n')}

---

## 13. Methodology Summary
${aiAssessment.methodology_summary}

---

## 14. Limitations
${aiAssessment.limitations.map((l) => `- ${l}`).join('\n')}

---

## 15. Disclaimer
${aiAssessment.disclaimer}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-4 flex flex-col max-h-[90vh]">
        {/* Modal Toolbar */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-800" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Full AI Stock Dossier: {marketData.ticker}
              </h2>
              <p className="text-xs text-slate-500">
                15-Point Comprehensive Evidence &amp; AI Analysis Document
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-xs font-medium text-white transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="p-6 sm:p-8 space-y-8 overflow-y-auto text-xs leading-relaxed text-slate-800 print:p-0 print:overflow-visible">
          {/* Header Title in Report */}
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-baseline justify-between">
              <h1 className="text-2xl font-black font-mono text-slate-950">
                {marketData.ticker} · {marketData.companyName}
              </h1>
              <span className="text-xs font-semibold text-slate-500 font-mono">
                {period} Horizon
              </span>
            </div>
            <p className="text-slate-500 text-[11px] mt-1">
              Data retrieved: {new Date(timestamp).toUTCString()} · Source: yfinance
            </p>
          </div>

          {/* 1. Executive Summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-100 pb-1">
              1. Executive Summary
            </h3>
            <p className="text-slate-800 bg-slate-50 p-4 rounded-lg border border-slate-200">
              {aiAssessment.assessment_summary}
            </p>
          </div>

          {/* 2. Primary Assessment */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-100 pb-1">
              2. Primary Assessment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 block">Primary Display Call</span>
                <span className="text-lg font-black text-slate-900 font-mono">
                  {aiAssessment.primary_assessment}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">AI Distribution</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  BUY {aiAssessment.buy_percentage}% / SELL {aiAssessment.sell_percentage}%
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Evidence Quality</span>
                <span className="text-base font-bold text-slate-900">
                  {aiAssessment.evidence_quality}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 italic">
              * The assessment distribution represents the model&apos;s relative weighting between BUY and SELL based only on the supplied evidence, not statistical future price probabilities.
            </p>
          </div>

          {/* 3. Market Overview */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-100 pb-1">
              3. Market Overview
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block">Latest Price</span>
                <span className="font-mono font-bold text-slate-900">
                  ${marketData.latestPrice.toFixed(2)}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block">Period Return</span>
                <span className="font-mono font-bold text-slate-900">
                  {calculations.periodReturnPercent >= 0 ? '+' : ''}{calculations.periodReturnPercent}%
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block">Period High</span>
                <span className="font-mono font-bold text-slate-900">
                  ${calculations.periodHigh.toFixed(2)}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block">Period Low</span>
                <span className="font-mono font-bold text-slate-900">
                  ${calculations.periodLow.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Volume Analysis */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-100 pb-1">
              4. Volume Analysis
            </h3>
            <p className="text-slate-700">
              Latest recorded volume reached{' '}
              <strong className="font-mono">{(calculations.latestVolume / 1e6).toFixed(2)}M</strong> shares,
              compared against the period mean of{' '}
              <strong className="font-mono">{(calculations.averageVolume / 1e6).toFixed(2)}M</strong> shares (
              {calculations.volumeDiffPercent >= 0 ? '+' : ''}{calculations.volumeDiffPercent}% delta).
            </p>
          </div>

          {/* 5. Technical / Calculated Signals */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-100 pb-1">
              5. Technical &amp; Calculated Signals
            </h3>
            <div className="space-y-2">
              {aiAssessment.calculated_signals.map((sig, i) => (
                <div key={i} className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900">{sig.name}</strong>
                    <p className="text-slate-600 mt-0.5">{sig.evidence}</p>
                  </div>
                  <span className="uppercase text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200">
                    {sig.direction}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Fundamentals */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-100 pb-1">
              6. Fundamentals
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block">Market Cap</span>
                <span className="font-mono font-bold">
                  {fundamentals.marketCap ? `$${(fundamentals.marketCap / 1e9).toFixed(2)}B` : 'Not available'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block">Trailing P/E</span>
                <span className="font-mono font-bold">
                  {fundamentals.trailingPE ? `${fundamentals.trailingPE}x` : 'Not available'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block">Forward P/E</span>
                <span className="font-mono font-bold">
                  {fundamentals.forwardPE ? `${fundamentals.forwardPE}x` : 'Not available'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block">Dividend Yield</span>
                <span className="font-mono font-bold">
                  {fundamentals.dividendYield ? `${fundamentals.dividendYield}%` : 'Not available'}
                </span>
              </div>
            </div>
          </div>

          {/* 7. News Context */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-100 pb-1">
              7. News Context
            </h3>
            {news.length > 0 ? (
              <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                {news.map((item) => (
                  <li key={item.id}>
                    &quot;{item.title}&quot; — <span className="text-slate-500">{item.publisher} ({item.publishedAt})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic">No recent news available from primary feed.</p>
            )}
            <p className="text-[11px] text-slate-500 mt-1 italic">
              Note: News headlines provide qualitative sentiment context only; correlation does not establish business causation.
            </p>
          </div>

          {/* 8 & 9. BUY vs SELL Evidence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2 border-b border-emerald-200 pb-1">
                8. BUY Evidence
              </h3>
              <ul className="space-y-1 text-slate-700">
                {aiAssessment.buy_supporting_evidence.map((b, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">+</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-2 border-b border-rose-200 pb-1">
                9. SELL Evidence
              </h3>
              <ul className="space-y-1 text-slate-700">
                {aiAssessment.sell_supporting_evidence.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">-</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 10. Contradictions */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-100 pb-1">
              10. Contradictions &amp; Mixed Signals
            </h3>
            {aiAssessment.contradictions && aiAssessment.contradictions.length > 0 ? (
              <ul className="space-y-1 text-slate-700 list-disc list-inside">
                {aiAssessment.contradictions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic">No major contradictions identified.</p>
            )}
          </div>

          {/* 11. Evidence Quality */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-100 pb-1">
              11. Evidence Quality Rating
            </h3>
            <p className="text-slate-700">
              Rating: <strong className="uppercase">{aiAssessment.evidence_quality}</strong>.
              Describes dataset completeness, indicator coverage, and source reliability.
            </p>
          </div>

          {/* 12. Missing Information */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-100 pb-1">
              12. Missing Information Disclosures
            </h3>
            <ul className="space-y-1 text-slate-600 list-disc list-inside">
              {aiAssessment.missing_information.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>

          {/* 13. Methodology */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-100 pb-1">
              13. Methodology
            </h3>
            <p className="text-slate-700">{aiAssessment.methodology_summary}</p>
          </div>

          {/* 14. Limitations */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-100 pb-1">
              14. Limitations
            </h3>
            <ul className="space-y-1 text-slate-600 list-disc list-inside">
              {aiAssessment.limitations.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </div>

          {/* 15. Disclaimer */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950 mb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>15. Disclaimer</span>
            </h3>
            <p className="text-xs text-amber-900 leading-relaxed">
              {aiAssessment.disclaimer}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            AI Stock Analyzer · Evidence-based research
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
