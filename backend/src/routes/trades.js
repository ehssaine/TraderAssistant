import { Router } from 'express';
import pool from '../db/index.js';
import { getAllPrices } from '../services/alphaVantage.js';

export const tradeRoutes = Router();

// ── Trades CRUD ──────────────────────────────────────────────────────────

tradeRoutes.get('/trades', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM trades ORDER BY created_at DESC'
    );
    res.json(rows.map(formatTrade));
  } catch (err) {
    console.error('GET /trades error:', err.message);
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

tradeRoutes.post('/trades', async (req, res) => {
  const { date, symbol, direction, entry, target, stop, exit, pnl, riskReward, result, notes } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO trades (date, symbol, direction, entry, target, stop, exit_price, pnl, risk_reward, result, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [date || new Date(), symbol, direction, entry, target, stop, exit, pnl, riskReward, result || 'open', notes]
    );
    res.status(201).json(formatTrade(rows[0]));
  } catch (err) {
    console.error('POST /trades error:', err.message);
    res.status(500).json({ error: 'Failed to create trade' });
  }
});

tradeRoutes.put('/trades/:id', async (req, res) => {
  const { id } = req.params;
  const { date, symbol, direction, entry, target, stop, exit, pnl, riskReward, result, notes } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE trades SET
        date=$1, symbol=$2, direction=$3, entry=$4, target=$5, stop=$6,
        exit_price=$7, pnl=$8, risk_reward=$9, result=$10, notes=$11, updated_at=NOW()
       WHERE id=$12 RETURNING *`,
      [date, symbol, direction, entry, target, stop, exit, pnl, riskReward, result, notes, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Trade not found' });
    res.json(formatTrade(rows[0]));
  } catch (err) {
    console.error('PUT /trades error:', err.message);
    res.status(500).json({ error: 'Failed to update trade' });
  }
});

tradeRoutes.delete('/trades/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM trades WHERE id=$1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Trade not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /trades error:', err.message);
    res.status(500).json({ error: 'Failed to delete trade' });
  }
});

// ── Journal CRUD ─────────────────────────────────────────────────────────

tradeRoutes.get('/journal', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM journal_entries ORDER BY created_at DESC'
    );
    res.json(rows.map(formatJournal));
  } catch (err) {
    console.error('GET /journal error:', err.message);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

tradeRoutes.post('/journal', async (req, res) => {
  const { title, content, type, tags } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO journal_entries (title, content, type, tags)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [title, content, type || 'note', tags || []]
    );
    res.status(201).json(formatJournal(rows[0]));
  } catch (err) {
    console.error('POST /journal error:', err.message);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

tradeRoutes.put('/journal/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, type, tags } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE journal_entries SET title=$1, content=$2, type=$3, tags=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [title, content, type, tags || [], id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Entry not found' });
    res.json(formatJournal(rows[0]));
  } catch (err) {
    console.error('PUT /journal error:', err.message);
    res.status(500).json({ error: 'Failed to update journal entry' });
  }
});

tradeRoutes.delete('/journal/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM journal_entries WHERE id=$1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Entry not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /journal error:', err.message);
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});

// ── Watchlist (with live prices) ─────────────────────────────────────────

tradeRoutes.get('/watchlist', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT symbol, name FROM watchlist ORDER BY added_at');
    // Enrich with live prices
    let prices = {};
    try {
      prices = await getAllPrices();
    } catch { /* ignore */ }

    const priceMap = {
      'XAU/USD': { price: prices.gold?.price || 2650, change: prices.gold?.changePercent || 0 },
      'XAG/USD': { price: prices.silver?.price || 31.5, change: prices.silver?.changePercent || 0 },
      'DXY':     { price: prices.dxy?.price || 104, change: prices.dxy?.changePercent || 0 },
    };

    const watchlist = rows.map(r => ({
      symbol: r.symbol,
      name: r.name,
      price: priceMap[r.symbol]?.price || 0,
      change: priceMap[r.symbol]?.change || 0,
    }));

    res.json(watchlist);
  } catch (err) {
    console.error('GET /watchlist error:', err.message);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// ── Performance (computed from DB trades) ────────────────────────────────

tradeRoutes.get('/performance', async (req, res) => {
  try {
    // Get all closed trades for performance calculations
    const { rows: trades } = await pool.query(
      "SELECT * FROM trades WHERE result IN ('win','loss','breakeven') ORDER BY date"
    );

    // Weekly returns (last 12 weeks)
    const weeklyReturns = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - i * 7 - now.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const weekTrades = trades.filter(t => {
        const d = new Date(t.date);
        return d >= weekStart && d <= weekEnd;
      });
      const ret = weekTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
      weeklyReturns.push({
        week: weekStart.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
        return: parseFloat(ret.toFixed(2)),
        target: 1.5,
      });
    }

    // Monthly stats (last 6 months)
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const monthTrades = trades.filter(t => {
        const td = new Date(t.date);
        return td >= d && td <= monthEnd;
      });
      const wins = monthTrades.filter(t => t.result === 'win').length;
      const total = monthTrades.length;
      const pnl = monthTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
      monthlyStats.push({
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
        trades: total,
        pnl: parseFloat(pnl.toFixed(2)),
        sharpe: 0,
        maxDrawdown: 0,
      });
    }

    res.json({ weeklyReturns, monthlyStats });
  } catch (err) {
    console.error('GET /performance error:', err.message);
    res.status(500).json({ error: 'Failed to compute performance' });
  }
});

// ── Formatters ───────────────────────────────────────────────────────────

function formatTrade(row) {
  return {
    id: String(row.id),
    date: row.date,
    symbol: row.symbol,
    direction: row.direction,
    entry: parseFloat(row.entry),
    target: row.target ? parseFloat(row.target) : null,
    stop: row.stop ? parseFloat(row.stop) : null,
    exit: row.exit_price ? parseFloat(row.exit_price) : null,
    pnl: row.pnl ? parseFloat(row.pnl) : null,
    riskReward: row.risk_reward ? parseFloat(row.risk_reward) : null,
    result: row.result,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function formatJournal(row) {
  return {
    id: String(row.id),
    title: row.title,
    content: row.content,
    type: row.type,
    tags: row.tags || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
