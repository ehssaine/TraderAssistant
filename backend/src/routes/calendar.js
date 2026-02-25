import { Router } from 'express';
import { getMockCalendar, getMockCOT, getMockFedWatch } from '../services/mockMarketData.js';

export const calendarRoutes = Router();

calendarRoutes.get('/calendar', (req, res) => {
  res.json(getMockCalendar());
});

calendarRoutes.get('/cot', (req, res) => {
  res.json(getMockCOT());
});

calendarRoutes.get('/fedwatch', (req, res) => {
  res.json(getMockFedWatch());
});
