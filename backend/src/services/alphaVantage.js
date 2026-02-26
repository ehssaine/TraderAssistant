import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.ALPHA_VANTAGE_KEY || 'demo';
const BASE_URL = 'https://www.alphavantage.co/query';

// Simple in-memory cache to respect the 25 req/day free-tier limit
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

async function fetchAV(params) {
  const key = JSON.stringify(params);
  const cached = getCached(key);
  if (cached) return cached;

  const url = new URL(BASE_URL);
  url.searchParams.set('apikey', API_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Alpha Vantage HTTP ${res.status}`);
  const data = await res.json();

  // Alpha Vantage returns an error note when rate limited
  if (data.Note || data['Error Message']) {
    throw new Error(data.Note || data['Error Message']);
  }

  setCache(key, data);
  return data;
}

// ── Live Prices ──────────────────────────────────────────────────────────
export async function getGoldPrice() {
  const data = await fetchAV({
    function: 'GLOBAL_QUOTE',
    symbol: 'GLD',
  });
  const q = data['Global Quote'] || {};
  const price = parseFloat(q['05. price'] || 0);
  const change = parseFloat(q['09. change'] || 0);
  const changePct = parseFloat((q['10. change percent'] || '0').replace('%', ''));
  // GLD ≈ 1/10th of gold spot; approximate spot price
  return { price: price * 10.8, change: change * 10.8, changePercent: changePct };
}

export async function getSilverPrice() {
  const data = await fetchAV({
    function: 'GLOBAL_QUOTE',
    symbol: 'SLV',
  });
  const q = data['Global Quote'] || {};
  const price = parseFloat(q['05. price'] || 0);
  const change = parseFloat(q['09. change'] || 0);
  const changePct = parseFloat((q['10. change percent'] || '0').replace('%', ''));
  // SLV tracks silver roughly 1:1
  return { price, change, changePercent: changePct };
}

export async function getDXYPrice() {
  // Alpha Vantage doesn't have DXY directly; use UUP (dollar bull ETF) as proxy
  const data = await fetchAV({
    function: 'GLOBAL_QUOTE',
    symbol: 'UUP',
  });
  const q = data['Global Quote'] || {};
  const price = parseFloat(q['05. price'] || 0);
  const change = parseFloat(q['09. change'] || 0);
  const changePct = parseFloat((q['10. change percent'] || '0').replace('%', ''));
  // Scale UUP (~$28) to approximate DXY (~104)
  return { price: price * 3.7, change: change * 3.7, changePercent: changePct };
}

export async function getAllPrices() {
  const [gold, silver, dxy] = await Promise.all([
    getGoldPrice().catch(() => null),
    getSilverPrice().catch(() => null),
    getDXYPrice().catch(() => null),
  ]);
  return {
    gold: gold || { price: 0, change: 0, changePercent: 0 },
    silver: silver || { price: 0, change: 0, changePercent: 0 },
    dxy: dxy || { price: 0, change: 0, changePercent: 0 },
  };
}

// ── Historical Data ──────────────────────────────────────────────────────
const symbolMap = {
  gold: 'GLD',
  silver: 'SLV',
  dxy: 'UUP',
};
const scaleMap = {
  gold: 10.8,
  silver: 1,
  dxy: 3.7,
};

export async function getHistory(commodity, days = 90) {
  const ticker = symbolMap[commodity] || 'GLD';
  const scale = scaleMap[commodity] || 1;
  const outputSize = days > 100 ? 'full' : 'compact';

  const data = await fetchAV({
    function: 'TIME_SERIES_DAILY',
    symbol: ticker,
    outputsize: outputSize,
  });

  const timeSeries = data['Time Series (Daily)'] || {};
  const entries = Object.entries(timeSeries)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-days);

  return entries.map(([date, bar]) => ({
    date,
    open: parseFloat((parseFloat(bar['1. open']) * scale).toFixed(2)),
    high: parseFloat((parseFloat(bar['2. high']) * scale).toFixed(2)),
    low: parseFloat((parseFloat(bar['3. low']) * scale).toFixed(2)),
    close: parseFloat((parseFloat(bar['4. close']) * scale).toFixed(2)),
    volume: parseInt(bar['5. volume'], 10),
  }));
}

// ── News Sentiment ───────────────────────────────────────────────────────
export async function getNews() {
  const data = await fetchAV({
    function: 'NEWS_SENTIMENT',
    tickers: 'GLD,SLV',
    topics: 'financial_markets',
    limit: '10',
  });

  const feed = data.feed || [];
  return feed.slice(0, 10).map((item, i) => ({
    id: String(i + 1),
    title: item.title,
    source: item.source,
    time: formatTimeAgo(item.time_published),
    url: item.url,
    sentiment: mapSentiment(item.overall_sentiment_label),
    impact: Math.abs(item.overall_sentiment_score) > 0.25 ? 'high' : 'medium',
  }));
}

function formatTimeAgo(avTime) {
  // avTime format: "20260226T143000"
  if (!avTime) return 'N/A';
  const year = avTime.slice(0, 4);
  const month = avTime.slice(4, 6);
  const day = avTime.slice(6, 8);
  const hour = avTime.slice(9, 11);
  const min = avTime.slice(11, 13);
  const published = new Date(`${year}-${month}-${day}T${hour}:${min}:00Z`);
  const diffMs = Date.now() - published.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  if (diffH < 1) return `${Math.floor(diffMs / 60000)}m ago`;
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

function mapSentiment(label) {
  if (!label) return 'neutral';
  const l = label.toLowerCase();
  if (l.includes('bullish') || l.includes('positive')) return 'bullish';
  if (l.includes('bearish') || l.includes('negative')) return 'bearish';
  return 'neutral';
}
