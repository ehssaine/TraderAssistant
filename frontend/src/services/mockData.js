import { format, subDays, addDays, startOfWeek, endOfWeek } from 'date-fns';

const now = new Date();

function randomBetween(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateOHLC(basePrice, days, volatility = 0.01) {
  const data = [];
  let price = basePrice;
  for (let i = days; i >= 0; i--) {
    const date = subDays(now, i);
    const open = price;
    const high = open * (1 + Math.random() * volatility);
    const low = open * (1 - Math.random() * volatility);
    const close = randomBetween(low, high);
    price = close;
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 50000 + 10000),
    });
  }
  return data;
}

export const goldPriceHistory = generateOHLC(2650, 90, 0.008);
export const silverPriceHistory = generateOHLC(31.5, 90, 0.015);
export const dxyHistory = generateOHLC(104.2, 90, 0.003);

export const currentPrices = {
  gold: { price: goldPriceHistory.at(-1).close, change: randomBetween(-1.5, 1.5), changePercent: randomBetween(-0.08, 0.08) },
  silver: { price: silverPriceHistory.at(-1).close, change: randomBetween(-0.3, 0.3), changePercent: randomBetween(-0.1, 0.1) },
  dxy: { price: dxyHistory.at(-1).close, change: randomBetween(-0.5, 0.5), changePercent: randomBetween(-0.05, 0.05) },
};

export const economicCalendar = [
  { id: '1', date: format(addDays(startOfWeek(now, { weekStartsOn: 1 }), 1), 'yyyy-MM-dd'), time: '08:30', event: 'CPI m/m', currency: 'USD', impact: 'high', forecast: '0.3%', previous: '0.2%', actual: null },
  { id: '2', date: format(addDays(startOfWeek(now, { weekStartsOn: 1 }), 1), 'yyyy-MM-dd'), time: '08:30', event: 'Core CPI m/m', currency: 'USD', impact: 'high', forecast: '0.2%', previous: '0.3%', actual: null },
  { id: '3', date: format(addDays(startOfWeek(now, { weekStartsOn: 1 }), 2), 'yyyy-MM-dd'), time: '14:00', event: 'FOMC Meeting Minutes', currency: 'USD', impact: 'high', forecast: '-', previous: '-', actual: null },
  { id: '4', date: format(addDays(startOfWeek(now, { weekStartsOn: 1 }), 3), 'yyyy-MM-dd'), time: '08:30', event: 'Initial Jobless Claims', currency: 'USD', impact: 'medium', forecast: '215K', previous: '218K', actual: null },
  { id: '5', date: format(addDays(startOfWeek(now, { weekStartsOn: 1 }), 3), 'yyyy-MM-dd'), time: '08:30', event: 'PPI m/m', currency: 'USD', impact: 'medium', forecast: '0.1%', previous: '0.2%', actual: null },
  { id: '6', date: format(addDays(startOfWeek(now, { weekStartsOn: 1 }), 4), 'yyyy-MM-dd'), time: '08:30', event: 'Retail Sales m/m', currency: 'USD', impact: 'high', forecast: '0.4%', previous: '0.6%', actual: null },
  { id: '7', date: format(addDays(startOfWeek(now, { weekStartsOn: 1 }), 4), 'yyyy-MM-dd'), time: '10:00', event: 'Prelim UoM Consumer Sentiment', currency: 'USD', impact: 'medium', forecast: '78.5', previous: '79.4', actual: null },
  { id: '8', date: format(addDays(startOfWeek(now, { weekStartsOn: 1 }), 0), 'yyyy-MM-dd'), time: '10:00', event: 'ISM Manufacturing PMI', currency: 'USD', impact: 'high', forecast: '49.5', previous: '49.3', actual: null },
];

export const cotReport = {
  gold: {
    dates: Array.from({ length: 12 }, (_, i) => format(subDays(now, (11 - i) * 7), 'MMM dd')),
    commercials: [120000, 115000, 110000, 105000, 108000, 112000, 118000, 125000, 130000, 128000, 122000, 119000].map(v => -v),
    nonCommercials: [180000, 185000, 190000, 195000, 192000, 188000, 182000, 175000, 170000, 172000, 178000, 181000],
    openInterest: [520000, 525000, 530000, 535000, 528000, 522000, 518000, 515000, 512000, 516000, 520000, 524000],
  },
  silver: {
    dates: Array.from({ length: 12 }, (_, i) => format(subDays(now, (11 - i) * 7), 'MMM dd')),
    commercials: [50000, 48000, 45000, 42000, 44000, 46000, 49000, 52000, 54000, 53000, 51000, 49500].map(v => -v),
    nonCommercials: [70000, 72000, 75000, 78000, 76000, 74000, 71000, 68000, 66000, 67000, 69000, 70500],
    openInterest: [150000, 152000, 155000, 158000, 156000, 153000, 150000, 148000, 146000, 148000, 150000, 152000],
  },
};

export const fedWatchData = [
  { meeting: 'Mar 2026', holdProb: 65, cutProb: 30, hikeProb: 5, impliedRate: 4.375 },
  { meeting: 'May 2026', holdProb: 40, cutProb: 55, hikeProb: 5, impliedRate: 4.25 },
  { meeting: 'Jun 2026', holdProb: 30, cutProb: 60, hikeProb: 10, impliedRate: 4.125 },
  { meeting: 'Jul 2026', holdProb: 25, cutProb: 65, hikeProb: 10, impliedRate: 4.0 },
];

