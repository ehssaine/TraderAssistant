import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

function getClient() {
  if (!ANTHROPIC_KEY) return null;
  return new Anthropic({ apiKey: ANTHROPIC_KEY });
}

export async function summarizeWeekly({ weeklyPlan, calendarEvents, cotData, fedWatch, trades, journalEntries }) {
  const client = getClient();
  const context = buildWeeklyContext({ weeklyPlan, calendarEvents, cotData, fedWatch, trades, journalEntries });

  if (!client) {
    return generateRuleBasedWeeklySummary({ weeklyPlan, calendarEvents, cotData, fedWatch, trades, journalEntries });
  }

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `You are a professional trading analyst assistant for a gold & silver trader. Summarize the following weekly analysis data into a concise, actionable trading brief. Focus on key takeaways, risk factors, and the trading plan for the week ahead. Use bullet points and keep it under 400 words.

${context}`
    }],
  });

  return {
    summary: message.content[0].text,
    generatedAt: new Date().toISOString(),
    type: 'weekly',
    model: 'claude-haiku',
  };
}

export async function summarizeDaily({ trades, eodReview, news, weeklyPlan }) {
  const client = getClient();
  const context = buildDailyContext({ trades, eodReview, news, weeklyPlan });

  if (!client) {
    return generateRuleBasedDailySummary({ trades, eodReview, news, weeklyPlan });
  }

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `You are a professional trading analyst assistant for a gold & silver trader. Summarize the following daily trading session. Highlight what went well, what didn't, key lessons, and preparation notes for tomorrow. Use bullet points and keep it under 300 words.

${context}`
    }],
  });

  return {
    summary: message.content[0].text,
    generatedAt: new Date().toISOString(),
    type: 'daily',
    model: 'claude-haiku',
  };
}

// ── Context Builders ─────────────────────────────────────────────────────

function buildWeeklyContext({ weeklyPlan, calendarEvents, cotData, fedWatch, trades, journalEntries }) {
  const parts = [];

  if (weeklyPlan && (weeklyPlan.bias || weeklyPlan.keyLevels || weeklyPlan.catalysts || weeklyPlan.notes)) {
    parts.push(`## Weekly Plan
- Bias: ${weeklyPlan.bias || 'Not set'}
- Key Levels: ${weeklyPlan.keyLevels || 'None specified'}
- Catalysts: ${weeklyPlan.catalysts || 'None specified'}
- Notes: ${weeklyPlan.notes || 'None'}`);
  }

  if (calendarEvents?.length) {
    const highImpact = calendarEvents.filter(e => e.impact === 'high');
    parts.push(`## High-Impact Economic Events This Week
${highImpact.map(e => `- ${e.date} ${e.time}: ${e.event} (Forecast: ${e.forecast}, Previous: ${e.previous})`).join('\n')}`);
  }

  if (fedWatch?.length) {
    parts.push(`## Fed Watch Probabilities
${fedWatch.map(f => `- ${f.meeting}: Hold ${f.holdProb}%, Cut ${f.cutProb}%, Hike ${f.hikeProb}% (Implied rate: ${f.impliedRate}%)`).join('\n')}`);
  }

  if (cotData?.gold) {
    const g = cotData.gold;
    const latestIdx = g.nonCommercials.length - 1;
    parts.push(`## COT Positioning (Latest)
- Gold: Non-commercials net long ${g.nonCommercials[latestIdx]?.toLocaleString()}, Commercials ${g.commercials[latestIdx]?.toLocaleString()}
- Open Interest: ${g.openInterest[latestIdx]?.toLocaleString()}`);
  }

  if (trades?.length) {
    const weekTrades = trades.slice(0, 20);
    const wins = weekTrades.filter(t => t.result === 'win').length;
    const losses = weekTrades.filter(t => t.result === 'loss').length;
    const totalPnl = weekTrades.reduce((s, t) => s + (parseFloat(t.pnl) || 0), 0);
    parts.push(`## Recent Trades (last ${weekTrades.length})
- Wins: ${wins}, Losses: ${losses}, Win Rate: ${weekTrades.length > 0 ? Math.round((wins / weekTrades.length) * 100) : 0}%
- Total P&L: ${totalPnl.toFixed(2)}%
${weekTrades.slice(0, 5).map(t => `- ${t.symbol} ${t.direction} @ ${t.entry} → ${t.result} (${t.pnl || 0}%) - ${t.notes || ''}`).join('\n')}`);
  }

  if (journalEntries?.length) {
    parts.push(`## Recent Journal Entries
${journalEntries.slice(0, 3).map(e => `- [${e.type}] ${e.title}: ${(e.content || '').slice(0, 150)}`).join('\n')}`);
  }

  return parts.join('\n\n') || 'No data available for this week.';
}

