import { Box, Typography, Chip } from '@mui/material';

export default function SectionHeader({ title, subtitle, icon, badge, action, sx = {} }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1, ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {icon && <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" fontWeight={700}>{title}</Typography>
            {badge && <Chip label={badge} size="small" color="primary" variant="outlined" />}
          </Box>
          {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
        </Box>
      </Box>
      {action && <Box>{action}</Box>}
    </Box>
  );
}
