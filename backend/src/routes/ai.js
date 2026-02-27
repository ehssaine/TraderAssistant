import { Router } from 'express';
import pool from '../db/index.js';
import { summarizeWeekly, summarizeDaily } from '../services/aiSummary.js';
import { getMockCalendar, getMockCOT, getMockFedWatch } from '../services/mockMarketData.js';

export const aiRoutes = Router();

// ── Generate Weekly Summary ──────────────────────────────────────────────

aiRoutes.post('/ai/summary/weekly', async (req, res) => {
  try {
    const { weeklyPlan, calendarNotes } = req.body;

    // Gather context from DB + market data
    const [tradesRes, journalRes] = await Promise.all([
      pool.query("SELECT * FROM trades ORDER BY created_at DESC LIMIT 20"),
      pool.query("SELECT * FROM journal_entries ORDER BY created_at DESC LIMIT 5"),
    ]);

    const calendarEvents = getMockCalendar();
    const cotData = getMockCOT();
    const fedWatch = getMockFedWatch();

    const result = await summarizeWeekly({
      weeklyPlan: weeklyPlan || {},
      calendarEvents,
      cotData,
      fedWatch,
      trades: tradesRes.rows,
      journalEntries: journalRes.rows,
    });

    // Save to DB
    await pool.query(
      `INSERT INTO ai_summaries (type, summary, context_data, model)
       VALUES ($1, $2, $3, $4)`,
      ['weekly', result.summary, JSON.stringify({ weeklyPlan, calendarNotes }), result.model]
    );

    res.json(result);
  } catch (err) {
    console.error('AI weekly summary error:', err.message);
    res.status(500).json({ error: 'Failed to generate weekly summary' });
  }
});

// ── Generate Daily Summary ───────────────────────────────────────────────

aiRoutes.post('/ai/summary/daily', async (req, res) => {
  try {
    const { eodReview, weeklyPlan } = req.body;

    const [tradesRes, newsData] = await Promise.all([
      pool.query("SELECT * FROM trades ORDER BY created_at DESC LIMIT 10"),
      import('../services/alphaVantage.js').then(m => m.getNews()).catch(() => []),
    ]);

    const result = await summarizeDaily({
      trades: tradesRes.rows,
      eodReview: eodReview || {},
      news: newsData,
      weeklyPlan: weeklyPlan || {},
    });

    // Save to DB
    await pool.query(
      `INSERT INTO ai_summaries (type, summary, context_data, model)
       VALUES ($1, $2, $3, $4)`,
      ['daily', result.summary, JSON.stringify({ eodReview }), result.model]
    );

    res.json(result);
  } catch (err) {
    console.error('AI daily summary error:', err.message);
    res.status(500).json({ error: 'Failed to generate daily summary' });
  }
});

// ── Get Past Summaries ───────────────────────────────────────────────────

aiRoutes.get('/ai/summaries', async (req, res) => {
  const { type } = req.query;
  try {
    let query = 'SELECT * FROM ai_summaries';
    const params = [];
    if (type) {
      query += ' WHERE type = $1';
      params.push(type);
    }
    query += ' ORDER BY created_at DESC LIMIT 20';

    const { rows } = await pool.query(query, params);
    res.json(rows.map(r => ({
      id: r.id,
      type: r.type,
      summary: r.summary,
      model: r.model,
      createdAt: r.created_at,
    })));
  } catch (err) {
    console.error('GET /ai/summaries error:', err.message);
    res.status(500).json({ error: 'Failed to fetch summaries' });
  }
});

// ── Delete a Summary ─────────────────────────────────────────────────────

aiRoutes.delete('/ai/summaries/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM ai_summaries WHERE id=$1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Summary not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /ai/summaries error:', err.message);
    res.status(500).json({ error: 'Failed to delete summary' });
  }
});
