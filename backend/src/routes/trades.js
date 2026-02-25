import { Router } from 'express';

export const tradeRoutes = Router();

const trades = [];
const journalEntries = [];

tradeRoutes.get('/trades', (req, res) => {
  res.json(trades);
});

tradeRoutes.post('/trades', (req, res) => {
  const trade = { ...req.body, id: Date.now().toString(), createdAt: new Date().toISOString() };
  trades.unshift(trade);
  res.status(201).json(trade);
});

tradeRoutes.put('/trades/:id', (req, res) => {
  const idx = trades.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Trade not found' });
  trades[idx] = { ...trades[idx], ...req.body };
  res.json(trades[idx]);
});

tradeRoutes.get('/journal', (req, res) => {
  res.json(journalEntries);
});

tradeRoutes.post('/journal', (req, res) => {
  const entry = { ...req.body, id: Date.now().toString(), createdAt: new Date().toISOString() };
  journalEntries.unshift(entry);
  res.status(201).json(entry);
});

tradeRoutes.get('/watchlist', (req, res) => {
  const watchlist = [
    { symbol: 'XAU/USD', name: 'Gold Spot', price: 2650 + Math.random() * 20, change: (Math.random() - 0.5) * 1 },
    { symbol: 'XAG/USD', name: 'Silver Spot', price: 31 + Math.random() * 1, change: (Math.random() - 0.5) * 0.5 },
    { symbol: 'GLD', name: 'SPDR Gold Shares', price: 245 + Math.random() * 3, change: (Math.random() - 0.5) * 0.5 },
    { symbol: 'SLV', name: 'iShares Silver Trust', price: 28 + Math.random() * 1, change: (Math.random() - 0.5) * 0.8 },
    { symbol: 'GDX', name: 'Gold Miners ETF', price: 36 + Math.random() * 2, change: (Math.random() - 0.5) * 1.2 },
    { symbol: 'DXY', name: 'US Dollar Index', price: 104 + Math.random() * 1, change: (Math.random() - 0.5) * 0.3 },
  ];
  res.json(watchlist);
});

tradeRoutes.get('/performance', (req, res) => {
  const weeklyReturns = Array.from({ length: 12 }, (_, i) => ({
    week: `W${i + 1}`,
    return: parseFloat(((Math.random() - 0.35) * 4).toFixed(2)),
    target: 1.5,
  }));

  const monthlyStats = [
    { month: 'Sep', winRate: 68, trades: 22, pnl: 5.2, sharpe: 1.62, maxDrawdown: 2.1 },
    { month: 'Oct', winRate: 72, trades: 19, pnl: 6.8, sharpe: 1.85, maxDrawdown: 1.8 },
    { month: 'Nov', winRate: 65, trades: 24, pnl: 4.1, sharpe: 1.35, maxDrawdown: 3.2 },
    { month: 'Dec', winRate: 70, trades: 18, pnl: 5.5, sharpe: 1.55, maxDrawdown: 2.4 },
    { month: 'Jan', winRate: 74, trades: 21, pnl: 7.2, sharpe: 1.92, maxDrawdown: 1.5 },
    { month: 'Feb', winRate: 67, trades: 16, pnl: 4.8, sharpe: 1.48, maxDrawdown: 2.8 },
  ];

  res.json({ weeklyReturns, monthlyStats });
});
