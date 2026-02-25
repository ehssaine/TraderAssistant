export function calculatePositionSize(accountSize, riskPercent, entryPrice, stopLoss) {
  const riskAmount = accountSize * (riskPercent / 100);
  const pipDistance = Math.abs(entryPrice - stopLoss);
  if (pipDistance === 0) return { positionSize: 0, riskAmount: 0, lots: 0 };
  const positionSize = riskAmount / pipDistance;
  const lots = positionSize / 100;
  return { positionSize: Math.round(positionSize * 100) / 100, riskAmount: Math.round(riskAmount * 100) / 100, lots: Math.round(lots * 100) / 100 };
}

export function calculateRiskReward(entry, target, stop) {
  const risk = Math.abs(entry - stop);
  const reward = Math.abs(target - entry);
  if (risk === 0) return 0;
  return Math.round((reward / risk) * 100) / 100;
}

export function calculateSharpeRatio(returns, riskFreeRate = 0) {
  if (!returns.length) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  if (stdDev === 0) return 0;
  return Math.round(((mean - riskFreeRate) / stdDev) * 100) / 100;
}

export function calculateATRStopLoss(atr, multiplier = 1.5, entryPrice, direction = 'long') {
  const stop = direction === 'long' ? entryPrice - atr * multiplier : entryPrice + atr * multiplier;
  return Math.round(stop * 100) / 100;
}

export function formatCurrency(value, decimals = 2) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
}

export function formatPercent(value, decimals = 2) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function formatNumber(value, decimals = 2) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
}

export function getRandomQuote(quotes) {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function classifyVolatility(atr, avgAtr) {
  const ratio = atr / avgAtr;
  if (ratio < 0.7) return 'low';
  if (ratio > 1.3) return 'high';
  return 'normal';
}
