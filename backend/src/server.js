import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { priceRoutes } from './routes/prices.js';
import { calendarRoutes } from './routes/calendar.js';
import { tradeRoutes } from './routes/trades.js';
import { newsRoutes } from './routes/news.js';

dotenv.config();

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

// Routes
app.use('/api', priceRoutes);
app.use('/api', calendarRoutes);
app.use('/api', tradeRoutes);
app.use('/api', newsRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`TraderAssistant API running on port ${PORT}`);
});
