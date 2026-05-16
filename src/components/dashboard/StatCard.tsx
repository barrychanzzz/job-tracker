import { Card, CardContent, Typography, Box } from '@mui/material'

interface StatCardProps {
  label: string
  value: number
  color: string
  icon: React.ReactNode
}

export default function StatCard({ label, value, color, icon }: StatCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ color, opacity: 0.7, mt: 0.5 }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  )
}
