import React, { useState, useEffect } from 'react';
import { Target, Bell, Trash2, ArrowUpRight, ArrowDownRight, Check, AlertCircle } from 'lucide-react';

export interface TargetPriceSetting {
  targetPrice: number;
  condition: 'above' | 'below';
  createdAt: string;
  isDismissed?: boolean;
}

interface TargetPriceCardProps {
  ticker: string;
  currentPrice: number;
  currency: string;
  targetSetting: TargetPriceSetting | null;
  onSaveTarget: (setting: TargetPriceSetting) => void;
  onClearTarget: () => void;
}

export const TargetPriceCard: React.FC<TargetPriceCardProps> = ({
  ticker,
  currentPrice,
  currency,
  targetSetting,
  onSaveTarget,
  onClearTarget,
}) => {
  const [inputValue, setInputValue] = useState<string>(
    targetSetting ? String(targetSetting.targetPrice) : ''
  );
  const [condition, setCondition] = useState<'above' | 'below'>(
    targetSetting ? targetSetting.condition : 'above'
  );
  const [savedNotice, setSavedNotice] = useState(false);

  // Sync when ticker changes or setting updates
  useEffect(() => {
    if (targetSetting) {
      setInputValue(String(targetSetting.targetPrice));
      setCondition(targetSetting.condition);
    } else {
      // Default initial suggestion: +5% above current price rounded to 2 decimals
      const suggested = (currentPrice * 1.05).toFixed(2);
      setInputValue(suggested);
      setCondition('above');
    }
  }, [ticker, targetSetting, currentPrice]);

  const handleApplyPreset = (multiplier: number, cond: 'above' | 'below') => {
    const val = Number((currentPrice * multiplier).toFixed(2));
    setInputValue(String(val));
    setCondition(cond);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(inputValue);
    if (isNaN(parsed) || parsed <= 0) return;

    onSaveTarget({
      targetPrice: Number(parsed.toFixed(2)),
      condition,
      createdAt: new Date().toISOString(),
      isDismissed: false,
    });

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const numericTarget = parseFloat(inputValue);
  const isValidNumber = !isNaN(numericTarget) && numericTarget > 0;

  // Calculate distance if target is set
  const activeTarget = targetSetting?.targetPrice;
  const isTriggered =
    targetSetting !== null &&
    activeTarget !== undefined &&
    ((targetSetting.condition === 'above' && currentPrice >= activeTarget) ||
      (targetSetting.condition === 'below' && currentPrice <= activeTarget));

  const distanceDollars = activeTarget ? activeTarget - currentPrice : 0;
  const distancePercent = activeTarget ? ((distanceDollars / currentPrice) * 100).toFixed(2) : '0';

  return (
    <div id="target-price-section" className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>Target Price Alert for {ticker}</span>
              {targetSetting && (
                <span className="text-[11px] font-normal normal-case font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  Active: ${targetSetting.targetPrice.toFixed(2)} ({targetSetting.condition === 'above' ? '≥' : '≤'})
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              Set a local threshold to trigger an in-app banner when {ticker} market price crosses it
            </p>
          </div>
        </div>

        {targetSetting && (
          <button
            onClick={onClearTarget}
            className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer border border-rose-200 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove Target</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
        {/* Target Price Numeric Input */}
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Target Price ({currency})
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-mono font-bold">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. 250.00"
              className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-sm"
              required
            />
          </div>
        </div>

        {/* Condition Selector */}
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Trigger Condition
          </label>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setCondition('above')}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                condition === 'above'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              <span>Rises Above (≥)</span>
            </button>
            <button
              type="button"
              onClick={() => setCondition('below')}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                condition === 'below'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
              <span>Drops Below (≤)</span>
            </button>
          </div>
        </div>

        {/* Save Target Action */}
        <div className="md:col-span-4 flex items-center gap-2">
          <button
            type="submit"
            disabled={!isValidNumber}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed h-9.5"
          >
            {savedNotice ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Target Saved!</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5" />
                <span>{targetSetting ? 'Update Target' : 'Set Price Target'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Preset Buttons */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-medium text-[11px] mr-1">Quick Presets:</span>
          <button
            type="button"
            onClick={() => handleApplyPreset(1.05, 'above')}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded border border-slate-200 font-mono text-[11px] cursor-pointer"
          >
            +5% (${(currentPrice * 1.05).toFixed(2)})
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset(1.10, 'above')}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded border border-slate-200 font-mono text-[11px] cursor-pointer"
          >
            +10% (${(currentPrice * 1.10).toFixed(2)})
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset(0.95, 'below')}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded border border-slate-200 font-mono text-[11px] cursor-pointer"
          >
            -5% (${(currentPrice * 0.95).toFixed(2)})
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset(0.90, 'below')}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded border border-slate-200 font-mono text-[11px] cursor-pointer"
          >
            -10% (${(currentPrice * 0.90).toFixed(2)})
          </button>
        </div>

        {/* Current Status Feedback */}
        {targetSetting ? (
          <div className="flex items-center gap-2 text-xs">
            {isTriggered ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                <Check className="w-3.5 h-3.5" />
                <span>Threshold Triggered!</span>
              </span>
            ) : (
              <span className="text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
                Distance to target:{' '}
                <strong className="font-mono text-slate-900">
                  {distanceDollars >= 0 ? `+$${distanceDollars.toFixed(2)}` : `-$${Math.abs(distanceDollars).toFixed(2)}`} ({distancePercent}%)
                </strong>
              </span>
            )}
          </div>
        ) : (
          <span className="text-slate-400 italic text-[11px]">
            No target active for {ticker}.
          </span>
        )}
      </div>
    </div>
  );
};
