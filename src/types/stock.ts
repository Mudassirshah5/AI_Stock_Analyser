/**
 * ============================================================================
 * AI Stock Analyzer — Type Definitions
 * ============================================================================
 * Defines core TypeScript contracts across the application:
 *   - Analysis horizons and signal classifications
 *   - Raw market data summaries and OHLCV history bars
 *   - Calculated quantitative indicators and signals
 *   - Structured EvidencePackage provided to Gemini
 *   - Structured AIAnalysisResult returned by Gemini
 *   - Unified AnalysisPayload delivered to the React frontend
 */

/** Supported analysis timeframes */
export type AnalysisPeriod = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '5Y';

/** Direction of a calculated technical or fundamental signal */
export type SignalDirection = 'positive' | 'negative' | 'neutral';

/** Completeness rating of the supplied market dataset */
export type EvidenceQuality = 'HIGH' | 'MODERATE' | 'LOW';

/** Primary directional assessment (strictly binary, no ambiguous HOLD) */
export type PrimaryAssessment = 'BUY' | 'SELL';

/** Single historical OHLCV candle bar */
export interface PriceHistoryPoint {
  date: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketDataSummary {
  ticker: string;
  companyName: string;
  currency: string;
  exchange: string;
  latestPrice: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  dayChange: number;
  dayChangePercent: number;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  latestVolume: number;
  retrievedAt: string;
}

export interface Fundamentals {
  marketCap: number | null;
  trailingPE: number | null;
  forwardPE: number | null;
  dividendYield: number | null;
  sector: string | null;
  industry: string | null;
  fiftyDayAverage: number | null;
  twoHundredDayAverage: number | null;
  averageVolume: number | null;
}

export interface NewsItem {
  id: string;
  title: string;
  publisher: string;
  link: string;
  publishedAt: string;
}

export interface ObjectiveCalculations {
  startingPrice: number;
  latestPrice: number;
  periodReturnPercent: number;
  periodHigh: number;
  periodLow: number;
  averageVolume: number;
  latestVolume: number;
  volumeDiffPercent: number;
  fiftyTwoWeekHighDistancePercent: number | null;
  fiftyTwoWeekLowDistancePercent: number | null;
  sma20: number | null;
  sma50: number | null;
  priceVsSma20Percent: number | null;
  priceVsSma50Percent: number | null;
  historicalVolatilityAnnualizedPercent: number | null;
}

export interface CalculatedSignal {
  name: string;
  direction: SignalDirection;
  evidence: string;
  metricValue?: string;
}

export interface FactItem {
  label: string;
  value: string;
  source_type: 'source_data' | 'calculated';
}

export interface EvidencePackage {
  ticker: string;
  companyName: string;
  sector: string | null;
  currency: string;
  analysisPeriod: AnalysisPeriod;
  dataTimestamp: string;
  priceData: {
    startingPrice: number;
    latestPrice: number;
    periodReturnPercent: number;
    periodHigh: number;
    periodLow: number;
    fiftyTwoWeekHigh: number | null;
    fiftyTwoWeekLow: number | null;
  };
  volumeData: {
    averageVolume: number;
    latestVolume: number;
    volumeComparisonPercent: number;
  };
  trendData: {
    sma20: number | null;
    sma50: number | null;
    priceVsSma20Percent: number | null;
    priceVsSma50Percent: number | null;
  };
  volatilityData: {
    historicalVolatilityAnnualizedPercent: number | null;
  };
  fundamentals: {
    trailingPE: number | null;
    forwardPE: number | null;
    marketCap: number | null;
    dividendYield: number | null;
    fiftyDayAverage: number | null;
    twoHundredDayAverage: number | null;
  };
  news: Array<{
    title: string;
    publisher: string;
    publishedAt: string;
  }>;
  calculatedSignals: CalculatedSignal[];
  dataQuality: {
    missingFields: string[];
    dataSourceWarnings: string[];
    insufficientHistoryWarnings: string[];
  };
}

export interface AIAnalysisResult {
  ticker: string;
  company_name: string;
  primary_assessment: PrimaryAssessment;
  buy_percentage: number;
  sell_percentage: number;
  evidence_quality: EvidenceQuality;
  assessment_summary: string;
  facts: FactItem[];
  calculated_signals: CalculatedSignal[];
  buy_supporting_evidence: string[];
  sell_supporting_evidence: string[];
  contradictions: string[];
  missing_information: string[];
  limitations: string[];
  methodology_summary: string;
  disclaimer: string;
}

export interface AnalysisPayload {
  marketData: MarketDataSummary;
  fundamentals: Fundamentals;
  calculations: ObjectiveCalculations;
  history: PriceHistoryPoint[];
  news: NewsItem[];
  evidencePackage: EvidencePackage;
  aiAssessment: AIAnalysisResult;
  period: AnalysisPeriod;
  timestamp: string;
}
