import pool from './index.js';

const schema = `
  CREATE TABLE IF NOT EXISTS trades (
    id            SERIAL PRIMARY KEY,
    date          DATE NOT NULL DEFAULT CURRENT_DATE,
    symbol        VARCHAR(20) NOT NULL,
    direction     VARCHAR(10) NOT NULL CHECK (direction IN ('long', 'short')),
    entry         NUMERIC(12,4) NOT NULL,
    target        NUMERIC(12,4),
    stop          NUMERIC(12,4),
    exit_price    NUMERIC(12,4),
    pnl           NUMERIC(10,2),
    risk_reward   NUMERIC(6,2),
    result        VARCHAR(10) CHECK (result IN ('win', 'loss', 'breakeven', 'open')),
    notes         TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS journal_entries (
    id            SERIAL PRIMARY KEY,
    title         VARCHAR(255) NOT NULL,
    content       TEXT,
    type          VARCHAR(20) DEFAULT 'note',
    tags          TEXT[] DEFAULT '{}',
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS watchlist (
    id            SERIAL PRIMARY KEY,
    symbol        VARCHAR(20) NOT NULL UNIQUE,
    name          VARCHAR(100),
    added_at      TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS ai_summaries (
    id            SERIAL PRIMARY KEY,
    type          VARCHAR(10) NOT NULL CHECK (type IN ('weekly', 'daily')),
    summary       TEXT NOT NULL,
    context_data  JSONB DEFAULT '{}',
    model         VARCHAR(30) DEFAULT 'rule-based',
    created_at    TIMESTAMPTZ DEFAULT NOW()
  );

  -- Seed default watchlist if empty
  INSERT INTO watchlist (symbol, name)
  VALUES
    ('XAU/USD', 'Gold Spot'),
    ('XAG/USD', 'Silver Spot'),
    ('GLD',     'SPDR Gold Shares'),
    ('SLV',     'iShares Silver Trust'),
    ('GDX',     'Gold Miners ETF'),
    ('DXY',     'US Dollar Index')
  ON CONFLICT (symbol) DO NOTHING;
`;

export async function migrate() {
  try {
    await pool.query(schema);
    console.log('Database migration completed successfully');
  } catch (err) {
    console.error('Migration failed:', err.message);
    throw err;
  }
}
