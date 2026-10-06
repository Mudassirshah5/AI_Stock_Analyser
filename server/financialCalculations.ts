/**
 * ============================================================================
 * Financial Calculations Engine (Deterministic Quantitative Layer)
 * ============================================================================
 * Implements Layer 2 of the 4-layer architecture:
 * Computes verifiable, mathematical financial indicators from raw historical
 * price bars before passing evidence to the AI reasoning layer.
 *
 * Calculated Metrics:
 *   - Period Return (%): ((latestPrice - startingPrice) / startingPrice) * 100
 *   - Period High & Low: Peak and trough closing/intraday prices
 *   - Volume Delta (%): ((latestVolume - averageVolume) / averageVolume) * 100
 *   - Simple Moving Averages: SMA 20 and SMA 50
 *   - 52-Week Distance (%): Relative distance from annual high and low
 *   - Annualized Volatility (%): Daily log-returns standard deviation * sqrt(252) * 100
 */

import {
  CalculatedSignal,
  Fundamentals,
  ObjectiveCalculations,
  PriceHistoryPoint,
} from '../src/types/stock.js';

/**
 * Computes all objective quantitative indicators and classifies directional signals.
 *
 * @param history Array of OHLCV price history bars
 * @param fiftyTwoWeekHigh Annual peak price or null if unsupplied
 * @param fiftyTwoWeekLow Annual trough price or null if unsupplied
 * @param fundamentals Key company ratios (P/E, Market Cap, Dividend Yield)
 * @returns Object containing raw numerical calculations and classified signal objects
 */
