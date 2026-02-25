import { useState, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { api } from '../../services/api';
import { formatCurrency, formatPercent } from '../../utils/helpers';

export default function PriceTicker() {
  const [prices, setPrices] = useState(null);

  useEffect(() => {
    api.getPrices().then(setPrices);
    const interval = setInterval(() => api.getPrices().then(setPrices), 30000);
    return () => clearInterval(interval);
  }, []);

  if (!prices) return null;

  const items = [
    { label: 'XAU/USD', ...prices.gold, color: '#FFD700' },
    { label: 'XAG/USD', ...prices.silver, color: '#C0C0C0' },
    { label: 'DXY', ...prices.dxy, color: '#40C4FF' },
  ];

  return (
    <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 }, overflow: 'auto', py: 0.5 }}>
      {items.map((item) => (
        <Box
          key={item.label}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            whiteSpace: 'nowrap',
          }}
        >
          <Typography variant="caption" sx={{ color: item.color, fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}>
            {item.label}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, color: 'text.primary' }}>
            {formatCurrency(item.price, item.label === 'DXY' ? 2 : item.label.includes('XAG') ? 2 : 2)}
          </Typography>
          <Chip
            size="small"
            icon={item.changePercent >= 0 ? <TrendingUp sx={{ fontSize: 14 }} /> : <TrendingDown sx={{ fontSize: 14 }} />}
            label={formatPercent(item.changePercent)}
            color={item.changePercent >= 0 ? 'success' : 'error'}
            variant="outlined"
            sx={{ height: 22, fontSize: '0.7rem', fontFamily: '"JetBrains Mono", monospace' }}
          />
        </Box>
      ))}
    </Box>
  );
}
