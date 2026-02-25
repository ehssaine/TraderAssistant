import { useState, useEffect } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Button, Tabs, Tab, Chip,
  TextField, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Fade, Select, MenuItem, FormControl, InputLabel,
  Stepper, Step, StepLabel, StepContent, Alert, IconButton, Tooltip,
  LinearProgress, Divider, useTheme,
} from '@mui/material';
import {
  CalendarMonth, TrendingUp, Public, BarChart as BarChartIcon,
  Assessment, NoteAlt, PictureAsPdf, CheckCircle, Flag,
  FilterList, ArrowForward, Refresh, Download,
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from 'recharts';
import SectionHeader from '../components/common/SectionHeader';
import TradingViewWidget from '../components/common/TradingViewWidget';
import { api } from '../services/api';
import { useAppStore } from '../context/store';
import { HIGH_IMPACT_EVENTS } from '../utils/constants';

const STEPS = [
  { label: 'Economic Calendar Review', time: '30-45 mins', icon: <CalendarMonth /> },
  { label: 'Macro Trends Assessment', time: '45-60 mins', icon: <TrendingUp /> },
  { label: 'Sentiment & Positioning', time: '30 mins', icon: <BarChartIcon /> },
  { label: 'Risk Assessment & Portfolio', time: '15-30 mins', icon: <Assessment /> },
  { label: 'Journal & Prep', time: '15 mins', icon: <NoteAlt /> },
];

export default function WeeklyAnalysis() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { weeklyPlan, setWeeklyPlan, calendarNotes, setCalendarNote } = useAppStore();
  const [activeStep, setActiveStep] = useState(0);
  const [calendar, setCalendar] = useState([]);
  const [cotData, setCotData] = useState(null);
  const [fedWatch, setFedWatch] = useState([]);
  const [impactFilter, setImpactFilter] = useState('all');
  const [macroTab, setMacroTab] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getEconomicCalendar(),
      api.getCOTReport(),
      api.getFedWatch(),
    ]).then(([cal, cot, fed]) => {
      setCalendar(cal);
      setCotData(cot);
      setFedWatch(fed);
      setLoaded(true);
    });
  }, []);

  const filteredCalendar = impactFilter === 'all'
    ? calendar
    : calendar.filter(e => e.impact === impactFilter);

  const impactColor = (impact) => {
    if (impact === 'high') return 'error';
    if (impact === 'medium') return 'warning';
    return 'default';
  };

  return (
    <Fade in={loaded} timeout={600}>
      <Box>
        <SectionHeader
          title="Weekly Fundamentals Analysis"
          subtitle="Sunday evening preparation (2-3 hours)"
          icon={<CalendarMonth />}
          badge="Weekly"
          action={
            <Button variant="contained" startIcon={<PictureAsPdf />} size="small" onClick={() => alert('PDF export coming soon!')}>
              Export Summary
            </Button>
          }
        />

        {/* Progress Stepper */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 2 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {STEPS.map((step, i) => (
                <Step key={i} completed={i < activeStep}>
                  <StepLabel
                    onClick={() => setActiveStep(i)}
                    sx={{ cursor: 'pointer' }}
                    optional={<Typography variant="caption" color="text.secondary">{step.time}</Typography>}
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* Step 1: Economic Calendar */}
        {activeStep === 0 && (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>Economic Calendar</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Impact</InputLabel>
                        <Select value={impactFilter} onChange={(e) => setImpactFilter(e.target.value)} label="Impact">
                          <MenuItem value="all">All</MenuItem>
                          <MenuItem value="high">High</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="low">Low</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Time</TableCell>
                          <TableCell>Event</TableCell>
                          <TableCell>Impact</TableCell>
                          <TableCell>Forecast</TableCell>
                          <TableCell>Previous</TableCell>
                          <TableCell>Notes</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredCalendar.map((event) => (
                          <TableRow key={event.id} hover>
                            <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem' }}>{event.date}</TableCell>
                            <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem' }}>{event.time}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {HIGH_IMPACT_EVENTS.some(e => event.event.includes(e)) && <Flag sx={{ fontSize: 14, color: 'error.main' }} />}
                                <Typography variant="body2" fontWeight={500}>{event.event}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip label={event.impact} size="small" color={impactColor(event.impact)} sx={{ height: 22, fontSize: '0.7rem' }} />
                            </TableCell>
                            <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem' }}>{event.forecast}</TableCell>
                            <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem' }}>{event.previous}</TableCell>
                            <TableCell sx={{ minWidth: 180 }}>
                              <TextField
                                size="small"
                                placeholder="Expected impact..."
                                value={calendarNotes[event.id] || ''}
                                onChange={(e) => setCalendarNote(event.id, e.target.value)}
                                fullWidth
                                variant="standard"
                                sx={{ fontSize: '0.8rem' }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Alert severity="info" sx={{ mt: 2 }}>
                    Highlight events that could impact gold/silver: NFP, CPI, FOMC rate decisions, and geopolitical developments.
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Step 2: Macro Trends */}
        {activeStep === 1 && (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Tabs value={macroTab} onChange={(_, v) => setMacroTab(v)} sx={{ mb: 2 }}>
                    <Tab label="Inflation & Rates" />
                    <Tab label="Geopolitics & News" />
                    <Tab label="Currency Strength" />
                    <Tab label="Supply & Demand" />
                  </Tabs>

                  {macroTab === 0 && (
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>CME FedWatch Tool</Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Meeting</TableCell>
                              <TableCell>Hold Prob.</TableCell>
                              <TableCell>Cut Prob.</TableCell>
                              <TableCell>Hike Prob.</TableCell>
                              <TableCell>Implied Rate</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {fedWatch.map((row) => (
                              <TableRow key={row.meeting} hover>
                                <TableCell fontWeight={500}>{row.meeting}</TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LinearProgress variant="determinate" value={row.holdProb} sx={{ flex: 1, height: 6, borderRadius: 3 }} />
                                    <Typography variant="caption" fontFamily='"JetBrains Mono", monospace'>{row.holdProb}%</Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip label={`${row.cutProb}%`} size="small" color="success" variant="outlined" sx={{ fontFamily: '"JetBrains Mono", monospace' }} />
                                </TableCell>
                                <TableCell>
                                  <Chip label={`${row.hikeProb}%`} size="small" color="error" variant="outlined" sx={{ fontFamily: '"JetBrains Mono", monospace' }} />
                                </TableCell>
                                <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>{row.impliedRate}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <Alert severity="success" sx={{ mt: 2 }}>
                        <strong>Key insight:</strong> Higher cut probabilities are generally bullish for gold. Watch for shifts in rate expectations.
                      </Alert>
                    </Box>
                  )}

                  {macroTab === 1 && (
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Geopolitics & News Feed</Typography>
                      <Alert severity="info" sx={{ mb: 2 }}>Monitor Reuters, Kitco, and Bloomberg for geopolitical developments affecting safe-haven demand.</Alert>
                      <TradingViewWidget symbol="OANDA:XAUUSD" height={350} hideToolbar />
                    </Box>
                  )}

                  {macroTab === 2 && (
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>US Dollar Index (DXY)</Typography>
                      <Alert severity="warning" sx={{ mb: 2 }}>Gold has an inverse correlation with USD. Watch DXY support/resistance levels.</Alert>
                      <TradingViewWidget symbol="TVC:DXY" height={350} />
                    </Box>
                  )}

                  {macroTab === 3 && (
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Gold Supply & Demand</Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Central Bank Buying</Typography>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={[
                              { quarter: 'Q1 25', tonnes: 290 }, { quarter: 'Q2 25', tonnes: 310 },
                              { quarter: 'Q3 25', tonnes: 340 }, { quarter: 'Q4 25', tonnes: 280 },
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                              <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} />
                              <RTooltip contentStyle={{ background: theme.palette.background.paper, borderRadius: 8 }} />
                              <Bar dataKey="tonnes" fill="#FFD700" radius={[4, 4, 0, 0]} name="Tonnes" />
                            </BarChart>
                          </ResponsiveContainer>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Demand by Sector</Typography>
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie data={[
                                { name: 'Jewelry', value: 44, color: '#FFD700' },
                                { name: 'Investment', value: 26, color: '#C0C0C0' },
                                { name: 'Central Banks', value: 23, color: '#40C4FF' },
                                { name: 'Technology', value: 7, color: '#69F0AE' },
                              ]} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                                {[{ color: '#FFD700' }, { color: '#C0C0C0' }, { color: '#40C4FF' }, { color: '#69F0AE' }].map((entry, i) => (
                                  <Cell key={i} fill={entry.color} />
                                ))}
                              </Pie>
                              <RTooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Step 3: Sentiment & Positioning */}
        {activeStep === 2 && cotData && (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Gold COT Report - Net Positioning</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={cotData.gold.dates.map((date, i) => ({
                      date,
                      nonCommercials: cotData.gold.nonCommercials[i],
                      commercials: cotData.gold.commercials[i],
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <RTooltip contentStyle={{ background: theme.palette.background.paper, borderRadius: 8 }} />
                      <Bar dataKey="nonCommercials" fill="#FFD700" name="Speculators (Long)" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="commercials" fill="#FF5252" name="Commercials (Short)" radius={[2, 2, 0, 0]} />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Extreme speculative longs can signal exhaustion. Watch for divergence between price and positioning.
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Silver COT Report - Net Positioning</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={cotData.silver.dates.map((date, i) => ({
                      date,
                      nonCommercials: cotData.silver.nonCommercials[i],
                      commercials: cotData.silver.commercials[i],
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <RTooltip contentStyle={{ background: theme.palette.background.paper, borderRadius: 8 }} />
                      <Bar dataKey="nonCommercials" fill="#C0C0C0" name="Speculators (Long)" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="commercials" fill="#FF5252" name="Commercials (Short)" radius={[2, 2, 0, 0]} />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Open Interest Trend</Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={cotData.gold.dates.map((date, i) => ({
                      date,
                      goldOI: cotData.gold.openInterest[i],
                      silverOI: cotData.silver.openInterest[i],
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <RTooltip contentStyle={{ background: theme.palette.background.paper, borderRadius: 8 }} />
                      <Area yAxisId="left" type="monotone" dataKey="goldOI" stroke="#FFD700" fill="rgba(255,215,0,0.15)" name="Gold OI" />
                      <Area yAxisId="right" type="monotone" dataKey="silverOI" stroke="#C0C0C0" fill="rgba(192,192,192,0.15)" name="Silver OI" />
                      <Legend />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Step 4: Risk Assessment */}
        {activeStep === 3 && (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Portfolio Exposure Limits</Typography>
                  {[
                    { label: 'Max Risk Per Trade', value: 1, max: 5, color: 'error' },
                    { label: 'Max Portfolio Risk', value: 2, max: 10, color: 'warning' },
                    { label: 'Max Correlated Exposure', value: 3, max: 10, color: 'info' },
                    { label: 'Max Drawdown Limit', value: 5, max: 20, color: 'error' },
                  ].map((item) => (
                    <Box key={item.label} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={500}>{item.label}</Typography>
                        <Typography variant="body2" fontWeight={700} fontFamily='"JetBrains Mono", monospace'>{item.value}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={(item.value / item.max) * 100} color={item.color} sx={{ height: 8, borderRadius: 4 }} />
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Weekly Plan Summary</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Weekly Bias</InputLabel>
                      <Select
                        value={weeklyPlan.bias}
                        onChange={(e) => setWeeklyPlan({ ...weeklyPlan, bias: e.target.value })}
                        label="Weekly Bias"
                      >
                        <MenuItem value="bullish">Bullish</MenuItem>
                        <MenuItem value="bearish">Bearish</MenuItem>
                        <MenuItem value="neutral">Neutral / Range-bound</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="Key Levels (Support/Resistance)"
                      multiline
                      rows={3}
                      value={weeklyPlan.keyLevels}
                      onChange={(e) => setWeeklyPlan({ ...weeklyPlan, keyLevels: e.target.value })}
                      placeholder="Gold: S1=2620, S2=2600, R1=2660, R2=2680&#10;Silver: S1=30.50, R1=32.00"
                      size="small"
                    />
                    <TextField
                      label="Key Catalysts"
                      multiline
                      rows={2}
                      value={weeklyPlan.catalysts}
                      onChange={(e) => setWeeklyPlan({ ...weeklyPlan, catalysts: e.target.value })}
                      placeholder="CPI Tuesday, FOMC minutes Wednesday..."
                      size="small"
                    />
                    <TextField
                      label="Additional Notes"
                      multiline
                      rows={3}
                      value={weeklyPlan.notes}
                      onChange={(e) => setWeeklyPlan({ ...weeklyPlan, notes: e.target.value })}
                      placeholder="Watch DXY for breakout below 104..."
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Step 5: Journal & Prep */}
        {activeStep === 4 && (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Weekly Preparation Journal</Typography>
                  <TextField
                    multiline
                    rows={12}
                    fullWidth
                    placeholder="Write your weekly analysis summary here...&#10;&#10;- Market bias and reasoning&#10;- Key levels to watch&#10;- Potential setups for the week&#10;- Risk management plan&#10;- Key economic events and expected impacts"
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button variant="outlined" startIcon={<Download />}>Export as PDF</Button>
                    <Button variant="contained" startIcon={<CheckCircle />}>Save & Complete</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={() => setActiveStep(activeStep - 1)}
            variant="outlined"
          >
            Previous Step
          </Button>
          <Button
            disabled={activeStep === STEPS.length - 1}
            onClick={() => setActiveStep(activeStep + 1)}
            variant="contained"
            endIcon={<ArrowForward />}
          >
            Next Step
          </Button>
        </Box>
      </Box>
    </Fade>
  );
}