export function calculateFinancialMetrics(
  history: PriceHistoryPoint[],
  fiftyTwoWeekHigh: number | null,
  fiftyTwoWeekLow: number | null,
  fundamentals: Fundamentals
): {
  calculations: ObjectiveCalculations;
  signals: CalculatedSignal[];
} {
  if (!history || history.length === 0) {
    throw new Error('Insufficient price history for financial calculations');
  }

  const startingPrice = history[0].close;
  const latestPrice = history[history.length - 1].close;
  const periodReturnPercent = Number(
    (((latestPrice - startingPrice) / startingPrice) * 100).toFixed(2)
  );

  let periodHigh = history[0].high;
  let periodLow = history[0].low;
  let totalVolume = 0;

  for (const pt of history) {
    if (pt.high > periodHigh) periodHigh = pt.high;
    if (pt.low < periodLow) periodLow = pt.low;
    totalVolume += pt.volume;
  }

  periodHigh = Number(periodHigh.toFixed(2));
  periodLow = Number(periodLow.toFixed(2));

  const averageVolume = Math.round(totalVolume / history.length);
  const latestVolume = history[history.length - 1].volume;
  const volumeDiffPercent =
    averageVolume > 0
      ? Number((((latestVolume - averageVolume) / averageVolume) * 100).toFixed(2))
      : 0;

  const fiftyTwoWeekHighDistancePercent =
    fiftyTwoWeekHigh && fiftyTwoWeekHigh > 0
      ? Number((((latestPrice - fiftyTwoWeekHigh) / fiftyTwoWeekHigh) * 100).toFixed(2))
      : null;

  const fiftyTwoWeekLowDistancePercent =
    fiftyTwoWeekLow && fiftyTwoWeekLow > 0
      ? Number((((latestPrice - fiftyTwoWeekLow) / fiftyTwoWeekLow) * 100).toFixed(2))
      : null;

  // Simple Moving Averages
  const closes = history.map((pt) => pt.close);
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);

  const priceVsSma20Percent =
    sma20 !== null ? Number((((latestPrice - sma20) / sma20) * 100).toFixed(2)) : null;

  const priceVsSma50Percent =
    sma50 !== null ? Number((((latestPrice - sma50) / sma50) * 100).toFixed(2)) : null;

  // Historical Volatility (Annualized standard deviation of daily returns)
  const historicalVolatilityAnnualizedPercent = calculateAnnualizedVolatility(closes);

  const calculations: ObjectiveCalculations = {
    startingPrice: Number(startingPrice.toFixed(2)),
    latestPrice: Number(latestPrice.toFixed(2)),
    periodReturnPercent,
    periodHigh,
    periodLow,
    averageVolume,
    latestVolume,
    volumeDiffPercent,
    fiftyTwoWeekHighDistancePercent,
    fiftyTwoWeekLowDistancePercent,
    sma20: sma20 !== null ? Number(sma20.toFixed(2)) : null,
    sma50: sma50 !== null ? Number(sma50.toFixed(2)) : null,
    priceVsSma20Percent,
    priceVsSma50Percent,
    historicalVolatilityAnnualizedPercent,
  };

  // Generate objective calculated signals
  const signals: CalculatedSignal[] = [];

  // 1. Price Momentum
  if (periodReturnPercent > 1.5) {
    signals.push({
      name: 'Price Momentum',
      direction: 'positive',
      evidence: `The stock gained +${periodReturnPercent}% over the selected period.`,
      metricValue: `+${periodReturnPercent}%`,
    });
  } else if (periodReturnPercent < -1.5) {
    signals.push({
      name: 'Price Momentum',
      direction: 'negative',
      evidence: `The stock declined ${periodReturnPercent}% over the selected period.`,
      metricValue: `${periodReturnPercent}%`,
    });
  } else {
    signals.push({
      name: 'Price Momentum',
      direction: 'neutral',
      evidence: `Price was relatively flat (${periodReturnPercent > 0 ? '+' : ''}${periodReturnPercent}%) over the period.`,
      metricValue: `${periodReturnPercent}%`,
    });
  }

  // 2. Trend & Moving Average
  if (priceVsSma20Percent !== null) {
    if (priceVsSma20Percent > 1.0) {
      signals.push({
        name: 'Short-Term Trend (SMA 20)',
        direction: 'positive',
        evidence: `Latest price ($${latestPrice.toFixed(2)}) is trading +${priceVsSma20Percent}% above its 20-period moving average ($${sma20?.toFixed(2)}).`,
        metricValue: `+${priceVsSma20Percent}% vs SMA20`,
      });
    } else if (priceVsSma20Percent < -1.0) {
      signals.push({
        name: 'Short-Term Trend (SMA 20)',
        direction: 'negative',
        evidence: `Latest price ($${latestPrice.toFixed(2)}) is trading ${priceVsSma20Percent}% below its 20-period moving average ($${sma20?.toFixed(2)}).`,
        metricValue: `${priceVsSma20Percent}% vs SMA20`,
      });
    } else {
      signals.push({
        name: 'Short-Term Trend (SMA 20)',
        direction: 'neutral',
        evidence: `Price is tracking closely along its 20-period moving average ($${sma20?.toFixed(2)}).`,
        metricValue: `Near SMA20`,
      });
    }
  }

  // 3. Volume Activity
  if (volumeDiffPercent > 15) {
    signals.push({
      name: 'Trading Volume',
      direction: periodReturnPercent >= 0 ? 'positive' : 'negative',
      evidence: `Latest volume is ${volumeDiffPercent}% above period average, reflecting heightened market participation.`,
      metricValue: `+${volumeDiffPercent}% vs avg`,
    });
  } else if (volumeDiffPercent < -25) {
    signals.push({
      name: 'Trading Volume',
      direction: 'neutral',
      evidence: `Latest volume is ${Math.abs(volumeDiffPercent)}% below average, indicating lighter conviction.`,
      metricValue: `${volumeDiffPercent}% vs avg`,
    });
  } else {
    signals.push({
      name: 'Trading Volume',
      direction: 'neutral',
      evidence: `Latest volume is in line with the period average (${volumeDiffPercent >= 0 ? '+' : ''}${volumeDiffPercent}%).`,
      metricValue: `${volumeDiffPercent >= 0 ? '+' : ''}${volumeDiffPercent}%`,
    });
  }

  // 4. 52-Week Range Position
  if (fiftyTwoWeekHighDistancePercent !== null && fiftyTwoWeekLowDistancePercent !== null) {
    if (Math.abs(fiftyTwoWeekHighDistancePercent) <= 5.0) {
      signals.push({
        name: '52-Week Range Position',
        direction: 'neutral',
        evidence: `Trading within ${Math.abs(fiftyTwoWeekHighDistancePercent)}% of its 52-week high ($${fiftyTwoWeekHigh?.toFixed(2)}), showing strong price leadership but potential overhead resistance.`,
        metricValue: `${fiftyTwoWeekHighDistancePercent}% of 52W High`,
      });
    } else if (fiftyTwoWeekLowDistancePercent <= 10.0) {
      signals.push({
        name: '52-Week Range Position',
        direction: 'negative',
        evidence: `Trading within ${fiftyTwoWeekLowDistancePercent}% of its 52-week low ($${fiftyTwoWeekLow?.toFixed(2)}), reflecting prolonged downward pressure.`,
        metricValue: `+${fiftyTwoWeekLowDistancePercent}% off 52W Low`,
      });
    } else {
      signals.push({
        name: '52-Week Range Position',
        direction: 'neutral',
        evidence: `Trading in the intermediate band between 52-week low ($${fiftyTwoWeekLow?.toFixed(2)}) and high ($${fiftyTwoWeekHigh?.toFixed(2)}).`,
        metricValue: `Mid-range`,
      });
    }
  }

  // 5. Valuation (Trailing P/E)
  if (fundamentals.trailingPE !== null) {
    if (fundamentals.trailingPE > 45) {
      signals.push({
        name: 'Valuation Multiple (Trailing P/E)',
        direction: 'negative',
        evidence: `Trailing P/E ratio is elevated at ${fundamentals.trailingPE.toFixed(1)}x, requiring strong ongoing growth to justify pricing.`,
        metricValue: `${fundamentals.trailingPE.toFixed(1)}x P/E`,
      });
    } else if (fundamentals.trailingPE > 0 && fundamentals.trailingPE < 20) {
      signals.push({
        name: 'Valuation Multiple (Trailing P/E)',
        direction: 'positive',
        evidence: `Trailing P/E ratio is modest at ${fundamentals.trailingPE.toFixed(1)}x, indicating potentially conservative valuation.`,
        metricValue: `${fundamentals.trailingPE.toFixed(1)}x P/E`,
      });
    } else {
      signals.push({
        name: 'Valuation Multiple (Trailing P/E)',
        direction: 'neutral',
        evidence: `Trailing P/E ratio is ${fundamentals.trailingPE.toFixed(1)}x.`,
        metricValue: `${fundamentals.trailingPE.toFixed(1)}x P/E`,
      });
    }
  }

  // 6. Volatility / Risk Profile
  if (historicalVolatilityAnnualizedPercent !== null) {
    if (historicalVolatilityAnnualizedPercent > 40) {
      signals.push({
        name: 'Historical Volatility',
        direction: 'negative',
        evidence: `Annualized daily return volatility is elevated at ${historicalVolatilityAnnualizedPercent}%, indicating high price fluctuation risk.`,
        metricValue: `${historicalVolatilityAnnualizedPercent}% Vol`,
      });
    } else if (historicalVolatilityAnnualizedPercent < 22) {
      signals.push({
        name: 'Historical Volatility',
        direction: 'positive',
        evidence: `Annualized daily return volatility is relatively low at ${historicalVolatilityAnnualizedPercent}%, reflecting steadier price behavior.`,
        metricValue: `${historicalVolatilityAnnualizedPercent}% Vol`,
      });
    } else {
      signals.push({
        name: 'Historical Volatility',
        direction: 'neutral',
        evidence: `Annualized volatility is moderate at ${historicalVolatilityAnnualizedPercent}%.`,
        metricValue: `${historicalVolatilityAnnualizedPercent}% Vol`,
      });
    }
  }

  return { calculations, signals };
}

