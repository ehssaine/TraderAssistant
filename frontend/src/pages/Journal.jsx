import { useState } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Button, TextField, Fade,
  useTheme, Chip, IconButton, Tooltip, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import {
  MenuBook, Add, Delete, Edit, Download, CalendarMonth,
} from '@mui/icons-material';
import SectionHeader from '../components/common/SectionHeader';
import { useAppStore } from '../context/store';
import { generateId } from '../utils/helpers';
import { format } from 'date-fns';

export default function Journal() {
  const theme = useTheme();
  const { journalEntries, addJournalEntry, updateJournalEntry } = useAppStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [entry, setEntry] = useState({ title: '', type: 'daily', content: '', tags: '' });

  const handleSave = () => {
    const data = {
      ...entry,
      tags: entry.tags.split(',').map(t => t.trim()).filter(Boolean),
      date: new Date().toISOString(),
    };
    if (editId) {
      updateJournalEntry(editId, data);
    } else {
      addJournalEntry({ ...data, id: generateId() });
    }
    setDialogOpen(false);
    setEntry({ title: '', type: 'daily', content: '', tags: '' });
    setEditId(null);
  };

  const openEdit = (j) => {
    setEditId(j.id);
    setEntry({ title: j.title, type: j.type, content: j.content, tags: (j.tags || []).join(', ') });
    setDialogOpen(true);
  };

  const typeColor = (type) => {
    if (type === 'weekly') return 'primary';
    if (type === 'trade') return 'success';
    if (type === 'review') return 'warning';
    return 'default';
  };

  return (
    <Fade in timeout={400}>
      <Box>
        <SectionHeader
          title="Trading Journal"
          subtitle="Record observations, trade rationale, and lessons learned"
          icon={<MenuBook />}
          action={
            <Button variant="contained" startIcon={<Add />} onClick={() => { setEditId(null); setEntry({ title: '', type: 'daily', content: '', tags: '' }); setDialogOpen(true); }}>
              New Entry
            </Button>
          }
        />

        {journalEntries.length === 0 ? (
          <Card>
            <CardContent sx={{ p: 6, textAlign: 'center' }}>
              <MenuBook sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
              <Typography variant="h6" color="text.secondary">No journal entries yet</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Start journaling your trading observations, analysis, and lessons learned.
              </Typography>
              <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
                Create First Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2.5}>
            {journalEntries.map((j) => (
              <Grid size={{ xs: 12, md: 6 }} key={j.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>{j.title}</Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                          <Chip label={j.type} size="small" color={typeColor(j.type)} sx={{ height: 20, fontSize: '0.65rem' }} />
                          <Chip label={format(new Date(j.date), 'MMM dd, yyyy')} size="small" variant="outlined" icon={<CalendarMonth sx={{ fontSize: 12 }} />} sx={{ height: 20, fontSize: '0.65rem' }} />
                        </Box>
                      </Box>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(j)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto' }}>
                      {j.content}
                    </Typography>
                    {j.tags?.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 1.5, flexWrap: 'wrap' }}>
                        {j.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.6rem' }} />
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>{editId ? 'Edit Journal Entry' : 'New Journal Entry'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField label="Title" value={entry.title} onChange={(e) => setEntry({ ...entry, title: e.target.value })} fullWidth size="small" />
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select value={entry.type} onChange={(e) => setEntry({ ...entry, type: e.target.value })} label="Type">
                  <MenuItem value="daily">Daily Review</MenuItem>
                  <MenuItem value="weekly">Weekly Analysis</MenuItem>
                  <MenuItem value="trade">Trade Analysis</MenuItem>
                  <MenuItem value="review">Performance Review</MenuItem>
                  <MenuItem value="note">General Note</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Content"
                multiline
                rows={10}
                value={entry.content}
                onChange={(e) => setEntry({ ...entry, content: e.target.value })}
                fullWidth
                placeholder="Write your journal entry here..."
              />
              <TextField
                label="Tags (comma-separated)"
                value={entry.tags}
                onChange={(e) => setEntry({ ...entry, tags: e.target.value })}
                fullWidth
                size="small"
                placeholder="gold, bullish, FOMC, breakout"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSave} disabled={!entry.title || !entry.content}>
              {editId ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}
