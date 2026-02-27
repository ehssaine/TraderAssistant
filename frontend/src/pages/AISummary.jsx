import { useState, useEffect } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Button, Tabs, Tab, Chip,
  CircularProgress, Fade, IconButton, Tooltip, Divider, useTheme, Alert,
  Paper, Collapse,
} from '@mui/material';
import {
  AutoAwesome, CalendarMonth, ShowChart, Delete, Refresh,
  ExpandMore, ExpandLess, History, Psychology,
} from '@mui/icons-material';
import SectionHeader from '../components/common/SectionHeader';
import { api } from '../services/api';
import { useAppStore } from '../context/store';

export default function AISummary() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { weeklyPlan, calendarNotes } = useAppStore();

  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [dailySummary, setDailySummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await api.getAISummaries();
      setHistory(data);
    } catch {
      // Silently fail — history is optional
    } finally {
      setHistoryLoading(false);
    }
  };

  const generateWeeklySummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.generateWeeklySummary({ weeklyPlan, calendarNotes });
      setWeeklySummary(result);
      loadHistory();
    } catch (err) {
      setError('Failed to generate weekly summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateDailySummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.generateDailySummary({
        weeklyPlan,
        eodReview: {},
      });
      setDailySummary(result);
      loadHistory();
    } catch (err) {
      setError('Failed to generate daily summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteAISummary(id);
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch {
      // ignore
    }
  };

  const toggleExpand = (id) => {
    setExpandedHistory(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const currentSummary = tab === 0 ? weeklySummary : dailySummary;

  return (
    <Fade in timeout={600}>
      <Box>
        <SectionHeader
          title="AI Analysis Summary"
          subtitle="Generate AI-powered summaries of your weekly and daily trading analysis"
          icon={<AutoAwesome />}
          badge="AI"
        />

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab icon={<CalendarMonth />} iconPosition="start" label="Weekly Summary" />
          <Tab icon={<ShowChart />} iconPosition="start" label="Daily Summary" />
          <Tab icon={<History />} iconPosition="start" label="History" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tab 0: Weekly Summary */}
        {tab === 0 && (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Card>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarMonth fontSize="small" /> Weekly Context
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <ContextItem label="Bias" value={weeklyPlan.bias || 'Not set'} color={
                      weeklyPlan.bias === 'bullish' ? 'success' : weeklyPlan.bias === 'bearish' ? 'error' : 'default'
                    } />
                    <ContextItem label="Key Levels" value={weeklyPlan.keyLevels || 'None specified'} />
                    <ContextItem label="Catalysts" value={weeklyPlan.catalysts || 'None specified'} />
                    <ContextItem label="Notes" value={weeklyPlan.notes || 'None'} />
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    The AI will also include your recent trades, journal entries, economic calendar, COT data, and Fed Watch probabilities.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesome />}
                    onClick={generateWeeklySummary}
                    disabled={loading}
                    fullWidth
                    size="large"
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': { background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4293 100%)' },
                    }}
                  >
                    {loading ? 'Generating...' : 'Generate Weekly Summary'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <SummaryCard summary={currentSummary} type="weekly" isDark={isDark} />
            </Grid>
          </Grid>
        )}

        {/* Tab 1: Daily Summary */}
        {tab === 1 && (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Card>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShowChart fontSize="small" /> Daily Context
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    The AI will analyze today's trades, news sentiment, your end-of-day review, and compare against your weekly bias.
                  </Typography>
                  {weeklyPlan.bias && (
                    <Chip
                      label={`Weekly Bias: ${weeklyPlan.bias.toUpperCase()}`}
                      color={weeklyPlan.bias === 'bullish' ? 'success' : weeklyPlan.bias === 'bearish' ? 'error' : 'default'}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  )}
                  <Alert severity="info" sx={{ mb: 2 }}>
                    For the best daily summary, fill in your End-of-Day review in the Daily Trading page first.
                  </Alert>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesome />}
                    onClick={generateDailySummary}
                    disabled={loading}
                    fullWidth
                    size="large"
                    sx={{
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      '&:hover': { background: 'linear-gradient(135deg, #e080ea 0%, #e04d60 100%)' },
                    }}
                  >
                    {loading ? 'Generating...' : 'Generate Daily Summary'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <SummaryCard summary={dailySummary} type="daily" isDark={isDark} />
            </Grid>
          </Grid>
        )}

        {/* Tab 2: History */}
        {tab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>Past Summaries</Typography>
              <Tooltip title="Refresh">
                <IconButton onClick={loadHistory} disabled={historyLoading}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>

            {historyLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {!historyLoading && history.length === 0 && (
              <Card>
                <CardContent sx={{ py: 6, textAlign: 'center' }}>
                  <Psychology sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="h6" color="text.secondary">No summaries yet</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Generate your first weekly or daily summary to see it here.
                  </Typography>
                </CardContent>
              </Card>
            )}

            {history.map((item) => (
              <Card key={item.id} sx={{ mb: 1.5 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={item.type}
                        size="small"
                        color={item.type === 'weekly' ? 'primary' : 'secondary'}
                        sx={{ fontSize: '0.7rem', height: 22 }}
                      />
                      <Chip
                        label={item.model}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.65rem', height: 20 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => toggleExpand(item.id)}>
                        {expandedHistory[item.id] ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(item.id)} color="error">
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Collapse in={expandedHistory[item.id]}>
                    <Box sx={{ mt: 1.5 }}>
                      <MarkdownContent content={item.summary} isDark={isDark} />
                    </Box>
                  </Collapse>
                  {!expandedHistory[item.id] && (
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.5 }}>
                      {item.summary.replace(/[#*_\n]/g, ' ').slice(0, 120)}...
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Fade>
  );
}

// ── Sub Components ───────────────────────────────────────────────────────

function ContextItem({ label, value, color }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      {color ? (
        <Chip label={value} size="small" color={color} variant="outlined" sx={{ fontSize: '0.75rem' }} />
      ) : (
        <Typography variant="body2" fontWeight={500} sx={{ maxWidth: '60%', textAlign: 'right' }} noWrap>
          {value}
        </Typography>
      )}
    </Box>
  );
}

function SummaryCard({ summary, type, isDark }) {
  if (!summary) {
    return (
      <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <AutoAwesome sx={{ fontSize: 56, color: 'text.secondary', mb: 2, opacity: 0.4 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No {type} summary yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click the generate button to create an AI-powered summary of your {type} analysis.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesome fontSize="small" sx={{ color: type === 'weekly' ? '#667eea' : '#f5576c' }} />
            {type === 'weekly' ? 'Weekly' : 'Daily'} Summary
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Chip label={summary.model} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
            <Typography variant="caption" color="text.secondary">
              {new Date(summary.generatedAt).toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>
        <MarkdownContent content={summary.summary} isDark={isDark} />
      </CardContent>
    </Card>
  );
}

function MarkdownContent({ content, isDark }) {
  // Simple markdown renderer for bold, headers, bullets, and italic
  const lines = content.split('\n');

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
        borderRadius: 2,
        maxHeight: 500,
        overflow: 'auto',
      }}
    >
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <Box key={i} sx={{ height: 8 }} />;

        // Headers
        if (trimmed.startsWith('## ')) {
          return (
            <Typography key={i} variant="subtitle1" fontWeight={700} sx={{ mt: i > 0 ? 1.5 : 0, mb: 0.5 }}>
              {renderInline(trimmed.slice(3))}
            </Typography>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <Typography key={i} variant="h6" fontWeight={700} sx={{ mt: i > 0 ? 1.5 : 0, mb: 0.5 }}>
              {renderInline(trimmed.slice(2))}
            </Typography>
          );
        }

        // Bullet points
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <Box key={i} sx={{ display: 'flex', gap: 1, pl: 1, py: 0.2 }}>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>•</Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{renderInline(trimmed.slice(2))}</Typography>
            </Box>
          );
        }

        // Regular text
        return (
          <Typography key={i} variant="body2" sx={{ lineHeight: 1.6, py: 0.15 }}>
            {renderInline(trimmed)}
          </Typography>
        );
      })}
    </Paper>
  );
}

function renderInline(text) {
  // Handle **bold** and *italic*
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/\*(.+?)\*/);

    const match = boldMatch && (!italicMatch || boldMatch.index <= italicMatch.index) ? boldMatch : italicMatch;
    const isBold = match === boldMatch;

    if (match && match.index !== undefined) {
      if (match.index > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, match.index)}</span>);
      }
      parts.push(
        isBold
          ? <strong key={key++}>{match[1]}</strong>
          : <em key={key++}>{match[1]}</em>
      );
      remaining = remaining.slice(match.index + match[0].length);
    } else {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }
  }

  return parts;
}
