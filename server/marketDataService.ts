/**
 * ============================================================================
 * Market Data Service (Raw Facts Layer)
 * ============================================================================
 * Implements Layer 1 of the 4-layer architecture:
 * Ingests factual stock market data from public endpoints without modification:
 *   - Historical OHLCV Price Candles: Yahoo Chart v8 endpoint
 *   - Real-time Valuation Ratios & Fundamentals: Yahoo Quote v7 endpoint (with crumb)
 *   - Recent News Headlines: Yahoo Search v1 endpoint
 *   - Corporate Name & Alias Resolution: Common ticker lookup dictionary & search API
 *
 * Supported Analysis Horizons:
 *   - 1D: 5-minute candles over the active/most recent trading day (~79 bars)
 *   - 5D: 15-minute candles over trailing 5 trading days
 *   - 1M, 3M, 6M, 1Y: Daily candles over respective trailing months/years
 *   - 5Y: Weekly candles over trailing 5 years (~262 bars)
 */

import {
  AnalysisPeriod,
  Fundamentals,
  MarketDataSummary,
  NewsItem,
  PriceHistoryPoint,
} from '../src/types/stock.js';

interface YahooCrumbSession {
  cookie: string;
  crumb: string;
  fetchedAt: number;
}

let cachedSession: YahooCrumbSession | null = null;

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function getYahooSession(): Promise<{ cookie: string; crumb: string } | null> {
  const now = Date.now();
  if (cachedSession && now - cachedSession.fetchedAt < 30 * 60 * 1000) {
    return cachedSession;
  }

  try {
    const res = await fetch('https://fc.yahoo.com', {
      headers: { 'User-Agent': USER_AGENT },
    });
    const cookieHeader = res.headers.get('set-cookie');
    if (!cookieHeader) return null;

    // Extract cookie value before semicolon
    const cookie = cookieHeader.split(';')[0];
    const crumbRes = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
      headers: {
        'User-Agent': USER_AGENT,
        Cookie: cookie,
      },
    });

    if (!crumbRes.ok) return null;
    const crumb = (await crumbRes.text()).trim();
    if (!crumb || crumb.includes('html') || crumb.includes('error')) return null;

    cachedSession = { cookie, crumb, fetchedAt: now };
    return cachedSession;
  } catch (err) {
    console.warn('Failed to retrieve Yahoo crumb session, proceeding with chart fallback:', err);
    return null;
  }
}

const COMMON_ALIASES: Record<string, string> = {
  BLACKROCK: 'BLK',
  APPLE: 'AAPL',
  TESLA: 'TSLA',
  MICROSOFT: 'MSFT',
  GOOGLE: 'GOOGL',
  ALPHABET: 'GOOGL',
  AMAZON: 'AMZN',
  NVIDIA: 'NVDA',
  META: 'META',
  FACEBOOK: 'META',
  BERKSHIRE: 'BRK-B',
  BERKSHIREHATHAWAY: 'BRK-B',
  NETFLIX: 'NFLX',
  JPMORGAN: 'JPM',
  JPMORGANCHASE: 'JPM',
  VISA: 'V',
  MASTERCARD: 'MA',
  WALMART: 'WMT',
  DISNEY: 'DIS',
  WALTDISNEY: 'DIS',
  COCACOLA: 'KO',
  PEPSI: 'PEP',
  PEPSICO: 'PEP',
  INTEL: 'INTC',
  AMD: 'AMD',
  BOEING: 'BA',
  EXXON: 'XOM',
  EXXONMOBIL: 'XOM',
  CHEVRON: 'CVX',
  COSTCO: 'COST',
  SALESFORCE: 'CRM',
  ORACLE: 'ORCL',
  ADOBE: 'ADBE',
  UBER: 'UBER',
  AIRBNB: 'ABNB',
  PALANTIR: 'PLTR',
  COINBASE: 'COIN',
  BROADCOM: 'AVGO',
  QUALCOMM: 'QCOM',
  SP500: '^GSPC',
  SPY: 'SPY',
  QQQ: 'QQQ',
  DOW: '^DJI',
  NASDAQ: '^IXIC',
};

