import { Router } from 'express';

export const newsRoutes = Router();

newsRoutes.get('/news', (req, res) => {
  const news = [
    { id: '1', time: '2h ago', title: 'Gold Hits 3-Month High on Dovish Fed Expectations', source: 'Reuters', impact: 'high', sentiment: 'bullish' },
    { id: '2', time: '4h ago', title: 'US Dollar Index Falls Below Key Support Level', source: 'Bloomberg', impact: 'high', sentiment: 'bullish' },
    { id: '3', time: '5h ago', title: 'Silver Industrial Demand Rises on Green Energy Push', source: 'Kitco', impact: 'medium', sentiment: 'bullish' },
    { id: '4', time: '8h ago', title: 'Central Banks Continue Gold Buying Spree in Q1', source: 'World Gold Council', impact: 'medium', sentiment: 'bullish' },
    { id: '5', time: '12h ago', title: 'Treasury Yields Drop After Weak Jobs Data', source: 'CNBC', impact: 'high', sentiment: 'bullish' },
    { id: '6', time: '1d ago', title: 'Geopolitical Tensions Boost Safe Haven Demand', source: 'Reuters', impact: 'medium', sentiment: 'bullish' },
    { id: '7', time: '1d ago', title: 'Silver Supply Deficit Widens for Third Year', source: 'Silver Institute', impact: 'medium', sentiment: 'bullish' },
  ];
  res.json(news);
});
