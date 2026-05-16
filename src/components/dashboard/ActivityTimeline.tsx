import { useEffect, useState } from 'react'
import { Box, Typography, Stack } from '@mui/material'
import { Clock } from 'lucide-react'
import { db } from '../../db/database'
import type { ActivityLog } from '../../types'
import { formatRelative } from '../../utils/date'

export default function ActivityTimeline() {
  const [logs, setLogs] = useState<ActivityLog[]>([])

  useEffect(() => {
    db.activityLogs
      .orderBy('timestamp')
      .reverse()
      .limit(5)
      .toArray()
      .then(setLogs)
  }, [])

  if (logs.length === 0) {
    return (
      <Typography color="text.disabled" sx={{ py: 2 }}>
        暂无活动记录
      </Typography>
    )
  }

  return (
    <Stack spacing={1.5}>
      {logs.map((log) => (
        <Box key={log.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Clock size={14} color="#9ca3af" style={{ marginTop: 3 }} />
          <Box>
            <Typography variant="body2">{log.action}</Typography>
            <Typography variant="caption" color="text.disabled">
              {formatRelative(log.timestamp)}
            </Typography>
          </Box>
        </Box>
      ))}
    </Stack>
  )
}
