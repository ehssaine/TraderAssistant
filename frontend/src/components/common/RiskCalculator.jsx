import { useState } from 'react';
import {
  Card, CardContent, Typography, TextField, Box, Button, Divider,
  ToggleButtonGroup, ToggleButton, Chip,
} from '@mui/material';
import { Calculate, TrendingUp, TrendingDown } from '@mui/icons-material';
import { calculatePositionSize, calculateRiskReward, formatCurrency, calculateATRStopLoss } from '../../utils/helpers';
import { useAppStore } from '../../context/store';

export default function RiskCalculator({ compact = false }) {
  const { settings } = useAppStore();
  const [direction, setDirection] = useState('long');
  const [values, setValues] = useState({
    accountSize: settings.accountSize.toString(),
    riskPercent: settings.defaultRiskPercent.toString(),
    entry: '',
    stop: '',
    target: '',
    atr: '',
  });

  const update = (field) => (e) => setValues({ ...values, [field]: e.target.value });

  const accountSize = parseFloat(values.accountSize) || 0;
  const riskPercent = parseFloat(values.riskPercent) || 0;
  const entry = parseFloat(values.entry) || 0;
  const stop = parseFloat(values.stop) || 0;
  const target = parseFloat(values.target) || 0;
  const atr = parseFloat(values.atr) || 0;

  const position = entry && stop ? calculatePositionSize(accountSize, riskPercent, entry, stop) : null;
  const rr = entry && stop && target ? calculateRiskReward(entry, target, stop) : 0;

  const handleATRStop = () => {
    if (atr && entry) {
      const stopPrice = calculateATRStopLoss(atr, 1.5, entry, direction);
      setValues({ ...values, stop: stopPrice.toString() });
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: compact ? 2 : 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Calculate sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={600}>Position Size Calculator</Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <ToggleButtonGroup
            value={direction}
            exclusive
            onChange={(_, v) => v && setDirection(v)}
            size="small"
            fullWidth
          >
            <ToggleButton value="long" color="success">
              <TrendingUp sx={{ mr: 0.5, fontSize: 18 }} /> Long
            </ToggleButton>
            <ToggleButton value="short" color="error">
              <TrendingDown sx={{ mr: 0.5, fontSize: 18 }} /> Short
            </ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <TextField label="Account Size ($)" value={values.accountSize} onChange={update('accountSize')} size="small" type="number" />
            <TextField label="Risk (%)" value={values.riskPercent} onChange={update('riskPercent')} size="small" type="number" inputProps={{ step: 0.1, max: 5 }} />
            <TextField label="Entry Price" value={values.entry} onChange={update('entry')} size="small" type="number" />
            <TextField label="Stop Loss" value={values.stop} onChange={update('stop')} size="small" type="number" />
            <TextField label="Target Price" value={values.target} onChange={update('target')} size="small" type="number" />
            <TextField
              label="ATR (14)"
              value={values.atr}
              onChange={update('atr')}
              size="small"
              type="number"
              InputProps={{
                endAdornment: values.atr && values.entry ? (
                  <Button size="small" onClick={handleATRStop} sx={{ fontSize: '0.65rem', minWidth: 'auto', px: 1 }}>
                    Set Stop
                  </Button>
                ) : null,
              }}
            />
          </Box>

          {position && (
            <>
              <Divider />
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Risk Amount</Typography>
                  <Typography variant="h6" color="error.main" fontWeight={700} fontFamily='"JetBrains Mono", monospace'>
                    {formatCurrency(position.riskAmount)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Position Size</Typography>
                  <Typography variant="h6" color="primary.main" fontWeight={700} fontFamily='"JetBrains Mono", monospace'>
                    {position.lots} lots
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Risk:Reward</Typography>
                  <Chip
                    label={`1:${rr}`}
                    size="small"
                    color={rr >= 2 ? 'success' : rr >= 1.5 ? 'warning' : 'error'}
                    sx={{ fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Units</Typography>
                  <Typography variant="body1" fontWeight={600} fontFamily='"JetBrains Mono", monospace'>
                    {position.positionSize}
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