export async function resolveTickerSymbol(input: string): Promise<string> {
  const trimmed = input.trim().toUpperCase();
  const stripped = trimmed.replace(/[^A-Z0-9]/g, '');

  if (COMMON_ALIASES[trimmed]) return COMMON_ALIASES[trimmed];
  if (COMMON_ALIASES[stripped]) return COMMON_ALIASES[stripped];

  // If already standard ticker of 1-5 chars without common vowel structures of English words
  if (/^[A-Z]{1,5}$/.test(trimmed) && trimmed.length <= 4) {
    return trimmed;
  }

  // Lookup symbol using Yahoo search API
  try {
    const searchUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
      input.trim()
    )}&quotesCount=5&newsCount=0`;
    const res = await fetch(searchUrl, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    });
    if (res.ok) {
      const data = (await res.json()) as any;
      const quotes = data.quotes || [];
      const equityQuote = quotes.find(
        (q: any) => q.quoteType === 'EQUITY' || q.quoteType === 'ETF'
      );
      if (equityQuote?.symbol) {
        return equityQuote.symbol.toUpperCase();
      }
      if (quotes[0]?.symbol) {
        return quotes[0].symbol.toUpperCase();
      }
    }
  } catch (err) {
    console.warn('Symbol search resolution error:', err);
  }

  return trimmed;
}

export async function fetchStockData(
  rawTicker: string,
  period: AnalysisPeriod
): Promise<{
  marketData: MarketDataSummary;
  history: PriceHistoryPoint[];
  fundamentals: Fundamentals;
  news: NewsItem[];
  missingFields: string[];
}> {
  let ticker = await resolveTickerSymbol(rawTicker);
  if (!ticker || !/^[A-Z0-9.\-^=]{1,12}$/.test(ticker)) {
    throw new Error(
      `We couldn't find usable market data for "${rawTicker}". Check the symbol and try again.`
    );
  }

  // 1. Map period to range & interval
  let range = '1mo';
  let interval = '1d';
  switch (period) {
    case '1D':
      range = '1d';
      interval = '5m';
      break;
    case '5D':
      range = '5d';
      interval = '15m';
      break;
    case '1M':
      range = '1mo';
      interval = '1d';
      break;
    case '3M':
      range = '3mo';
      interval = '1d';
      break;
    case '6M':
      range = '6mo';
      interval = '1d';
      break;
    case '1Y':
      range = '1y';
      interval = '1d';
      break;
    case '5Y':
      range = '5y';
      interval = '1wk';
      break;
  }

  // Helper to fetch chart
  const tryFetchChart = async (sym: string) => {
    const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      sym
    )}?range=${range}&interval=${interval}&indicators=quote&includeTimestamps=true`;
    return await fetch(chartUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
    });
  };

  // 2. Fetch Chart Data
  let chartRes = await tryFetchChart(ticker);

  // If first attempt fails (404 or not ok), try search lookup if rawTicker was different
  if (!chartRes.ok) {
    const searched = await resolveTickerSymbol(rawTicker);
    if (searched && searched !== ticker) {
      ticker = searched;
      chartRes = await tryFetchChart(ticker);
    }
  }

  if (!chartRes.ok) {
    if (chartRes.status === 404) {
      throw new Error(
        `We couldn't find usable market data for "${rawTicker}". Try entering the stock ticker symbol (e.g. 'BLK' for BlackRock, 'AAPL' for Apple).`
      );
    }
    throw new Error(`Market data provider returned HTTP status ${chartRes.status}. Please try again shortly.`);
  }

  const chartJson = (await chartRes.json()) as any;
  const result = chartJson.chart?.result?.[0];

  if (!result || !result.timestamp || result.timestamp.length === 0) {
    throw new Error(
      `We couldn't find usable market data for "${rawTicker}". Try entering the stock ticker symbol (e.g. 'BLK' for BlackRock, 'AAPL' for Apple).`
    );
  }

  const meta = result.meta || {};
  const quoteIndicators = result.indicators?.quote?.[0] || {};
  const timestamps = result.timestamp as number[];
  const opens = quoteIndicators.open || [];
  const highs = quoteIndicators.high || [];
  const lows = quoteIndicators.low || [];
  const closes = quoteIndicators.close || [];
  const volumes = quoteIndicators.volume || [];

  const history: PriceHistoryPoint[] = [];

  for (let i = 0; i < timestamps.length; i++) {
    const close = closes[i];
    if (close !== null && close !== undefined && !isNaN(close)) {
      const open = opens[i] ?? close;
      const high = highs[i] ?? Math.max(open, close);
      const low = lows[i] ?? Math.min(open, close);
      const volume = volumes[i] ?? 0;
      const dateObj = new Date(timestamps[i] * 1000);

      history.push({
        date:
          period === '1D'
            ? dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            : period === '5D'
            ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        timestamp: timestamps[i],
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Math.round(volume),
      });
    }
  }

  if (history.length < 2) {
    throw new Error(`Insufficient trading history found for "${ticker}". Symbol may be inactive or newly listed.`);
  }

  const latestPt = history[history.length - 1];
  const prevClose = meta.chartPreviousClose ?? history[0].open;
  const latestPrice = meta.regularMarketPrice ?? latestPt.close;
  const dayChange = Number((latestPrice - prevClose).toFixed(2));
  const dayChangePercent = prevClose > 0 ? Number(((dayChange / prevClose) * 100).toFixed(2)) : 0;

  const marketData: MarketDataSummary = {
    ticker,
    companyName: meta.longName || meta.shortName || ticker,
    currency: meta.currency || 'USD',
    exchange: meta.fullExchangeName || meta.exchangeName || 'Market',
    latestPrice: Number(latestPrice.toFixed(2)),
    previousClose: Number(prevClose.toFixed(2)),
    dayHigh: meta.regularMarketDayHigh ?? latestPt.high,
    dayLow: meta.regularMarketDayLow ?? latestPt.low,
    dayChange,
    dayChangePercent,
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ? Number(meta.fiftyTwoWeekHigh.toFixed(2)) : null,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow ? Number(meta.fiftyTwoWeekLow.toFixed(2)) : null,
    latestVolume: meta.regularMarketVolume ?? latestPt.volume,
    retrievedAt: new Date().toISOString(),
  };

  // 3. Fetch Quote Summary & Fundamentals (with crumb)
  const session = await getYahooSession();
  let quoteDetail: any = null;

  if (session) {
    try {
      const quoteUrl = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(
        ticker
      )}&crumb=${encodeURIComponent(session.crumb)}`;
      const qRes = await fetch(quoteUrl, {
        headers: {
          'User-Agent': USER_AGENT,
          Cookie: session.cookie,
        },
      });
      if (qRes.ok) {
        const qJson = (await qRes.json()) as any;
        quoteDetail = qJson.quoteResponse?.result?.[0];
      }
    } catch (e) {
      console.warn('Quote detail fetch failed, using chart meta fallback:', e);
    }
  }

  // Update company name if more complete name exists in quoteDetail
  if (quoteDetail?.longName) {
    marketData.companyName = quoteDetail.longName;
  }

  const fundamentals: Fundamentals = {
    marketCap: quoteDetail?.marketCap ?? null,
    trailingPE: quoteDetail?.trailingPE ? Number(quoteDetail.trailingPE.toFixed(2)) : null,
    forwardPE: quoteDetail?.forwardPE ? Number(quoteDetail.forwardPE.toFixed(2)) : null,
    dividendYield:
      quoteDetail?.trailingAnnualDividendYield !== undefined && quoteDetail?.trailingAnnualDividendYield !== null
        ? Number((quoteDetail.trailingAnnualDividendYield * 100).toFixed(2))
        : null,
    sector: null, // Note: standard quote doesn't always have sector, will mark as missing if null
    industry: null,
    fiftyDayAverage: quoteDetail?.fiftyDayAverage ? Number(quoteDetail.fiftyDayAverage.toFixed(2)) : null,
    twoHundredDayAverage: quoteDetail?.twoHundredDayAverage ? Number(quoteDetail.twoHundredDayAverage.toFixed(2)) : null,
    averageVolume: quoteDetail?.averageDailyVolume3Month ?? null,
  };

  if (!marketData.fiftyTwoWeekHigh && quoteDetail?.fiftyTwoWeekHigh) {
    marketData.fiftyTwoWeekHigh = Number(quoteDetail.fiftyTwoWeekHigh.toFixed(2));
  }
  if (!marketData.fiftyTwoWeekLow && quoteDetail?.fiftyTwoWeekLow) {
    marketData.fiftyTwoWeekLow = Number(quoteDetail.fiftyTwoWeekLow.toFixed(2));
  }

  // 4. Fetch Recent News
  const news: NewsItem[] = [];
  try {
    const searchUrl = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
      ticker
    )}&newsCount=6&quotesCount=1`;
    const searchRes = await fetch(searchUrl, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (searchRes.ok) {
      const searchJson = (await searchRes.json()) as any;
      const rawNews = searchJson.news || [];
      for (const item of rawNews) {
        if (item.title) {
          news.push({
            id: item.uuid || String(Math.random()),
            title: item.title,
            publisher: item.publisher || 'Market Wire',
            link: item.link || '',
            publishedAt: item.providerPublishTime
              ? new Date(item.providerPublishTime * 1000).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recent',
          });
        }
      }
    }
  } catch (err) {
    console.warn('Failed to retrieve news items:', err);
  }

  // Identify missing fields for transparency
  const missingFields: string[] = [];
  if (fundamentals.trailingPE === null) missingFields.push('Trailing P/E ratio');
  if (fundamentals.forwardPE === null) missingFields.push('Forward P/E ratio');
  if (fundamentals.marketCap === null) missingFields.push('Market Capitalization');
  if (fundamentals.dividendYield === null) missingFields.push('Dividend Yield');
  if (fundamentals.sector === null) missingFields.push('Detailed Sector Classification');
  if (news.length === 0) missingFields.push('Recent news headlines from primary wire');

  return {
    marketData,
    history,
    fundamentals,
    news,
    missingFields,
  };
}
