import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { priceRoutes } from './routes/prices.js';
import { calendarRoutes } from './routes/calendar.js';
import { tradeRoutes } from './routes/trades.js';
import { newsRoutes } from './routes/news.js';
import { aiRoutes } from './routes/ai.js';
import { migrate } from './db/migrate.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(compression());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', priceRoutes);
app.use('/api', calendarRoutes);
app.use('/api', tradeRoutes);
app.use('/api', newsRoutes);
app.use('/api', aiRoutes);

// Serve frontend static build
const frontendDist = join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// SPA fallback — serve index.html for all non-API routes
app.get('/{*splat}', (req, res) => {
  res.sendFile(join(frontendDist, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Run DB migration then start server
migrate()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`TraderAssistant running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start:', err.message);
    process.exit(1);
  });
