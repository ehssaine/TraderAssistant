import { createTheme } from '@mui/material/styles';

const commonTypography = {
  fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
  h1: { fontWeight: 700, fontSize: '2.5rem' },
  h2: { fontWeight: 700, fontSize: '2rem' },
  h3: { fontWeight: 600, fontSize: '1.5rem' },
  h4: { fontWeight: 600, fontSize: '1.25rem' },
  h5: { fontWeight: 600, fontSize: '1.1rem' },
  h6: { fontWeight: 600, fontSize: '1rem' },
  body1: { fontSize: '0.95rem' },
  body2: { fontSize: '0.85rem' },
  caption: { fontSize: '0.75rem' },
  button: { textTransform: 'none', fontWeight: 600 },
};

const commonComponents = {
  MuiCard: {
    styleOverrides: {
      root: { borderRadius: 12, backgroundImage: 'none' },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: { borderRadius: 8, padding: '8px 20px' },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: { backgroundImage: 'none' },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { borderRadius: 8 },
    },
  },
};

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#FFD700', light: '#FFE44D', dark: '#C8A600', contrastText: '#0a0e1a' },
    secondary: { main: '#C0C0C0', light: '#D4D4D4', dark: '#A0A0A0' },
    background: { default: '#0a0e1a', paper: '#131829' },
    success: { main: '#00E676' },
    error: { main: '#FF5252' },
    warning: { main: '#FFB74D' },
    info: { main: '#40C4FF' },
    text: { primary: '#E8EAED', secondary: '#9AA0A6' },
    divider: 'rgba(255,255,255,0.08)',
    gold: '#FFD700',
    silver: '#C0C0C0',
  },
  typography: commonTypography,
  components: {
    ...commonComponents,
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.06)' },
      },
    },
  },
  shape: { borderRadius: 12 },
});

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1a237e', light: '#534bae', dark: '#000051', contrastText: '#ffffff' },
    secondary: { main: '#B8860B', light: '#DAA520', dark: '#8B6508' },
    background: { default: '#f5f5f7', paper: '#ffffff' },
    success: { main: '#2E7D32' },
    error: { main: '#C62828' },
    warning: { main: '#E65100' },
    info: { main: '#0277BD' },
    text: { primary: '#1a1a2e', secondary: '#5f6368' },
    divider: 'rgba(0,0,0,0.08)',
    gold: '#DAA520',
    silver: '#808080',
  },
  typography: commonTypography,
  components: commonComponents,
  shape: { borderRadius: 12 },
});