function buildDailyContext({ trades, eodReview, news, weeklyPlan }) {
  const parts = [];

  if (weeklyPlan?.bias) {
    parts.push(`## Weekly Bias: ${weeklyPlan.bias}`);
  }

  if (news?.length) {
    parts.push(`## Today's Key News
${news.slice(0, 5).map(n => `- [${n.sentiment}] ${n.title} (${n.source})`).join('\n')}`);
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTrades = trades?.filter(t => t.date === todayStr || t.date?.startsWith?.(todayStr)) || [];

  if (todayTrades.length) {
    const wins = todayTrades.filter(t => t.result === 'win').length;
    const losses = todayTrades.filter(t => t.result === 'loss').length;
    const pnl = todayTrades.reduce((s, t) => s + (parseFloat(t.pnl) || 0), 0);
    parts.push(`## Today's Trades (${todayTrades.length})
- Wins: ${wins}, Losses: ${losses}
- Net P&L: ${pnl.toFixed(2)}%
${todayTrades.map(t => `- ${t.symbol} ${t.direction} @ ${t.entry} → ${t.result} (R:R ${t.riskReward || 'N/A'}) - ${t.notes || ''}`).join('\n')}`);
  } else if (trades?.length) {
    const recentTrades = trades.slice(0, 5);
    parts.push(`## Recent Trades
${recentTrades.map(t => `- ${t.date} ${t.symbol} ${t.direction} → ${t.result} (${t.pnl || 0}%)`).join('\n')}`);
  }

  if (eodReview) {
    parts.push(`## End-of-Day Review
- Mood: ${eodReview.mood || 'Not recorded'}
- Summary: ${eodReview.notes || 'No summary provided'}
- Lessons: ${eodReview.lessonsLearned || 'None recorded'}`);
  }

  return parts.join('\n\n') || 'No data available for today.';
}

// ── Rule-Based Fallback (no API key) ─────────────────────────────────────

function generateRuleBasedWeeklySummary({ weeklyPlan, calendarEvents, cotData, fedWatch, trades }) {
  const lines = ['## Weekly Analysis Summary\n'];

  if (weeklyPlan?.bias) {
    lines.push(`**Market Bias:** ${weeklyPlan.bias.charAt(0).toUpperCase() + weeklyPlan.bias.slice(1)}`);
  }
  if (weeklyPlan?.keyLevels) {
    lines.push(`**Key Levels:** ${weeklyPlan.keyLevels}`);
  }
  if (weeklyPlan?.catalysts) {
    lines.push(`**Catalysts:** ${weeklyPlan.catalysts}`);
  }

  const highImpact = calendarEvents?.filter(e => e.impact === 'high') || [];
  if (highImpact.length) {
    lines.push(`\n**High-Impact Events (${highImpact.length}):** ${highImpact.map(e => e.event).join(', ')}`);
  }

  if (fedWatch?.length) {
    const next = fedWatch[0];
    lines.push(`\n**Fed Watch (${next.meeting}):** ${next.cutProb}% chance of cut, ${next.holdProb}% hold`);
  }

  if (trades?.length) {
    const wins = trades.filter(t => t.result === 'win').length;
    const total = trades.filter(t => t.result !== 'open').length;
    const pnl = trades.reduce((s, t) => s + (parseFloat(t.pnl) || 0), 0);
    lines.push(`\n**Trading Performance:** ${wins}/${total} wins (${total > 0 ? Math.round((wins/total)*100) : 0}%), Net P&L: ${pnl.toFixed(2)}%`);
  }

  if (weeklyPlan?.notes) {
    lines.push(`\n**Notes:** ${weeklyPlan.notes}`);
  }

  lines.push('\n*Add your Anthropic API key (`ANTHROPIC_API_KEY`) to get AI-powered summaries.*');

  return {
    summary: lines.join('\n'),
    generatedAt: new Date().toISOString(),
    type: 'weekly',
    model: 'rule-based',
  };
}

function generateRuleBasedDailySummary({ trades, eodReview, news, weeklyPlan }) {
  const lines = ['## Daily Trading Summary\n'];
  const todayStr = new Date().toISOString().split('T')[0];

  if (weeklyPlan?.bias) {
    lines.push(`**Weekly Bias:** ${weeklyPlan.bias}`);
  }

  const todayTrades = trades?.filter(t => t.date === todayStr || t.date?.startsWith?.(todayStr)) || [];
  if (todayTrades.length) {
    const wins = todayTrades.filter(t => t.result === 'win').length;
    const losses = todayTrades.filter(t => t.result === 'loss').length;
    const pnl = todayTrades.reduce((s, t) => s + (parseFloat(t.pnl) || 0), 0);
    lines.push(`\n**Today's Results:** ${todayTrades.length} trades — ${wins} wins, ${losses} losses, Net P&L: ${pnl.toFixed(2)}%`);
    todayTrades.forEach(t => {
      lines.push(`- ${t.symbol} ${t.direction} @ ${t.entry} → ${t.result}${t.pnl ? ` (${t.pnl}%)` : ''}`);
    });
  } else {
    lines.push('\n**No trades recorded today.**');
  }

  if (eodReview?.mood) {
    lines.push(`\n**Mood:** ${eodReview.mood}`);
  }
  if (eodReview?.notes) {
    lines.push(`**Day Summary:** ${eodReview.notes}`);
  }
  if (eodReview?.lessonsLearned) {
    lines.push(`**Lessons:** ${eodReview.lessonsLearned}`);
  }

  if (news?.length) {
    const bullish = news.filter(n => n.sentiment === 'bullish').length;
    const bearish = news.filter(n => n.sentiment === 'bearish').length;
    lines.push(`\n**News Sentiment:** ${bullish} bullish, ${bearish} bearish out of ${news.length} items`);
  }

  lines.push('\n*Add your Anthropic API key (`ANTHROPIC_API_KEY`) to get AI-powered summaries.*');

  return {
    summary: lines.join('\n'),
    generatedAt: new Date().toISOString(),
    type: 'daily',
    model: 'rule-based',
  };
}
