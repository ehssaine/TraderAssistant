import * as mockData from './mockData';

const API_BASE = import.meta.env.VITE_API_URL || '';

async function fetchAPI(url, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (err) {
    console.warn(`API call failed for ${url}:`, err.message);
    throw err;
  }
}

// Fetch with mock fallback — used for read-only market data endpoints
async function fetchWithFallback(url, mockFn) {
  try {
    return await fetchAPI(url);
  } catch {
    return mockFn();
  }
}

export const api = {
  // Market data (fallback to mock if API is down)
  getPrices: () => fetchWithFallback('/api/prices', () => mockData.currentPrices),
  getGoldHistory: (days = 90) => fetchWithFallback(`/api/history/gold?days=${days}`, () => mockData.goldPriceHistory),
  getSilverHistory: (days = 90) => fetchWithFallback(`/api/history/silver?days=${days}`, () => mockData.silverPriceHistory),
  getDXYHistory: (days = 90) => fetchWithFallback(`/api/history/dxy?days=${days}`, () => mockData.dxyHistory),
  getEconomicCalendar: () => fetchWithFallback('/api/calendar', () => mockData.economicCalendar),
  getCOTReport: () => fetchWithFallback('/api/cot', () => mockData.cotReport),
  getFedWatch: () => fetchWithFallback('/api/fedwatch', () => mockData.fedWatchData),
  getNews: () => fetchWithFallback('/api/news', () => mockData.newsItems),
  getWatchlist: () => fetchWithFallback('/api/watchlist', () => mockData.watchlistItems),
  getPerformance: () => fetchWithFallback('/api/performance', () => mockData.performanceData),

  // Trades (persistent via DB — no mock fallback)
  getTradeHistory: () => fetchAPI('/api/trades'),
  saveTrade: (trade) => fetchAPI('/api/trades', {
    method: 'POST',
    body: JSON.stringify(trade),
  }),
  updateTrade: (id, trade) => fetchAPI(`/api/trades/${id}`, {
    method: 'PUT',
    body: JSON.stringify(trade),
  }),
  deleteTrade: (id) => fetchAPI(`/api/trades/${id}`, { method: 'DELETE' }),

  // Journal (persistent via DB — no mock fallback)
  getJournalEntries: () => fetchAPI('/api/journal'),
  saveJournalEntry: (entry) => fetchAPI('/api/journal', {
    method: 'POST',
    body: JSON.stringify(entry),
  }),
  updateJournalEntry: (id, entry) => fetchAPI(`/api/journal/${id}`, {
    method: 'PUT',
    body: JSON.stringify(entry),
  }),
  deleteJournalEntry: (id) => fetchAPI(`/api/journal/${id}`, { method: 'DELETE' }),

  // AI Summaries
  generateWeeklySummary: (data) => fetchAPI('/api/ai/summary/weekly', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  generateDailySummary: (data) => fetchAPI('/api/ai/summary/daily', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getAISummaries: (type) => fetchAPI(`/api/ai/summaries${type ? `?type=${type}` : ''}`),
  deleteAISummary: (id) => fetchAPI(`/api/ai/summaries/${id}`, { method: 'DELETE' }),
};
