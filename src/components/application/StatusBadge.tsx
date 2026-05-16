import { Chip } from '@mui/material'
import type { SubStatus } from '../../types'
import { SUB_STATUS_LABELS, SUB_STATUS_COLORS } from '../../types'
import { getInterviewRoundLabel } from '../../utils/status'

interface StatusBadgeProps {
  subStatus: SubStatus
  interviewRound?: number
}

export default function StatusBadge({ subStatus, interviewRound }: StatusBadgeProps) {
  const label = subStatus === 'waiting_interview' && interviewRound
    ? getInterviewRoundLabel(interviewRound)
    : SUB_STATUS_LABELS[subStatus]

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: SUB_STATUS_COLORS[subStatus] + '18',
        color: SUB_STATUS_COLORS[subStatus],
        fontWeight: 600,
        fontSize: '0.75rem',
      }}
    />
  )
}
