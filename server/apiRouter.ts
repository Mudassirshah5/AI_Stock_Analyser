/**
 * ============================================================================
 * AI Stock Analyzer — API Router
 * ============================================================================
 * Defines all Express REST endpoints for:
 *   1. System health check: GET /api/health
 *   2. Single quote summary: GET /api/quote/:ticker
 *   3. Real-time batch quotes: GET /api/batch-quotes?symbols=AAPL,NVDA,...
 *   4. Symbol autocomplete & search: GET /api/search?q=...&nasdaq=true
 *   5. Comprehensive AI Stock Analysis: POST /api/analyze
 *
 * Implements an in-memory 5-minute cache for analyzed stock payloads to minimize
 * redundant external API calls and rate-limiting.
 */

import { Request, Response, Router } from 'express';
import { AnalysisPayload, AnalysisPeriod, EvidencePackage } from '../src/types/stock.js';
import { calculateFinancialMetrics } from './financialCalculations.js';
import { analyzeStockWithGemini } from './geminiService.js';
import { fetchStockData } from './marketDataService.js';

export const apiRouter = Router();

// ============================================================================
// In-Memory Cache Configuration
// ============================================================================
interface CacheEntry {
  payload: AnalysisPayload;
  cachedAt: number;
}

const analysisCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache lifetime

/**
 * Health Check Endpoint
 * GET /api/health
 */
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Single Quote Summary Endpoint
 * GET /api/quote/:ticker
 */
apiRouter.get('/quote/:ticker', async (req: Request, res: Response) => {
  try {
    const ticker = String(req.params.ticker || '').trim().toUpperCase();
    const data = await fetchStockData(ticker, '1M');
    res.json(data.marketData);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to fetch quote' });
  }
});

/**
 * Batch Quotes Endpoint for Watchlist Real-Time Monitoring
 * GET /api/batch-quotes?symbols=AAPL,NVDA,MSFT,TSLA
 *
 * Fetches latest prices, daily changes, and percentages for up to 30 symbols concurrently.
 */
