import { useState, useEffect } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Fade, useTheme, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab,
} from '@mui/material';
import {
  Assessment, TrendingUp, PieChart as PieChartIcon, Timeline, Speed,
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
  AreaChart, Area, RadialBarChart, RadialBar, ComposedChart,
} from 'recharts';
import SectionHeader from '../components/common/SectionHeader';
import MetricCard from '../components/common/MetricCard';
import { api } from '../services/api';
import { formatCurrency, formatPercent, calculateSharpeRatio } from '../utils/helpers';
import { IDEAL_SHARPE_RATIO } from '../utils/constants';

export default function Analytics() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [performance, setPerformance] = useState(null);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    Promise.all([api.getPerformance(), api.getTradeHistory()]).then(([perf, trades]) => {
      setPerformance(perf);
      setTradeHistory(trades);
      setLoaded(true);
    });
  }, []);

  if (!loaded || !performance) return null;

  const wins = tradeHistory.filter(t => t.result === 'win');
  const losses = tradeHistory.filter(t => t.result === 'loss');
  const winRate = tradeHistory.length > 0 ? Math.round((wins.length / tradeHistory.length) * 100) : 0;
  const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length ? losses.reduce((s, t) => s + Math.abs(t.pnl), 0) / losses.length : 0;
  const profitFactor = avgLoss > 0 ? (avgWin * wins.length) / (avgLoss * losses.length) : 0;
  const sharpe = calculateSharpeRatio(tradeHistory.map(t => t.pnl));
  const totalPnl = tradeHistory.reduce((s, t) => s + t.pnl, 0);

  const winLossData = [
    { name: 'Wins', value: wins.length, color: theme.palette.success.main },
    { name: 'Losses', value: losses.length, color: theme.palette.error.main },
  ];

  const bySymbol = tradeHistory.reduce((acc, t) => {
    acc[t.symbol] = acc[t.symbol] || { wins: 0, losses: 0, pnl: 0 };
    if (t.result === 'win') acc[t.symbol].wins++;
    else acc[t.symbol].losses++;
    acc[t.symbol].pnl += t.pnl;
    return acc;
  }, {});

  return (
    <Fade in={loaded} timeout={600}>
      <Box>
        <SectionHeader
          title="Performance Analytics"
          subtitle="Track your trading performance and identify improvement areas"
          icon={<Assessment />}
        />

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label="Overview" />
          <Tab label="Monthly Review" />
          <Tab label="Trade History" />
        </Tabs>

        {tab === 0 && (
          <>
            {/* Key Performance Metrics */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6, md: 2.4 }}>
                <MetricCard title="Win Rate" value={`${winRate}%`} subtitle={`${wins.length}W / ${losses.length}L`} icon={<Speed />} color={winRate >= 65 ? 'success.main' : 'warning.main'} />
              </Grid>
              <Grid size={{ xs: 6, md: 2.4 }}>
                <MetricCard title="Profit Factor" value={profitFactor.toFixed(2)} subtitle="Avg Win / Avg Loss" icon={<TrendingUp />} color={profitFactor >= 1.5 ? 'success.main' : 'warning.main'} />
              </Grid>
              <Grid size={{ xs: 6, md: 2.4 }}>
                <MetricCard title="Sharpe Ratio" value={sharpe.toFixed(2)} subtitle={`Target: >${IDEAL_SHARPE_RATIO}`} icon={<Timeline />} color={sharpe >= IDEAL_SHARPE_RATIO ? 'success.main' : 'warning.main'} />
              </Grid>
              <Grid size={{ xs: 6, md: 2.4 }}>
                <MetricCard title="Avg Win" value={formatPercent(avgWin)} subtitle={`Avg Loss: ${formatPercent(-avgLoss)}`} color="success.main" />
              </Grid>
              <Grid size={{ xs: 12, md: 2.4 }}>
                <MetricCard title="Total P&L" value={formatPercent(totalPnl)} subtitle={`${tradeHistory.length} trades`} color={totalPnl >= 0 ? 'success.main' : 'error.main'} />
              </Grid>
            </Grid>

            <Grid container spacing={2.5}>
              {/* Weekly Returns */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Card>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Weekly Returns vs Target</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={performance.weeklyReturns}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                        <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                        <RTooltip contentStyle={{ background: theme.palette.background.paper, borderRadius: 8 }} />
                        <Bar dataKey="return" name="Weekly Return" radius={[4, 4, 0, 0]}>
                          {performance.weeklyReturns.map((entry, i) => (
                            <Cell key={i} fill={entry.return >= 0 ? theme.palette.success.main : theme.palette.error.main} />
                          ))}
                        </Bar>
                        <Line type="monotone" dataKey="target" stroke="#FFD700" strokeDasharray="5 5" strokeWidth={2} name="Target" dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Win/Loss Pie */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Win/Loss Distribution</Typography>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={winLossData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                          {winLossData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Performance by Symbol */}
              <Grid size={{ xs: 12 }}>
                <Card>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Performance by Symbol</Typography>
                    <Grid container spacing={2}>
                      {Object.entries(bySymbol).map(([symbol, data]) => (
                        <Grid size={{ xs: 12, sm: 6 }} key={symbol}>
                          <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="body1" fontWeight={700}>{symbol}</Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Wins</Typography>
                                <Typography variant="h6" color="success.main" fontWeight={700}>{data.wins}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Losses</Typography>
                                <Typography variant="h6" color="error.main" fontWeight={700}>{data.losses}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Total P&L</Typography>
                                <Typography variant="h6" color={data.pnl >= 0 ? 'success.main' : 'error.main'} fontWeight={700}>
                                  {formatPercent(data.pnl)}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Win Rate</Typography>
                                <Typography variant="h6" fontWeight={700}>
                                  {Math.round((data.wins / (data.wins + data.losses)) * 100)}%
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}

        {tab === 1 && (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Monthly Performance Summary</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Month</TableCell>
                          <TableCell>Win Rate</TableCell>
                          <TableCell>Trades</TableCell>
                          <TableCell>P&L %</TableCell>
                          <TableCell>Sharpe</TableCell>
                          <TableCell>Max Drawdown</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {performance.monthlyStats.map((month) => (
                          <TableRow key={month.month} hover>
                            <TableCell fontWeight={600}>{month.month}</TableCell>
                            <TableCell>
                              <Chip label={`${month.winRate}%`} size="small" color={month.winRate >= 65 ? 'success' : 'warning'} sx={{ fontWeight: 600 }} />
                            </TableCell>
                            <TableCell>{month.trades}</TableCell>
                            <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', color: month.pnl >= 0 ? theme.palette.success.main : theme.palette.error.main, fontWeight: 700 }}>
                              {formatPercent(month.pnl)}
                            </TableCell>
                            <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
                              <Chip label={month.sharpe.toFixed(2)} size="small" color={month.sharpe >= IDEAL_SHARPE_RATIO ? 'success' : 'default'} variant="outlined" />
                            </TableCell>
                            <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', color: theme.palette.error.main }}>
                              -{month.maxDrawdown}%
                            </TableCell>
                            <TableCell>
                              <Chip label={month.pnl >= 4 ? 'Excellent' : month.pnl >= 2 ? 'Good' : 'Below Target'} size="small" color={month.pnl >= 4 ? 'success' : month.pnl >= 2 ? 'warning' : 'error'} sx={{ fontSize: '0.65rem' }} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Sharpe Ratio Trend</Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={performance.monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} domain={[0, 3]} />
                      <RTooltip contentStyle={{ background: theme.palette.background.paper, borderRadius: 8 }} />
                      <Line type="monotone" dataKey="sharpe" stroke="#FFD700" strokeWidth={2} name="Sharpe Ratio" dot={{ fill: '#FFD700' }} />
                      <Line type="monotone" dataKey={() => IDEAL_SHARPE_RATIO} stroke="#FF5252" strokeDasharray="5 5" name={`Target (${IDEAL_SHARPE_RATIO})`} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Drawdown Analysis</Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={performance.monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `-${v}%`} />
                      <RTooltip contentStyle={{ background: theme.palette.background.paper, borderRadius: 8 }} formatter={(v) => [`-${v}%`, 'Max Drawdown']} />
                      <Area type="monotone" dataKey="maxDrawdown" stroke="#FF5252" fill="rgba(255,82,82,0.15)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {tab === 2 && (
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Complete Trade History</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Symbol</TableCell>
                      <TableCell>Direction</TableCell>
                      <TableCell>Entry</TableCell>
                      <TableCell>Exit</TableCell>
                      <TableCell>R:R</TableCell>
                      <TableCell>P&L %</TableCell>
                      <TableCell>Result</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tradeHistory.map((trade) => (
                      <TableRow key={trade.id} hover>
                        <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem' }}>{trade.date}</TableCell>
                        <TableCell fontWeight={500}>{trade.symbol}</TableCell>
                        <TableCell>
                          <Chip label={trade.direction} size="small" color={trade.direction === 'long' ? 'success' : 'error'} sx={{ height: 20, fontSize: '0.65rem' }} />
                        </TableCell>
                        <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace' }}>{formatCurrency(trade.entry)}</TableCell>
                        <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace' }}>{trade.exit ? formatCurrency(trade.exit) : '-'}</TableCell>
                        <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace' }}>1:{trade.riskReward}</TableCell>
                        <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: trade.pnl >= 0 ? theme.palette.success.main : theme.palette.error.main }}>
                          {formatPercent(trade.pnl)}
                        </TableCell>
                        <TableCell>
                          <Chip label={trade.result} size="small" color={trade.result === 'win' ? 'success' : 'error'} sx={{ height: 20, fontSize: '0.65rem' }} />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          <Typography variant="caption" noWrap>{trade.notes}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Box>
    </Fade>
  );
}
