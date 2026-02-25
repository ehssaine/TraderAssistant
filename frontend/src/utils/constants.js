export const GOLD_SYMBOL = 'XAU/USD';
export const SILVER_SYMBOL = 'XAG/USD';
export const DXY_SYMBOL = 'DXY';

export const TARGET_WEEKLY_RETURN_MIN = 1;
export const TARGET_WEEKLY_RETURN_MAX = 2;
export const MAX_RISK_PER_TRADE = 1;
export const MAX_PORTFOLIO_RISK = 2;
export const MAX_DRAWDOWN_PER_TRADE = 5;
export const GOLD_SILVER_CORRELATION = 0.8;
export const SILVER_BETA = 1.5;
export const IDEAL_SHARPE_RATIO = 1.5;

export const TRADING_QUOTES = [
  "The goal of a successful trader is to make the best trades. Money is secondary. — Alexander Elder",
  "Risk comes from not knowing what you're doing. — Warren Buffett",
  "In trading, the impossible happens about twice a year. — Henri M. Simoes",
  "The market is a device for transferring money from the impatient to the patient. — Warren Buffett",
  "Plan the trade, trade the plan.",
  "Discipline is the bridge between goals and accomplishment. — Jim Rohn",
  "Cut your losses short, let your winners run.",
  "The trend is your friend until the end when it bends. — Ed Seykota",
];

export const PSYCHOLOGY_TIPS = [
  { title: "No Revenge Trading", text: "After a loss, step away. Never trade to recover losses emotionally." },
  { title: "Take Breaks", text: "Step away from screens every 90 minutes. Fresh eyes see better setups." },
  { title: "Stick to the Plan", text: "If a trade doesn't fit your weekly bias and daily setup, skip it." },
  { title: "Size Matters", text: "Never risk more than 1% per trade. Survival is the first rule." },
  { title: "Journal Everything", text: "Write down every trade with reasons. Review weekly to find patterns." },
  { title: "Accept Uncertainty", text: "No setup is 100%. Focus on probability and risk-reward, not prediction." },
];

export const HIGH_IMPACT_EVENTS = ['NFP', 'CPI', 'FOMC', 'GDP', 'PCE', 'PPI', 'Retail Sales', 'ISM', 'Fed Chair'];

export const TIMEFRAMES = ['1M', '5M', '15M', '1H', '4H', 'Daily', 'Weekly'];

export const CHART_INDICATORS = [
  { id: 'ma200', label: 'MA 200', category: 'Trend' },
  { id: 'ma50', label: 'MA 50', category: 'Trend' },
  { id: 'ma20', label: 'MA 20', category: 'Trend' },
  { id: 'rsi', label: 'RSI (14)', category: 'Momentum' },
  { id: 'macd', label: 'MACD', category: 'Momentum' },
  { id: 'atr', label: 'ATR (14)', category: 'Volatility' },
  { id: 'bb', label: 'Bollinger Bands', category: 'Volatility' },
  { id: 'fib', label: 'Fibonacci Retracement', category: 'Support/Resistance' },
];