export const sampleTradeHistory = [
  { id: '1', date: format(subDays(now, 14), 'yyyy-MM-dd'), symbol: 'XAU/USD', direction: 'long', entry: 2620.50, target: 2660.00, stop: 2605.00, exit: 2655.30, pnl: 2.1, riskReward: 2.24, result: 'win', notes: 'Breakout above weekly resistance with strong momentum' },
  { id: '2', date: format(subDays(now, 12), 'yyyy-MM-dd'), symbol: 'XAG/USD', direction: 'long', entry: 30.85, target: 31.80, stop: 30.40, exit: 31.65, pnl: 1.8, riskReward: 1.78, result: 'win', notes: 'Silver followed gold breakout, good correlation play' },
  { id: '3', date: format(subDays(now, 10), 'yyyy-MM-dd'), symbol: 'XAU/USD', direction: 'short', entry: 2658.00, target: 2625.00, stop: 2672.00, exit: 2670.50, pnl: -0.9, riskReward: 2.36, result: 'loss', notes: 'Counter-trend trade, stopped out on news spike' },
  { id: '4', date: format(subDays(now, 7), 'yyyy-MM-dd'), symbol: 'XAU/USD', direction: 'long', entry: 2635.00, target: 2670.00, stop: 2620.00, exit: 2668.00, pnl: 1.5, riskReward: 2.2, result: 'win', notes: 'Pullback to 20 EMA in uptrend, FOMC dovish bias confirmed' },
  { id: '5', date: format(subDays(now, 5), 'yyyy-MM-dd'), symbol: 'XAG/USD', direction: 'short', entry: 31.20, target: 30.50, stop: 31.55, exit: 31.50, pnl: -0.7, riskReward: 2.0, result: 'loss', notes: 'DXY weakness unexpected, silver held support' },
  { id: '6', date: format(subDays(now, 3), 'yyyy-MM-dd'), symbol: 'XAU/USD', direction: 'long', entry: 2640.00, target: 2680.00, stop: 2625.00, exit: 2675.00, pnl: 1.9, riskReward: 2.33, result: 'win', notes: 'NFP miss drove gold higher, scaled out at target zone' },
  { id: '7', date: format(subDays(now, 1), 'yyyy-MM-dd'), symbol: 'XAU/USD', direction: 'long', entry: 2650.00, target: 2690.00, stop: 2635.00, exit: 2682.00, pnl: 1.6, riskReward: 2.13, result: 'win', notes: 'Continuation of weekly uptrend, clean setup' },
];

export const performanceData = {
  weeklyReturns: Array.from({ length: 12 }, (_, i) => ({
    week: format(subDays(now, (11 - i) * 7), 'MMM dd'),
    return: randomBetween(-1.5, 3.0),
    target: 1.5,
  })),
  monthlyStats: [
    { month: 'Sep', winRate: 68, trades: 22, pnl: 5.2, sharpe: 1.62, maxDrawdown: 2.1 },
    { month: 'Oct', winRate: 72, trades: 19, pnl: 6.8, sharpe: 1.85, maxDrawdown: 1.8 },
    { month: 'Nov', winRate: 65, trades: 24, pnl: 4.1, sharpe: 1.35, maxDrawdown: 3.2 },
    { month: 'Dec', winRate: 70, trades: 18, pnl: 5.5, sharpe: 1.55, maxDrawdown: 2.4 },
    { month: 'Jan', winRate: 74, trades: 21, pnl: 7.2, sharpe: 1.92, maxDrawdown: 1.5 },
    { month: 'Feb', winRate: 67, trades: 16, pnl: 4.8, sharpe: 1.48, maxDrawdown: 2.8 },
  ],
};

export const newsItems = [
  { id: '1', time: '2h ago', title: 'Gold Hits 3-Month High on Dovish Fed Expectations', source: 'Reuters', impact: 'high', sentiment: 'bullish', url: '#' },
  { id: '2', time: '4h ago', title: 'US Dollar Index Falls Below Key Support Level', source: 'Bloomberg', impact: 'high', sentiment: 'bullish', url: '#' },
  { id: '3', time: '5h ago', title: 'Silver Industrial Demand Rises on Green Energy Push', source: 'Kitco', impact: 'medium', sentiment: 'bullish', url: '#' },
  { id: '4', time: '8h ago', title: 'Central Banks Continue Gold Buying Spree in Q1', source: 'World Gold Council', impact: 'medium', sentiment: 'bullish', url: '#' },
  { id: '5', time: '12h ago', title: 'Treasury Yields Drop After Weak Jobs Data', source: 'CNBC', impact: 'high', sentiment: 'bullish', url: '#' },
  { id: '6', time: '1d ago', title: 'Geopolitical Tensions in Middle East Boost Safe Haven Demand', source: 'Reuters', impact: 'medium', sentiment: 'bullish', url: '#' },
  { id: '7', time: '1d ago', title: 'Silver Supply Deficit Widens for Third Consecutive Year', source: 'Silver Institute', impact: 'medium', sentiment: 'bullish', url: '#' },
];

export const watchlistItems = [
  { symbol: 'XAU/USD', name: 'Gold Spot', price: currentPrices.gold.price, change: currentPrices.gold.changePercent },
  { symbol: 'XAG/USD', name: 'Silver Spot', price: currentPrices.silver.price, change: currentPrices.silver.changePercent },
  { symbol: 'GLD', name: 'SPDR Gold Shares', price: 245.30, change: randomBetween(-0.5, 0.5) },
  { symbol: 'SLV', name: 'iShares Silver Trust', price: 28.15, change: randomBetween(-0.8, 0.8) },
  { symbol: 'GDX', name: 'Gold Miners ETF', price: 36.80, change: randomBetween(-1.2, 1.2) },
  { symbol: 'DXY', name: 'US Dollar Index', price: currentPrices.dxy.price, change: currentPrices.dxy.changePercent },
];