apiRouter.get('/batch-quotes', async (req: Request, res: Response) => {
  try {
    const rawSymbols = String(req.query.symbols || '').trim();
    if (!rawSymbols) {
      return res.json([]);
    }

    // Deduplicate and filter symbols (max 30 symbols per batch request)
    const symbols = Array.from(
      new Set(
        rawSymbols
          .split(',')
          .map((s) => s.trim().toUpperCase())
          .filter((s) => s.length > 0 && /^[A-Z0-9.\-^=]{1,12}$/.test(s))
      )
    ).slice(0, 30);

    const fetchSingleQuote = async (sym: string) => {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
          sym
        )}?range=2d&interval=1d`;
        const r = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'application/json',
          },
        });
        if (!r.ok) return null;
        const data = (await r.json()) as any;
        const meta = data.chart?.result?.[0]?.meta;
        if (!meta || meta.regularMarketPrice === undefined) return null;

        const price = meta.regularMarketPrice;
        const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
        const change = price - prevClose;
        const changePercent = prevClose ? (change / prevClose) * 100 : 0;

        return {
          symbol: sym,
          price: Number(price.toFixed(2)),
          previousClose: Number(prevClose.toFixed(2)),
          change: Number(change.toFixed(2)),
          changePercent: Number(changePercent.toFixed(2)),
          currency: meta.currency || 'USD',
          updatedAt: new Date().toISOString(),
        };
      } catch {
        return null;
      }
    };

    const results = await Promise.all(symbols.map(fetchSingleQuote));
    const validQuotes = results.filter((q): q is NonNullable<typeof q> => q !== null);

    res.json(validQuotes);
  } catch (err: any) {
    console.error('Batch quotes fetch error:', err);
    res.json([]);
  }
});

/**
 * Symbol Search & Autocomplete Endpoint
 * GET /api/search?q=apple&nasdaq=true
 *
 * Resolves stock tickers, company names, and ETFs with optional NASDAQ constituent prioritization.
 */
apiRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    const nasdaqOnly = req.query.nasdaq === 'true' || req.query.nasdaq === '1';

    // Top NASDAQ benchmark constituents when search query is empty
    if (!q) {
      const topNasdaq = [
        { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', quoteType: 'EQUITY', isNasdaq: true },
        { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', quoteType: 'EQUITY', isNasdaq: true },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', quoteType: 'EQUITY', isNasdaq: true },
        { symbol: 'AMZN', name: 'Amazon.com, Inc.', exchange: 'NASDAQ', quoteType: 'EQUITY', isNasdaq: true },
        { symbol: 'GOOGL', name: 'Alphabet Inc. (Class A)', exchange: 'NASDAQ', quoteType: 'EQUITY', isNasdaq: true },
        { symbol: 'META', name: 'Meta Platforms, Inc.', exchange: 'NASDAQ', quoteType: 'EQUITY', isNasdaq: true },
        { symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ', quoteType: 'EQUITY', isNasdaq: true },
        { symbol: 'AVGO', name: 'Broadcom Inc.', exchange: 'NASDAQ', quoteType: 'EQUITY', isNasdaq: true },
        { symbol: 'COST', name: 'Costco Wholesale Corp.', exchange: 'NASDAQ', quoteType: 'EQUITY', isNasdaq: true },
        { symbol: 'PEP', name: 'PepsiCo, Inc.', exchange: 'NASDAQ', quoteType: 'EQUITY', isNasdaq: true },
        { symbol: 'ASML', name: 'ASML Holding N.V.', exchange: 'NASDAQ', quoteType: 'EQUITY', isNasdaq: true },
        { symbol: 'ADBE', name: 'Adobe Inc.', exchange: 'NASDAQ', quoteType: 'EQUITY', isNasdaq: true },
        { symbol: 'CSCO', name: 'Cisco Systems, Inc.', exchange: 'NASDAQ', quoteType: 'EQUITY', isNasdaq: true },
        { symbol: 'AMD', name: 'Advanced Micro Devices', exchange: 'NASDAQ', quoteType: 'EQUITY', isNasdaq: true },
        { symbol: 'INTC', name: 'Intel Corporation', exchange: 'NASDAQ', quoteType: 'EQUITY', isNasdaq: true },
        { symbol: 'QCOM', name: 'QUALCOMM Incorporated', exchange: 'NASDAQ', quoteType: 'EQUITY', isNasdaq: true },
        { symbol: 'NFLX', name: 'Netflix, Inc.', exchange: 'NASDAQ', quoteType: 'EQUITY', isNasdaq: true },
        { symbol: 'TXN', name: 'Texas Instruments Inc.', exchange: 'NASDAQ', quoteType: 'EQUITY', isNasdaq: true },
        { symbol: 'AMGN', name: 'Amgen Inc.', exchange: 'NASDAQ', quoteType: 'EQUITY', isNasdaq: true },
        { symbol: 'SBUX', name: 'Starbucks Corporation', exchange: 'NASDAQ', quoteType: 'EQUITY', isNasdaq: true },
      ];
      return res.json(topNasdaq);
    }

    const searchUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
      q
    )}&quotesCount=15&newsCount=0&enableFuzzyQuery=true`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return res.json([]);
    }

    const data = (await response.json()) as any;
    const rawQuotes = data.quotes || [];

    const results = rawQuotes
      .filter((item: any) =>
        ['EQUITY', 'ETF', 'INDEX', 'MUTUALFUND'].includes(item.quoteType)
      )
      .map((item: any) => {
        let exchange = item.exchDisp || item.exchange || 'US';
        const rawExch = (item.exchange || '').toUpperCase();
        const isNasdaq =
          exchange.toUpperCase().includes('NASDAQ') ||
          ['NMS', 'NGM', 'NCM', 'NAS', 'NBI'].includes(rawExch);

        if (isNasdaq) {
          exchange = 'NASDAQ';
        } else if (['NYQ', 'NYS'].includes(rawExch) || exchange.toUpperCase().includes('NYSE')) {
          exchange = 'NYSE';
        }

        return {
          symbol: item.symbol,
          name: item.shortname || item.longname || item.symbol,
          exchange,
          quoteType: item.quoteType,
          isNasdaq,
        };
      });

    const filtered = nasdaqOnly ? results.filter((r: any) => r.isNasdaq) : results;

    // Prioritize NASDAQ results
    filtered.sort((a: any, b: any) => {
      if (a.isNasdaq && !b.isNasdaq) return -1;
      if (!a.isNasdaq && b.isNasdaq) return 1;
      return 0;
    });

    res.json(filtered);
  } catch (err: any) {
    console.error('Search autocomplete error:', err);
    res.json([]);
  }
});

