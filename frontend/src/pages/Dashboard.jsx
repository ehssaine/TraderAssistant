import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid, Card, CardContent, Typography, Box, Button, Chip, IconButton,
  LinearProgress, Fade, Tooltip, Paper, useTheme,
} from '@mui/material';
import {
  TrendingUp, Shield, ShowChart, CalendarMonth, Speed, Whatshot,
  ArrowForward, AutoAwesome, AccountBalance, Timeline,
} from '@mui/icons-material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import SectionHeader from '../components/common/SectionHeader';
import MetricCard from '../components/common/MetricCard';
import RiskCalculator from '../components/common/RiskCalculator';
import TradingViewWidget from '../components/common/TradingViewWidget';
import { api } from '../services/api';
import { formatCurrency, formatPercent, getRandomQuote } from '../utils/helpers';
import { TRADING_QUOTES, PSYCHOLOGY_TIPS, GOLD_SILVER_CORRELATION, SILVER_BETA } from '../utils/constants';

export default function Dashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [goldHistory, setGoldHistory] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [news, setNews] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [quote, setQuote] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setQuote(getRandomQuote(TRADING_QUOTES));
    Promise.all([
      api.getGoldHistory(),
      api.getPerformance(),
      api.getNews(),
      api.getWatchlist(),
    ]).then(([gold, perf, n, wl]) => {
      setGoldHistory(gold.slice(-30));
      setPerformance(perf);
      setNews(n.slice(0, 5));
      setWatchlist(wl);
      setLoaded(true);
    });
  }, []);

  const isDark = theme.palette.mode === 'dark';
  const weeklyReturns = performance?.weeklyReturns || [];
  const monthlyStats = performance?.monthlyStats || [];
  const latestMonth = monthlyStats.at(-1);

  const correlationData = [
    { name: 'Gold/Silver', value: GOLD_SILVER_CORRELATION * 100, color: '#FFD700' },
    { name: 'Other', value: (1 - GOLD_SILVER_CORRELATION) * 100, color: isDark ? '#1e2a3a' : '#e0e0e0' },
  ];

  return (
    <Fade in={loaded} timeout={600}>
      <Box>
        <SectionHeader
          title="Trading Dashboard"
          subtitle="Gold & Silver Professional Trading System"
          icon={<AccountBalance />}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" startIcon={<CalendarMonth />} onClick={() => navigate('/weekly')} size="small">
                Weekly Plan
              </Button>
              <Button variant="contained" startIcon={<ShowChart />} onClick={() => navigate('/daily')} size="small">
                Start Trading
              </Button>
            </Box>
          }
        />

        {/* Quote Banner */}
        <Paper
          sx={{
            p: 2.5, mb: 3, borderRadius: 3,
            background: isDark
              ? 'linear-gradient(135deg, rgba(255,215,0,0.08) 0%, rgba(192,192,192,0.05) 100%)'
              : 'linear-gradient(135deg, rgba(26,35,126,0.05) 0%, rgba(184,134,11,0.05) 100%)',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,215,0,0.15)' : 'rgba(26,35,126,0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AutoAwesome sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="body2" fontStyle="italic" color="text.secondary">{quote}</Typography>
          </Box>
        </Paper>

        {/* Key Metrics */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <MetricCard
              title="Weekly Target"
              value="1-2%"
              subtitle="Consistent weekly returns"
              icon={<TrendingUp />}
              color="success.main"
              tooltip="Target 1-2% weekly returns through disciplined trading"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <MetricCard
              title="Risk Per Trade"
              value="1%"
              subtitle="Max 2% portfolio risk"
              icon={<Shield />}
              color="error.main"
              tooltip="Never risk more than 1% per trade, 2% total portfolio"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <MetricCard
              title="Gold/Silver rho"
              value={GOLD_SILVER_CORRELATION.toFixed(1)}
              subtitle={`Silver beta ~${SILVER_BETA}x`}
              icon={<Timeline />}
              color="primary.main"
              tooltip="Gold-Silver correlation ~0.8, Silver moves ~1.5x Gold"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <MetricCard
              title="Win Rate"
              value={latestMonth ? `${latestMonth.winRate}%` : '--'}
              subtitle={latestMonth ? `Sharpe: ${latestMonth.sharpe}` : ''}
              icon={<Speed />}
              color="warning.main"
              tooltip="Current month win rate and Sharpe ratio"
            />
          </Grid>
        </Grid>

        <Grid container spacing={2.5}>
          {/* Gold Chart */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" fontWeight={600}>Gold (XAU/USD) Live Chart</Typography>
                  <Chip label="TradingView" size="small" variant="outlined" />
                </Box>
                <TradingViewWidget symbol="OANDA:XAUUSD" height={420} />
              </CardContent>
            </Card>
          </Grid>

          {/* Side Panel */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Watchlist */}
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>Watchlist</Typography>
                  {watchlist.map((item) => (
                    <Box key={item.symbol} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.8, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{item.symbol}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.name}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" fontWeight={600} fontFamily='"JetBrains Mono", monospace'>
                          {formatCurrency(item.price)}
                        </Typography>
                        <Typography
                          variant="caption"
                          fontFamily='"JetBrains Mono", monospace'
                          color={item.change >= 0 ? 'success.main' : 'error.main'}
                        >
                          {formatPercent(item.change)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>

              {/* News */}
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" fontWeight={600}>Latest News</Typography>
                    <Whatshot sx={{ color: 'warning.main', fontSize: 20 }} />
                  </Box>
                  {news.map((item) => (
                    <Box key={item.id} sx={{ py: 0.8, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
                      <Typography variant="body2" fontWeight={500} sx={{ lineHeight: 1.4 }}>{item.title}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.3, alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">{item.source}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.time}</Typography>
                        <Chip
                          label={item.sentiment}
                          size="small"
                          color={item.sentiment === 'bullish' ? 'success' : item.sentiment === 'bearish' ? 'error' : 'default'}
                          sx={{ height: 18, fontSize: '0.6rem' }}
                        />
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Box>
          </Grid>

          {/* Weekly Returns Chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Weekly Returns</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyReturns}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                    <YAxis tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} tickFormatter={(v) => `${v}%`} />
                    <RTooltip
                      contentStyle={{ background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8 }}
                      formatter={(value) => [`${value.toFixed(2)}%`, 'Return']}
                    />
                    <Bar dataKey="return" radius={[4, 4, 0, 0]}>
                      {weeklyReturns.map((entry, i) => (
                        <Cell key={i} fill={entry.return >= 0 ? theme.palette.success.main : theme.palette.error.main} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Silver Chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" fontWeight={600}>Silver (XAG/USD)</Typography>
                </Box>
                <TradingViewWidget symbol="OANDA:XAGUSD" height={250} hideToolbar />
              </CardContent>
            </Card>
          </Grid>

          {/* Risk Calculator */}
          <Grid size={{ xs: 12, md: 6 }}>
            <RiskCalculator />
          </Grid>

          {/* Psychology Tips */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Trading Psychology</Typography>
                {PSYCHOLOGY_TIPS.slice(0, 4).map((tip, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'flex-start' }}>
                    <Shield sx={{ color: 'warning.main', fontSize: 18, mt: 0.2 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{tip.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{tip.text}</Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Correlation */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Gold/Silver Correlation</Typography>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={correlationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {correlationData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <Typography variant="h4" fontWeight={700} color="primary.main" fontFamily='"JetBrains Mono", monospace' sx={{ mt: -6, position: 'relative', zIndex: 1 }}>
                  {GOLD_SILVER_CORRELATION}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 4 }}>Pearson Correlation Coefficient</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Monthly Performance */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Monthly Performance</Typography>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                    <YAxis tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} tickFormatter={(v) => `${v}%`} />
                    <RTooltip contentStyle={{ background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8 }} />
                    <Area type="monotone" dataKey="pnl" stroke="#FFD700" fill="rgba(255,215,0,0.15)" strokeWidth={2} name="P&L %" />
                    <Area type="monotone" dataKey="maxDrawdown" stroke="#FF5252" fill="rgba(255,82,82,0.1)" strokeWidth={1.5} name="Max DD %" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
}
