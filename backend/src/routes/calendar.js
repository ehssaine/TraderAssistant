import { Router } from 'express';
import { getMockCalendar, getMockCOT, getMockFedWatch } from '../services/mockMarketData.js';

export const calendarRoutes = Router();

// Economic calendar, COT, and FedWatch data
// Alpha Vantage free tier doesn't cover these endpoints,
// so we keep the generated mock data which is date-aware and realistic.

calendarRoutes.get('/calendar', (req, res) => {
  res.json(getMockCalendar());
});

calendarRoutes.get('/cot', (req, res) => {
  res.json(getMockCOT());
});

calendarRoutes.get('/fedwatch', (req, res) => {
  res.json(getMockFedWatch());
});
