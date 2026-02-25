import { Card, CardContent, Typography, Box, Tooltip } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';

export default function MetricCard({ title, value, subtitle, icon, color = 'primary.main', tooltip, sx = {} }) {
  return (
    <Card sx={{ height: '100%', ...sx }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {title}
            {tooltip && (
              <Tooltip title={tooltip} arrow>
                <InfoOutlined sx={{ fontSize: 14, ml: 0.5, verticalAlign: 'text-top', cursor: 'help' }} />
              </Tooltip>
            )}
          </Typography>
          {icon && (
            <Box sx={{ color, opacity: 0.8 }}>{icon}</Box>
          )}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color, fontFamily: '"JetBrains Mono", monospace', mb: 0.5 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
        )}
      </CardContent>
    </Card>
  );
}
