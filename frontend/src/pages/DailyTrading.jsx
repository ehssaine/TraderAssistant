import { useState, useEffect } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Button, Tabs, Tab, Chip,
  TextField, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Fade, Select, MenuItem, FormControl, InputLabel,
  Alert, IconButton, Tooltip, Divider, useTheme, Switch, FormControlLabel,
  ToggleButtonGroup, ToggleButton, LinearProgress,
} from '@mui/material';
import {
  ShowChart, Newspaper, CompareArrows, Architecture, Speed,
  TrendingUp, TrendingDown, PlayArrow, Pause, CheckCircle,
  Notifications, Add, Save, Assessment, Timer,
} from '@mui/icons-material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, RadialBarChart, RadialBar, Legend,
} from 'recharts';
import SectionHeader from '../components/common/SectionHeader';
import TradingViewWidget from '../components/common/TradingViewWidget';
import RiskCalculator from '../components/common/RiskCalculator';
import { api } from '../services/api';
import { useAppStore } from '../context/store';
import { formatCurrency, formatPercent, calculateRiskReward, generateId } from '../utils/helpers';
import { TIMEFRAMES } from '../utils/constants';

export default function DailyTrading() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { weeklyPlan, addTrade, trades } = useAppStore();
  const [tab, setTab] = useState(0);
  const [news, setNews] = useState([]);
  const [chartSymbol, setChartSymbol] = useState('OANDA:XAUUSD');
  const [chartInterval, setChartInterval] = useState('60');
  const [loaded, setLoaded] = useState(false);
  const [tradeSetup, setTradeSetup] = useState({
    symbol: 'XAU/USD',
    direction: 'long',
    entry: '',
    target: '',
    stop: '',
    notes: '',
    alignsWithWeekly: true,
  });
  const [eodReview, setEodReview] = useState({ notes: '', mood: 'neutral', lessonsLearned: '' });

  useEffect(() => {
    api.getNews().then((n) => { setNews(n); setLoaded(true); });
  }, []);

  const handleSaveTrade = () => {
    const entry = parseFloat(tradeSetup.entry);
    const target = parseFloat(tradeSetup.target);
    const stop = parseFloat(tradeSetup.stop);
    if (!entry || !target || !stop) return;

    addTrade({
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      symbol: tradeSetup.symbol,
      direction: tradeSetup.direction,
      entry, target, stop,
      exit: null,
      pnl: null,
      riskReward: calculateRiskReward(entry, target, stop),
      result: 'open',
      notes: tradeSetup.notes,
    });
    setTradeSetup({ ...tradeSetup, entry: '', target: '', stop: '', notes: '' });
  };

  const volatilityGauge = [
    { name: 'ATR', value: 72, fill: '#FFD700' },
  ];

  return (
    <Fade in={loaded} timeout={600}>
      <Box>
        <SectionHeader
          title="Daily Technical Analysis & Execution"
          subtitle="Morning prep (~1 hour) with mid-day and end-of-day reviews"
          icon={<ShowChart />}
          badge="Daily"
          action={
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {weeklyPlan.bias && (
                <Chip
                  label={`Weekly Bias: ${weeklyPlan.bias.toUpperCase()}`}
                  color={weeklyPlan.bias === 'bullish' ? 'success' : weeklyPlan.bias === 'bearish' ? 'error' : 'default'}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          }
        />

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2.5 }} variant="scrollable" scrollButtons="auto">
          <Tab icon={<Newspaper />} iconPosition="start" label="Market Open Review" />
          <Tab icon={<ShowChart />} iconPosition="start" label="Technical Analysis" />
          <Tab icon={<Architecture />} iconPosition="start" label="Trade Setup" />
          <Tab icon={<Timer />} iconPosition="start" label="Mid-Day Check" />
          <Tab icon={<Assessment />} iconPosition="start" label="End-of-Day Review" />
        </Tabs>

        {/* Tab 0: Market Open Review */}
        {tab === 0 && (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>News Scanner</Typography>
                  {news.map((item) => (
                    <Box key={item.id} sx={{ display: 'flex', gap: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
                      <Box sx={{ width: 4, borderRadius: 2, bgcolor: item.sentiment === 'bullish' ? 'success.main' : item.sentiment === 'bearish' ? 'error.main' : 'grey.500', flexShrink: 0 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>{item.title}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
                          <Chip label={item.source} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                          <Typography variant="caption" color="text.secondary">{item.time}</Typography>
                          <Chip label={item.impact} size="small" color={item.impact === 'high' ? 'error' : 'default'} sx={{ height: 20, fontSize: '0.65rem' }} />
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Card>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Correlation Dashboard</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Key relationships to monitor</Typography>
                    {[
                      { pair: 'Gold vs USD', correlation: -0.82, status: 'Inverse' },
                      { pair: 'Gold vs Silver', correlation: 0.80, status: 'Strong Positive' },
                      { pair: 'Silver vs Copper', correlation: 0.65, status: 'Moderate Positive' },
                      { pair: 'Gold vs Real Yields', correlation: -0.75, status: 'Inverse' },
                    ].map((item) => (
                      <Box key={item.pair} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.8 }}>
                        <Typography variant="body2">{item.pair}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.abs(item.correlation) * 100}
                            sx={{ width: 60, height: 6, borderRadius: 3 }}
                            color={item.correlation > 0 ? 'success' : 'error'}
                          />
                          <Typography variant="caption" fontFamily='"JetBrains Mono", monospace' fontWeight={600}>
                            {item.correlation.toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardContent sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Volatility Gauge</Typography>
                    <ResponsiveContainer width="100%" height={150}>
                      <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={volatilityGauge} startAngle={180} endAngle={0}>
                        <RadialBar dataKey="value" cornerRadius={10} fill="#FFD700" />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <Typography variant="body2" fontWeight={600} color="warning.main" sx={{ mt: -3 }}>
                      ATR: Moderate Volatility
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        )}

        {/* Tab 1: Technical Chart Analysis */}
        {tab === 1 && (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <ToggleButtonGroup
                        value={chartSymbol}
                        exclusive
                        onChange={(_, v) => v && setChartSymbol(v)}
                        size="small"
                      >
                        <ToggleButton value="OANDA:XAUUSD">XAU/USD</ToggleButton>
                        <ToggleButton value="OANDA:XAGUSD">XAG/USD</ToggleButton>
                        <ToggleButton value="TVC:DXY">DXY</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <ToggleButtonGroup
                        value={chartInterval}
                        exclusive
                        onChange={(_, v) => v && setChartInterval(v)}
                        size="small"
                      >
                        <ToggleButton value="60">1H</ToggleButton>
                        <ToggleButton value="240">4H</ToggleButton>
                        <ToggleButton value="D">Daily</ToggleButton>
                        <ToggleButton value="W">Weekly</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                  </Box>
                  <TradingViewWidget symbol={chartSymbol} interval={chartInterval} height={550} />
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Alert severity="info">
                <strong>Technical Checklist:</strong> Review MAs (200/50/20), RSI for divergence, MACD crossovers, Fibonacci levels, and ATR for volatility. Look for pattern confirmations on multiple timeframes.
              </Alert>
            </Grid>
          </Grid>
        )}

        {/* Tab 2: Trade Setup */}
        {tab === 2 && (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>New Trade Setup</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Symbol</InputLabel>
                      <Select
                        value={tradeSetup.symbol}
                        onChange={(e) => setTradeSetup({ ...tradeSetup, symbol: e.target.value })}
                        label="Symbol"
                      >
                        <MenuItem value="XAU/USD">XAU/USD (Gold)</MenuItem>
                        <MenuItem value="XAG/USD">XAG/USD (Silver)</MenuItem>
                      </Select>
                    </FormControl>

                    <ToggleButtonGroup
                      value={tradeSetup.direction}
                      exclusive
                      onChange={(_, v) => v && setTradeSetup({ ...tradeSetup, direction: v })}
                      size="small"
                      fullWidth
                    >
                      <ToggleButton value="long" color="success">
                        <TrendingUp sx={{ mr: 0.5, fontSize: 18 }} /> Long
                      </ToggleButton>
                      <ToggleButton value="short" color="error">
                        <TrendingDown sx={{ mr: 0.5, fontSize: 18 }} /> Short
                      </ToggleButton>
                    </ToggleButtonGroup>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5 }}>
                      <TextField label="Entry" value={tradeSetup.entry} onChange={(e) => setTradeSetup({ ...tradeSetup, entry: e.target.value })} size="small" type="number" />
                      <TextField label="Target" value={tradeSetup.target} onChange={(e) => setTradeSetup({ ...tradeSetup, target: e.target.value })} size="small" type="number" />
                      <TextField label="Stop Loss" value={tradeSetup.stop} onChange={(e) => setTradeSetup({ ...tradeSetup, stop: e.target.value })} size="small" type="number" />
                    </Box>

                    {tradeSetup.entry && tradeSetup.target && tradeSetup.stop && (
                      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(255,215,0,0.05)' : 'rgba(26,35,126,0.03)', border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="body2" fontWeight={600}>
                          Risk:Reward = 1:{calculateRiskReward(parseFloat(tradeSetup.entry), parseFloat(tradeSetup.target), parseFloat(tradeSetup.stop))}
                        </Typography>
                      </Box>
                    )}

                    <FormControlLabel
                      control={
                        <Switch
                          checked={tradeSetup.alignsWithWeekly}
                          onChange={(e) => setTradeSetup({ ...tradeSetup, alignsWithWeekly: e.target.checked })}
                        />
                      }
                      label={
                        <Typography variant="body2">
                          Aligns with weekly bias {weeklyPlan.bias && `(${weeklyPlan.bias})`}
                        </Typography>
                      }
                    />

                    {!tradeSetup.alignsWithWeekly && (
                      <Alert severity="warning">This trade does not align with your weekly bias. Proceed with caution and smaller size.</Alert>
                    )}

                    <TextField
                      label="Trade Notes & Reasoning"
                      multiline
                      rows={3}
                      value={tradeSetup.notes}
                      onChange={(e) => setTradeSetup({ ...tradeSetup, notes: e.target.value })}
                      placeholder="Entry reasoning, pattern identified, catalyst..."
                      size="small"
                    />

                    <Button variant="contained" startIcon={<Save />} onClick={handleSaveTrade} fullWidth disabled={!tradeSetup.entry || !tradeSetup.stop || !tradeSetup.target}>
                      Log Trade Setup
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <RiskCalculator />
            </Grid>

            {/* Open Trades */}
            {trades.filter(t => t.result === 'open').length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Card>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Open Positions</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Symbol</TableCell>
                            <TableCell>Direction</TableCell>
                            <TableCell>Entry</TableCell>
                            <TableCell>Target</TableCell>
                            <TableCell>Stop</TableCell>
                            <TableCell>R:R</TableCell>
                            <TableCell>Notes</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {trades.filter(t => t.result === 'open').map((trade) => (
                            <TableRow key={trade.id} hover>
                              <TableCell fontWeight={600}>{trade.symbol}</TableCell>
                              <TableCell>
                                <Chip
                                  label={trade.direction}
                                  size="small"
                                  color={trade.direction === 'long' ? 'success' : 'error'}
                                  sx={{ height: 22, fontSize: '0.7rem' }}
                                />
                              </TableCell>
                              <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace' }}>{formatCurrency(trade.entry)}</TableCell>
                              <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace' }}>{formatCurrency(trade.target)}</TableCell>
                              <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace' }}>{formatCurrency(trade.stop)}</TableCell>
                              <TableCell>
                                <Chip label={`1:${trade.riskReward}`} size="small" color={trade.riskReward >= 2 ? 'success' : 'warning'} sx={{ fontFamily: '"JetBrains Mono", monospace' }} />
                              </TableCell>
                              <TableCell><Typography variant="caption">{trade.notes}</Typography></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        )}

        {/* Tab 3: Mid-Day Check */}
        {tab === 3 && (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Real-Time Position Monitor</Typography>
                  <TradingViewWidget symbol="OANDA:XAUUSD" interval="15" height={400} />
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Card>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Alert Settings</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <FormControlLabel control={<Switch defaultChecked />} label={<Typography variant="body2">News spike alerts</Typography>} />
                      <FormControlLabel control={<Switch defaultChecked />} label={<Typography variant="body2">Stop level proximity</Typography>} />
                      <FormControlLabel control={<Switch />} label={<Typography variant="body2">Target hit notifications</Typography>} />
                      <FormControlLabel control={<Switch defaultChecked />} label={<Typography variant="body2">High-impact event alerts</Typography>} />
                    </Box>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Quick Notes</Typography>
                    <TextField multiline rows={4} fullWidth placeholder="Mid-day observations..." size="small" />
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        )}

        {/* Tab 4: End-of-Day Review */}
        {tab === 4 && (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>End-of-Day Journal</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Trading Mood</InputLabel>
                      <Select
                        value={eodReview.mood}
                        onChange={(e) => setEodReview({ ...eodReview, mood: e.target.value })}
                        label="Trading Mood"
                      >
                        <MenuItem value="confident">Confident & Disciplined</MenuItem>
                        <MenuItem value="neutral">Neutral</MenuItem>
                        <MenuItem value="anxious">Anxious or Uncertain</MenuItem>
                        <MenuItem value="frustrated">Frustrated</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="Day Summary"
                      multiline
                      rows={4}
                      value={eodReview.notes}
                      onChange={(e) => setEodReview({ ...eodReview, notes: e.target.value })}
                      placeholder="What happened today? Did you follow your plan?"
                      size="small"
                    />
                    <TextField
                      label="Lessons Learned"
                      multiline
                      rows={3}
                      value={eodReview.lessonsLearned}
                      onChange={(e) => setEodReview({ ...eodReview, lessonsLearned: e.target.value })}
                      placeholder="What would you do differently?"
                      size="small"
                    />
                    <Button variant="contained" startIcon={<CheckCircle />} fullWidth>
                      Save End-of-Day Review
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Today's Trade Log</Typography>
                  {trades.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                      No trades logged today. Use the Trade Setup tab to log trades.
                    </Typography>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Symbol</TableCell>
                            <TableCell>Direction</TableCell>
                            <TableCell>Entry</TableCell>
                            <TableCell>R:R</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {trades.slice(0, 10).map((trade) => (
                            <TableRow key={trade.id} hover>
                              <TableCell>{trade.symbol}</TableCell>
                              <TableCell>
                                <Chip
                                  label={trade.direction}
                                  size="small"
                                  color={trade.direction === 'long' ? 'success' : 'error'}
                                  sx={{ height: 20, fontSize: '0.65rem' }}
                                />
                              </TableCell>
                              <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace' }}>{formatCurrency(trade.entry)}</TableCell>
                              <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace' }}>1:{trade.riskReward}</TableCell>
                              <TableCell>
                                <Chip
                                  label={trade.result}
                                  size="small"
                                  color={trade.result === 'win' ? 'success' : trade.result === 'loss' ? 'error' : 'default'}
                                  sx={{ height: 20, fontSize: '0.65rem' }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Fade>
  );
}
