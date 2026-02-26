import { Router } from 'express';
import { getAllPrices, getHistory } from '../services/alphaVantage.js';
import { getMockPrices, getMockHistory } from '../services/mockMarketData.js';

export const priceRoutes = Router();

priceRoutes.get('/prices', async (req, res) => {
  try {
    const prices = await getAllPrices();
    res.json(prices);
  } catch (err) {
    console.warn('Alpha Vantage prices failed, using mock:', err.message);
    res.json(getMockPrices());
  }
});

priceRoutes.get('/history/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const days = parseInt(req.query.days) || 90;
  try {
    const history = await getHistory(symbol, days);
    if (history.length === 0) throw new Error('No data returned');
    res.json(history);
  } catch (err) {
    console.warn(`Alpha Vantage history failed for ${symbol}, using mock:`, err.message);
    res.json(getMockHistory(symbol, days));
  }
});
