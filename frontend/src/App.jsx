import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAppStore } from './context/store';
import { darkTheme, lightTheme } from './context/theme';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import WeeklyAnalysis from './pages/WeeklyAnalysis';
import DailyTrading from './pages/DailyTrading';
import RiskTools from './pages/RiskTools';
import Analytics from './pages/Analytics';
import Journal from './pages/Journal';
import Settings from './pages/Settings';

export default function App() {
  const { darkMode } = useAppStore();

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/weekly" element={<WeeklyAnalysis />} />
            <Route path="/daily" element={<DailyTrading />} />
            <Route path="/risk" element={<RiskTools />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