/**
 * Computes a standard Simple Moving Average (SMA) over the trailing N periods.
 * Returns null if the historical data has fewer points than the required period.
 */
function calculateSMA(data: number[], period: number): number | null {
  if (data.length < period) return null;
  const slice = data.slice(data.length - period);
  const sum = slice.reduce((acc, val) => acc + val, 0);
  return sum / period;
}

/**
 * Computes Annualized Historical Volatility (%) using continuous log-returns:
 *   r_t = ln(P_t / P_{t-1})
 *   daily_variance = sum((r_t - mean)^2) / (N - 1)
 *   annualized_volatility = sqrt(daily_variance) * sqrt(252 trading days) * 100
 *
 * Returns null if fewer than 5 data points are available.
 */
function calculateAnnualizedVolatility(closes: number[]): number | null {
  if (closes.length < 5) return null;
  const returns: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const prev = closes[i - 1];
    const curr = closes[i];
    if (prev > 0) {
      returns.push(Math.log(curr / prev));
    }
  }

  if (returns.length < 4) return null;

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance =
    returns.reduce((acc, r) => acc + Math.pow(r - mean, 2), 0) /
    (returns.length - 1);
  const dailyStdDev = Math.sqrt(variance);
  const annualized = dailyStdDev * Math.sqrt(252) * 100;

  return Number(annualized.toFixed(2));
}
