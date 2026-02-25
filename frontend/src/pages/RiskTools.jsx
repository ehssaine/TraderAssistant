import { useState } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, TextField, Button, Slider,
  Divider, Fade, useTheme, Alert, Tabs, Tab, Chip,
} from '@mui/material';
import {
  Calculate, Shield, TrendingUp, AccountBalance, CompareArrows,
} from '@mui/icons-material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import SectionHeader from '../components/common/SectionHeader';
import RiskCalculator from '../components/common/RiskCalculator';
import { calculatePositionSize, calculateATRStopLoss, formatCurrency, formatPercent } from '../utils/helpers';
import { GOLD_SILVER_CORRELATION, SILVER_BETA } from '../utils/constants';

export default function RiskTools() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [tab, setTab] = useState(0);

  // Diversification simulator state
  const [allocations, setAllocations] = useState({ gold: 60, silver: 30, cash: 10 });
  const [simDays, setSimDays] = useState(30);

  const handleAllocationChange = (asset, value) => {
    const remaining = 100 - value;
    const others = Object.keys(allocations).filter(k => k !== asset);
    const otherTotal = others.reduce((sum, k) => sum + allocations[k], 0);
    const newAllocations = { ...allocations, [asset]: value };
    others.forEach((k) => {
      newAllocations[k] = otherTotal > 0 ? Math.round((allocations[k] / otherTotal) * remaining) : Math.round(remaining / others.length);
    });
    setAllocations(newAllocations);
  };

  // Portfolio simulation
  const simulatePortfolio = () => {
    const data = [];
    let equity = 100000;
    for (let i = 0; i <= simDays; i++) {
      const goldReturn = (Math.random() - 0.48) * 0.015;
      const silverReturn = goldReturn * SILVER_BETA + (Math.random() - 0.5) * 0.01;
      const dailyReturn =
        (allocations.gold / 100) * goldReturn +
        (allocations.silver / 100) * silverReturn;
      equity = equity * (1 + dailyReturn);
      data.push({ day: i, equity: Math.round(equity), drawdown: Math.round((equity / 100000 - 1) * 10000) / 100 });
    }
    return data;
  };

  const simData = simulatePortfolio();
  const maxDD = Math.min(...simData.map(d => d.drawdown));
  const finalReturn = simData.at(-1).drawdown;

  // ATR stop calculator state
  const [atrInputs, setAtrInputs] = useState({ atr: '28', multiplier: '1.5', entry: '2650', direction: 'long' });
  const atr = parseFloat(atrInputs.atr) || 0;
  const multiplier = parseFloat(atrInputs.multiplier) || 1.5;
  const atrEntry = parseFloat(atrInputs.entry) || 0;
  const atrStop = atr && atrEntry ? calculateATRStopLoss(atr, multiplier, atrEntry, atrInputs.direction) : 0;

  return (
    <Fade in timeout={400}>
      <Box>
        <SectionHeader
          title="Risk Management Tools"
          subtitle="Position sizing, stop-loss calculators, and portfolio tools"
          icon={<Shield />}
        />

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab icon={<Calculate />} iconPosition="start" label="Position Calculator" />
          <Tab icon={<Shield />} iconPosition="start" label="ATR Stop-Loss" />
          <Tab icon={<CompareArrows />} iconPosition="start" label="Portfolio Simulator" />
        </Tabs>

        {tab === 0 && (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <RiskCalculator />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Risk Guidelines</Typography>
                  {[
                    { rule: 'Max Risk Per Trade', value: '1% of account', color: 'error.main' },
                    { rule: 'Max Portfolio Risk', value: '2% total exposure', color: 'warning.main' },
                    { rule: 'Min Risk:Reward', value: '1:2 or better', color: 'success.main' },
                    { rule: 'Max Drawdown', value: '5% per trade', color: 'error.main' },
                    { rule: 'Max Correlated Positions', value: '3 simultaneous', color: 'info.main' },
                    { rule: 'Weekly Target', value: '1-2% return', color: 'success.main' },
                  ].map((item) => (
                    <Box key={item.rule} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="body2" fontWeight={500}>{item.rule}</Typography>
                      <Chip label={item.value} size="small" sx={{ bgcolor: `${item.color}22`, color: item.color, fontWeight: 600 }} />
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            {/* Quick reference table for different account sizes */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Position Size Quick Reference (1% Risk)</Typography>
                  <Box sx={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: `2px solid ${theme.palette.divider}` }}>
                          <th style={{ padding: 8, textAlign: 'left' }}>Account Size</th>
                          {[10, 15, 20, 25, 30, 40, 50].map(sl => (
                            <th key={sl} style={{ padding: 8, textAlign: 'right' }}>${sl} SL</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[10000, 25000, 50000, 100000, 250000].map(acct => (
                          <tr key={acct} style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <td style={{ padding: 8, fontWeight: 600 }}>{formatCurrency(acct, 0)}</td>
                            {[10, 15, 20, 25, 30, 40, 50].map(sl => {
                              const pos = calculatePositionSize(acct, 1, 2650, 2650 - sl);
                              return (
                                <td key={sl} style={{ padding: 8, textAlign: 'right', fontFamily: '"JetBrains Mono", monospace' }}>
                                  {pos.lots.toFixed(2)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {tab === 1 && (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>ATR-Based Stop Loss Calculator</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="Current ATR (14)" value={atrInputs.atr} onChange={(e) => setAtrInputs({ ...atrInputs, atr: e.target.value })} size="small" type="number" />
                    <Box>
                      <Typography variant="body2" gutterBottom>ATR Multiplier: {atrInputs.multiplier}x</Typography>
                      <Slider
                        value={parseFloat(atrInputs.multiplier)}
                        onChange={(_, v) => setAtrInputs({ ...atrInputs, multiplier: v.toString() })}
                        min={0.5} max={3} step={0.1}
                        marks={[{ value: 1, label: '1x' }, { value: 1.5, label: '1.5x' }, { value: 2, label: '2x' }, { value: 3, label: '3x' }]}
                      />
                    </Box>
                    <TextField label="Entry Price" value={atrInputs.entry} onChange={(e) => setAtrInputs({ ...atrInputs, entry: e.target.value })} size="small" type="number" />

                    {atrStop > 0 && (
                      <>
                        <Divider />
                        <Box sx={{ p: 2, bgcolor: isDark ? 'rgba(255,215,0,0.05)' : 'rgba(26,35,126,0.03)', borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary">Suggested Stop Loss</Typography>
                          <Typography variant="h4" fontWeight={700} color="error.main" fontFamily='"JetBrains Mono", monospace'>
                            {formatCurrency(atrStop)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Distance: {formatCurrency(Math.abs(atrEntry - atrStop))} ({formatPercent(((Math.abs(atrEntry - atrStop)) / atrEntry) * 100)})
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>ATR Stop Levels by Multiplier</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[0.5, 1, 1.5, 2, 2.5, 3].map(m => ({
                      multiplier: `${m}x`,
                      stop: Math.abs(atrEntry - calculateATRStopLoss(atr || 28, m, atrEntry || 2650, 'long')),
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                      <XAxis dataKey="multiplier" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                      <RTooltip contentStyle={{ background: theme.palette.background.paper, borderRadius: 8 }} formatter={(v) => [`$${v}`, 'Stop Distance']} />
                      <Bar dataKey="stop" radius={[4, 4, 0, 0]}>
                        {[0.5, 1, 1.5, 2, 2.5, 3].map((m, i) => (
                          <Cell key={i} fill={m <= 1.5 ? theme.palette.success.main : m <= 2 ? theme.palette.warning.main : theme.palette.error.main} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Recommended: 1.5x ATR for trend-following, 1x ATR for range trading, 2x+ ATR for volatile conditions.
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {tab === 2 && (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Portfolio Allocation</Typography>
                  {Object.entries(allocations).map(([asset, value]) => (
                    <Box key={asset} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={500} sx={{ textTransform: 'capitalize' }}>{asset}</Typography>
                        <Typography variant="body2" fontWeight={700} fontFamily='"JetBrains Mono", monospace'>{value}%</Typography>
                      </Box>
                      <Slider
                        value={value}
                        onChange={(_, v) => handleAllocationChange(asset, v)}
                        min={0}
                        max={100}
                        sx={{
                          color: asset === 'gold' ? '#FFD700' : asset === 'silver' ? '#C0C0C0' : theme.palette.info.main,
                        }}
                      />
                    </Box>
                  ))}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Correlation Risk</Typography>
                    <Chip label={allocations.gold > 50 && allocations.silver > 30 ? 'High' : 'Moderate'} size="small" color={allocations.gold > 50 && allocations.silver > 30 ? 'error' : 'warning'} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Gold-Silver correlation is {GOLD_SILVER_CORRELATION}. High allocation to both increases correlated risk.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>Monte Carlo Simulation ({simDays} Days)</Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Chip label={`Return: ${formatPercent(finalReturn)}`} color={finalReturn >= 0 ? 'success' : 'error'} size="small" />
                      <Chip label={`Max DD: ${formatPercent(maxDD)}`} color={Math.abs(maxDD) > 5 ? 'error' : 'warning'} size="small" />
                    </Box>
                  </Box>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={simData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} label={{ value: 'Day', position: 'insideBottom', offset: -5 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <RTooltip contentStyle={{ background: theme.palette.background.paper, borderRadius: 8 }} formatter={(v) => [formatCurrency(v), 'Equity']} />
                      <Area type="monotone" dataKey="equity" stroke="#FFD700" fill="rgba(255,215,0,0.15)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Fade>
  );
}
