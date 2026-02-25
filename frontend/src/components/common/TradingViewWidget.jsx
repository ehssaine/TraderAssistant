import { useEffect, useRef, memo } from 'react';
import { Box, Typography } from '@mui/material';
import { useAppStore } from '../../context/store';

function TradingViewWidget({ symbol = 'OANDA:XAUUSD', interval = 'D', height = 500, hideToolbar = false }) {
  const containerRef = useRef(null);
  const { darkMode } = useAppStore();

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval,
      timezone: 'Etc/UTC',
      theme: darkMode ? 'dark' : 'light',
      style: '1',
      locale: 'en',
      hide_top_toolbar: hideToolbar,
      hide_legend: false,
      allow_symbol_change: true,
      save_image: true,
      studies: ['MASimple@tv-basicstudies', 'RSI@tv-basicstudies'],
      support_host: 'https://www.tradingview.com',
    });

    containerRef.current.appendChild(script);
  }, [symbol, interval, darkMode, hideToolbar]);

  return (
    <Box sx={{ height, width: '100%', overflow: 'hidden', borderRadius: 2 }}>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', bgcolor: 'background.paper' }}>
          <Typography color="text.secondary">Loading chart...</Typography>
        </Box>
      </div>
    </Box>
  );
}

export default memo(TradingViewWidget);
