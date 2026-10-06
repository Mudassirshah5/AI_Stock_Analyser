import React, { useEffect, useState } from 'react';
import { CheckCircle2, CircleDashed, Loader2 } from 'lucide-react';

interface LoadingStagesProps {
  ticker: string;
}

const STAGES = [
  'Connecting to market data...',
  'Retrieving price history...',
  'Calculating objective indicators...',
  'Collecting available fundamentals...',
  'Collecting recent headlines...',
  'Preparing evidence package...',
  'AI is analyzing the evidence...',
  'Validating assessment distribution...',
  'Preparing final report...',
];

export const LoadingStages: React.FC<LoadingStagesProps> = ({ ticker }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Advance steps realistically while waiting for the server response
    const intervals = [400, 600, 600, 500, 500, 600, 1000, 800, 600];
    let step = 0;

    const runNext = () => {
      if (step < STAGES.length - 1) {
        step += 1;
        setCurrentStep(step);
        timer = setTimeout(runNext, intervals[step] || 700);
      }
    };

    let timer = setTimeout(runNext, intervals[0]);

    return () => clearTimeout(timer);
  }, []);

  const progressPercent = Math.round(((currentStep + 1) / STAGES.length) * 100);

  return (
    <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-xl shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Analyzing Evidence for <span className="font-mono text-emerald-700">{ticker}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Executing transparent multi-tier market pipeline &amp; AI validation
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-semibold text-slate-700">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-6">
        <div
          className="bg-slate-900 h-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Stages List */}
      <div className="space-y-3">
        {STAGES.map((label, index) => {
          const isDone = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div
              key={label}
              className={`flex items-center gap-3 text-sm transition-opacity duration-200 ${
                isDone
                  ? 'text-slate-700'
                  : isCurrent
                  ? 'text-slate-900 font-medium'
                  : 'text-slate-400 opacity-60'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-slate-900 animate-spin shrink-0" />
              ) : (
                <CircleDashed className="w-4 h-4 text-slate-300 shrink-0" />
              )}
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
