import { Router } from 'express';
import { getMockPrices, getMockHistory } from '../services/mockMarketData.js';

export const priceRoutes = Router();

priceRoutes.get('/prices', (req, res) => {
  res.json(getMockPrices());
});

priceRoutes.get('/history/:symbol', (req, res) => {
  const { symbol } = req.params;
  const days = parseInt(req.query.days) || 90;
  res.json(getMockHistory(symbol, days));
});
