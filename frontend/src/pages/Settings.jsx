import { useState } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, TextField, Button, Fade,
  useTheme, Switch, FormControlLabel, Divider, Alert, Avatar, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  Settings as SettingsIcon, AccountCircle, Palette, Notifications,
  Storage, Shield, DarkMode, LightMode, Save, Login, Logout,
} from '@mui/icons-material';
import SectionHeader from '../components/common/SectionHeader';
import { useAppStore } from '../context/store';

export default function Settings() {
  const theme = useTheme();
  const {
    darkMode, toggleDarkMode, user, login, logout, enableDemo,
    settings, updateSettings, isDemo,
  } = useAppStore();
  const [loginDialog, setLoginDialog] = useState(false);
  const [username, setUsername] = useState('');
  const [localSettings, setLocalSettings] = useState(settings);

  const handleLogin = () => {
    if (username.trim()) {
      login(username.trim());
      setLoginDialog(false);
      setUsername('');
    }
  };

  const handleSaveSettings = () => {
    updateSettings(localSettings);
  };

  return (
    <Fade in timeout={400}>
      <Box>
        <SectionHeader title="Settings" subtitle="Configure your trading dashboard" icon={<SettingsIcon />} />

        <Grid container spacing={2.5}>
          {/* Account */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AccountCircle sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600}>Account</Typography>
                </Box>
                {user ? (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                        {user.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>{user.username}</Typography>
                        <Chip label={isDemo ? 'Demo Mode' : 'Active'} size="small" color={isDemo ? 'warning' : 'success'} sx={{ mt: 0.5 }} />
                      </Box>
                    </Box>
                    <Button variant="outlined" startIcon={<Logout />} onClick={logout} color="error" size="small">
                      Logout
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Login to save your journals, watchlists, and trade history.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="contained" startIcon={<Login />} onClick={() => setLoginDialog(true)}>
                        Login
                      </Button>
                      <Button variant="outlined" onClick={enableDemo}>
                        Demo Mode
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Appearance */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Palette sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600}>Appearance</Typography>
                </Box>
                <FormControlLabel
                  control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {darkMode ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}
                      <Typography variant="body2">{darkMode ? 'Dark Mode' : 'Light Mode'}</Typography>
                    </Box>
                  }
                />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Dark mode is recommended for extended trading sessions to reduce eye strain.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Trading Settings */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Shield sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600}>Trading Defaults</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Account Size ($)"
                    type="number"
                    value={localSettings.accountSize}
                    onChange={(e) => setLocalSettings({ ...localSettings, accountSize: parseFloat(e.target.value) || 0 })}
                    size="small"
                  />
                  <TextField
                    label="Default Risk Per Trade (%)"
                    type="number"
                    value={localSettings.defaultRiskPercent}
                    onChange={(e) => setLocalSettings({ ...localSettings, defaultRiskPercent: parseFloat(e.target.value) || 0 })}
                    size="small"
                    inputProps={{ step: 0.1, max: 5 }}
                  />
                  <Button variant="contained" startIcon={<Save />} onClick={handleSaveSettings} size="small">
                    Save Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Notifications */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Notifications sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600}>Notifications</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={<Switch checked={localSettings.notifications} onChange={(e) => setLocalSettings({ ...localSettings, notifications: e.target.checked })} />}
                    label={<Typography variant="body2">Enable notifications</Typography>}
                  />
                  <FormControlLabel
                    control={<Switch checked={localSettings.autoSave} onChange={(e) => setLocalSettings({ ...localSettings, autoSave: e.target.checked })} />}
                    label={<Typography variant="body2">Auto-save journals</Typography>}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Data */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Storage sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600}>Data Management</Typography>
                </Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  All data is stored locally in your browser. Connect to the backend API for cloud sync.
                </Alert>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" size="small">Export Data (JSON)</Button>
                  <Button variant="outlined" size="small">Import Data</Button>
                  <Button variant="outlined" color="error" size="small">Clear All Data</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Dialog open={loginDialog} onClose={() => setLoginDialog(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Login</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter a username to save your data. This is a simplified demo login.
            </Typography>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              size="small"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLoginDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleLogin} disabled={!username.trim()}>Login</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}
