import * as mockData from './mockData';

const API_BASE = import.meta.env.VITE_API_URL || '';
const USE_MOCK = !import.meta.env.VITE_API_URL;

async function fetchWithFallback(url, mockFn) {
  if (USE_MOCK) return mockFn();
  try {
    const res = await fetch(`${API_BASE}${url}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    console.warn(`API call failed for ${url}, using mock data`);
    return mockFn();
  }
}

export const api = {
  getPrices: () => fetchWithFallback('/api/prices', () => mockData.currentPrices),

  getGoldHistory: (days = 90) => fetchWithFallback(`/api/history/gold?days=${days}`, () => mockData.goldPriceHistory),
  getSilverHistory: (days = 90) => fetchWithFallback(`/api/history/silver?days=${days}`, () => mockData.silverPriceHistory),
  getDXYHistory: (days = 90) => fetchWithFallback(`/api/history/dxy?days=${days}`, () => mockData.dxyHistory),

  getEconomicCalendar: () => fetchWithFallback('/api/calendar', () => mockData.economicCalendar),
  getCOTReport: () => fetchWithFallback('/api/cot', () => mockData.cotReport),
  getFedWatch: () => fetchWithFallback('/api/fedwatch', () => mockData.fedWatchData),
  getNews: () => fetchWithFallback('/api/news', () => mockData.newsItems),
  getWatchlist: () => fetchWithFallback('/api/watchlist', () => mockData.watchlistItems),

  getTradeHistory: () => fetchWithFallback('/api/trades', () => mockData.sampleTradeHistory),
  getPerformance: () => fetchWithFallback('/api/performance', () => mockData.performanceData),

  saveTrade: (trade) => fetchWithFallback('/api/trades', () => ({ ...trade, id: Date.now().toString() })),
  saveJournalEntry: (entry) => fetchWithFallback('/api/journal', () => ({ ...entry, id: Date.now().toString() })),
};
