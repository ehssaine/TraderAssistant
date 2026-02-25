function randomBetween(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

export function getMockPrices() {
  return {
    gold: { price: randomBetween(2630, 2670), change: randomBetween(-15, 15), changePercent: randomBetween(-0.6, 0.6) },
    silver: { price: randomBetween(30.5, 32.0), change: randomBetween(-0.5, 0.5), changePercent: randomBetween(-1.5, 1.5) },
    dxy: { price: randomBetween(103.5, 105.0), change: randomBetween(-0.5, 0.5), changePercent: randomBetween(-0.5, 0.5) },
  };
}

export function getMockHistory(symbol, days = 90) {
  const basePrices = { gold: 2650, silver: 31.5, dxy: 104.2 };
  const volatility = { gold: 0.008, silver: 0.015, dxy: 0.003 };
  const base = basePrices[symbol] || 2650;
  const vol = volatility[symbol] || 0.008;

  const data = [];
  let price = base;
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * 86400000).toISOString().split('T')[0];
    const open = price;
    const high = open * (1 + Math.random() * vol);
    const low = open * (1 - Math.random() * vol);
    const close = randomBetween(low, high);
    price = close;
    data.push({
      date,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 50000 + 10000),
    });
  }
  return data;
}

export function getMockCalendar() {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);

  return [
    { id: '1', date: offsetDate(weekStart, 1), time: '08:30', event: 'CPI m/m', currency: 'USD', impact: 'high', forecast: '0.3%', previous: '0.2%', actual: null },
    { id: '2', date: offsetDate(weekStart, 1), time: '08:30', event: 'Core CPI m/m', currency: 'USD', impact: 'high', forecast: '0.2%', previous: '0.3%', actual: null },
    { id: '3', date: offsetDate(weekStart, 2), time: '14:00', event: 'FOMC Meeting Minutes', currency: 'USD', impact: 'high', forecast: '-', previous: '-', actual: null },
    { id: '4', date: offsetDate(weekStart, 3), time: '08:30', event: 'Initial Jobless Claims', currency: 'USD', impact: 'medium', forecast: '215K', previous: '218K', actual: null },
    { id: '5', date: offsetDate(weekStart, 3), time: '08:30', event: 'PPI m/m', currency: 'USD', impact: 'medium', forecast: '0.1%', previous: '0.2%', actual: null },
    { id: '6', date: offsetDate(weekStart, 4), time: '08:30', event: 'Retail Sales m/m', currency: 'USD', impact: 'high', forecast: '0.4%', previous: '0.6%', actual: null },
    { id: '7', date: offsetDate(weekStart, 4), time: '10:00', event: 'UoM Consumer Sentiment', currency: 'USD', impact: 'medium', forecast: '78.5', previous: '79.4', actual: null },
  ];
}

function offsetDate(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function getMockCOT() {
  const weeks = 12;
  const dates = Array.from({ length: weeks }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (weeks - 1 - i) * 7);
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  });

  return {
    gold: {
      dates,
      commercials: [120, 115, 110, 105, 108, 112, 118, 125, 130, 128, 122, 119].map(v => -v * 1000),
      nonCommercials: [180, 185, 190, 195, 192, 188, 182, 175, 170, 172, 178, 181].map(v => v * 1000),
      openInterest: [520, 525, 530, 535, 528, 522, 518, 515, 512, 516, 520, 524].map(v => v * 1000),
    },
    silver: {
      dates,
      commercials: [50, 48, 45, 42, 44, 46, 49, 52, 54, 53, 51, 49].map(v => -v * 1000),
      nonCommercials: [70, 72, 75, 78, 76, 74, 71, 68, 66, 67, 69, 70].map(v => v * 1000),
      openInterest: [150, 152, 155, 158, 156, 153, 150, 148, 146, 148, 150, 152].map(v => v * 1000),
    },
  };
}

export function getMockFedWatch() {
  return [
    { meeting: 'Mar 2026', holdProb: 65, cutProb: 30, hikeProb: 5, impliedRate: 4.375 },
    { meeting: 'May 2026', holdProb: 40, cutProb: 55, hikeProb: 5, impliedRate: 4.25 },
    { meeting: 'Jun 2026', holdProb: 30, cutProb: 60, hikeProb: 10, impliedRate: 4.125 },
    { meeting: 'Jul 2026', holdProb: 25, cutProb: 65, hikeProb: 10, impliedRate: 4.0 },
  ];
}