/**
 * Comprehensive AI Stock Analysis Endpoint
 * POST /api/analyze
 * Body: { ticker: string, period?: '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '5Y' }
 *
 * Executes the complete 5-step analysis pipeline:
 *   Step 1: Retrieve live market candles, fundamentals, and headlines.
 *   Step 2: Run deterministic mathematical calculations (SMA, volatility, momentum).
 *   Step 3: Package all verified data into a structured EvidencePackage.
 *   Step 4: Invoke Gemini AI (with quota fallback & heuristic backup).
 *   Step 5: Cache and return the unified AnalysisPayload.
 */
apiRouter.post('/analyze', async (req: Request, res: Response) => {
  try {
    const rawTicker = req.body?.ticker;
    const rawPeriod = req.body?.period || '1M';

    if (!rawTicker || typeof rawTicker !== 'string') {
      res.status(400).json({
        error: "Please enter a valid stock ticker symbol (e.g. 'AAPL', 'TSLA').",
      });
      return;
    }

    const validPeriods: AnalysisPeriod[] = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y'];
    const period: AnalysisPeriod = validPeriods.includes(rawPeriod) ? rawPeriod : '1M';
    const tickerNormalized = rawTicker.trim().toUpperCase();
    const cacheKey = `${tickerNormalized}:${period}`;

    // Check cache
    const cached = analysisCache.get(cacheKey);
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      res.json(cached.payload);
      return;
    }

    // Step 1: Retrieve Real Market Data
    const { marketData, history, fundamentals, news, missingFields } = await fetchStockData(
      rawTicker,
      period
    );

    // Step 2: Run Objective Financial Calculations
    const { calculations, signals } = calculateFinancialMetrics(
      history,
      marketData.fiftyTwoWeekHigh,
      marketData.fiftyTwoWeekLow,
      fundamentals
    );

    // Step 3: Package Evidence
    const evidencePackage: EvidencePackage = {
      ticker: marketData.ticker,
      companyName: marketData.companyName,
      sector: fundamentals.sector,
      currency: marketData.currency,
      analysisPeriod: period,
      dataTimestamp: marketData.retrievedAt,
      priceData: {
        startingPrice: calculations.startingPrice,
        latestPrice: calculations.latestPrice,
        periodReturnPercent: calculations.periodReturnPercent,
        periodHigh: calculations.periodHigh,
        periodLow: calculations.periodLow,
        fiftyTwoWeekHigh: marketData.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: marketData.fiftyTwoWeekLow,
      },
      volumeData: {
        averageVolume: calculations.averageVolume,
        latestVolume: calculations.latestVolume,
        volumeComparisonPercent: calculations.volumeDiffPercent,
      },
      trendData: {
        sma20: calculations.sma20,
        sma50: calculations.sma50,
        priceVsSma20Percent: calculations.priceVsSma20Percent,
        priceVsSma50Percent: calculations.priceVsSma50Percent,
      },
      volatilityData: {
        historicalVolatilityAnnualizedPercent: calculations.historicalVolatilityAnnualizedPercent,
      },
      fundamentals: {
        trailingPE: fundamentals.trailingPE,
        forwardPE: fundamentals.forwardPE,
        marketCap: fundamentals.marketCap,
        dividendYield: fundamentals.dividendYield,
        fiftyDayAverage: fundamentals.fiftyDayAverage,
        twoHundredDayAverage: fundamentals.twoHundredDayAverage,
      },
      news: news.map((n) => ({
        title: n.title,
        publisher: n.publisher,
        publishedAt: n.publishedAt,
      })),
      calculatedSignals: signals,
      dataQuality: {
        missingFields,
        dataSourceWarnings: [
          'Data retrieved from public yfinance market feed.',
          'Delayed intraday quote snapshot; market conditions may change.',
        ],
        insufficientHistoryWarnings:
          history.length < 20
            ? ['Fewer than 20 observations available in this range; longer moving averages omitted.']
            : [],
      },
    };

    // Step 4: AI Reasoning with Gemini 3.8 Flash
    const aiAssessment = await analyzeStockWithGemini(evidencePackage);

    // Step 5: Build Final Payload
    const payload: AnalysisPayload = {
      marketData,
      fundamentals,
      calculations,
      history,
      news,
      evidencePackage,
      aiAssessment,
      period,
      timestamp: new Date().toISOString(),
    };

    // Store in cache
    analysisCache.set(cacheKey, { payload, cachedAt: Date.now() });

    res.json(payload);
  } catch (err: any) {
    console.error('Analysis error:', err);
    res.status(400).json({
      error:
        err.message ||
        "We couldn't find usable market data for this ticker. Check the symbol and try again.",
    });
  }
});
