import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Box, Drawer, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, IconButton, useMediaQuery, useTheme, Divider,
  Chip, Avatar, Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon, CalendarMonth, ShowChart, Assessment,
  MenuBook, Settings, Menu as MenuIcon, DarkMode, LightMode,
  AccountCircle, TrendingUp, Logout, Calculate, AutoAwesome,
} from '@mui/icons-material';
import { useAppStore } from '../../context/store';
import PriceTicker from '../common/PriceTicker';

const DRAWER_WIDTH = 260;

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Weekly Analysis', icon: <CalendarMonth />, path: '/weekly' },
  { text: 'Daily Trading', icon: <ShowChart />, path: '/daily' },
  { text: 'Risk Tools', icon: <Calculate />, path: '/risk' },
  { text: 'Analytics', icon: <Assessment />, path: '/analytics' },
  { text: 'Journal', icon: <MenuBook />, path: '/journal' },
  { text: 'AI Summary', icon: <AutoAwesome />, path: '/ai-summary' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

export default function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode, user, logout } = useAppStore();

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <TrendingUp sx={{ color: 'primary.main', fontSize: 32 }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, color: 'primary.main' }}>
            TraderAssistant
          </Typography>
          <Typography variant="caption" color="text.secondary">Gold & Silver Pro</Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ flex: 1, px: 1, py: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => { navigate(item.path); isMobile && setMobileOpen(false); }}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                  '&:hover': { bgcolor: 'primary.dark' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', color: 'primary.contrastText', fontSize: '0.85rem' }}>
              {user.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" noWrap fontWeight={500}>{user.username}</Typography>
            </Box>
            <Tooltip title="Logout">
              <IconButton size="small" onClick={logout}><Logout fontSize="small" /></IconButton>
            </Tooltip>
          </Box>
        )}
        <Chip
          size="small"
          label="Demo Mode"
          color="warning"
          variant="outlined"
          sx={{ fontSize: '0.7rem' }}
        />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {isMobile && (
            <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)}>
              <MenuIcon />
            </IconButton>
          )}
          <PriceTicker />
          <Box sx={{ flex: 1 }} />
          <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
            <IconButton onClick={toggleDarkMode} color="inherit">
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Account">
            <IconButton onClick={() => navigate('/settings')} color="inherit">
              <AccountCircle />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: 0 }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
                borderRight: 1,
                borderColor: 'divider',
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
        <Box
          component="footer"
          sx={{ p: 2, textAlign: 'center', borderTop: 1, borderColor: 'divider' }}
        >
          <Typography variant="caption" color="text.secondary">
            Disclaimer: This tool is for educational purposes only. Trading involves risk. Consult a financial advisor before trading. Past performance does not guarantee future results.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
