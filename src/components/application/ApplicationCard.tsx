import { Card, CardContent, Typography, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import type { JobApplication } from '../../types'
import StatusBadge from './StatusBadge'
import { formatRelative } from '../../utils/date'

interface ApplicationCardProps {
  app: JobApplication
}

export default function ApplicationCard({ app }: ApplicationCardProps) {
  const navigate = useNavigate()

  return (
    <Card
      onClick={() => navigate(`/applications/${app.id}`)}
      sx={{
        cursor: 'pointer',
        transition: 'box-shadow 0.15s, transform 0.15s',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
              {app.positionName}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {app.companyName}
            </Typography>
          </Box>
          <StatusBadge subStatus={app.subStatus} interviewRound={app.interviewRound} />
        </Box>

        {app.notes && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {app.notes}
          </Typography>
        )}

        <Typography variant="caption" color="text.disabled">
          更新于 {formatRelative(app.updatedAt)}
        </Typography>
      </CardContent>
    </Card>
  )
}
