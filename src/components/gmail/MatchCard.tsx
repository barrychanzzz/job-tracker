import { Card, CardContent, Typography, Box, Chip, Button } from '@mui/material'
import { Send, Inbox, CheckCircle } from 'lucide-react'
import type { GmailMatch } from '../../stores/gmailStore'
import { classifyEmail } from '../../services/gmail'
import { formatRelative } from '../../utils/date'

interface MatchCardProps {
  match: GmailMatch
  onConfirm: (match: GmailMatch) => void
  confirmed: boolean
}

const TYPE_LABELS = {
  sent: { label: '已发送', icon: Send, color: '#3b82f6' },
  received: { label: '收件', icon: Inbox, color: '#8b5cf6' },
}

const CLASSIFY_LABELS: Record<string, { label: string; color: string }> = {
  interview: { label: '面试邀请', color: '#f59e0b' },
  rejection: { label: '拒信', color: '#ef4444' },
  offer: { label: 'Offer', color: '#10b981' },
  general: { label: '一般回复', color: '#6b7280' },
}

export default function MatchCard({ match, onConfirm, confirmed }: MatchCardProps) {
  const typeInfo = TYPE_LABELS[match.matchType]
  const classify = match.matchType === 'received' ? classifyEmail(match) : null
  const classifyInfo = classify ? CLASSIFY_LABELS[classify] : null

  return (
    <Card sx={{ mb: 1.5, opacity: confirmed ? 0.5 : 1 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Chip label={typeInfo.label} size="small" sx={{ bgcolor: typeInfo.color + '15', color: typeInfo.color, fontWeight: 600 }} />
              {classifyInfo && (
                <Chip label={classifyInfo.label} size="small" sx={{ bgcolor: classifyInfo.color + '15', color: classifyInfo.color, fontWeight: 600 }} />
              )}
            </Box>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
              {match.subject || '(无主题)'}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {match.matchType === 'sent' ? `发送至: ${match.to}` : `来自: ${match.from}`}
            </Typography>
            {match.matchedApplicationName && (
              <Typography variant="caption" color="primary">
                关联: {match.matchedApplicationName}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, flexShrink: 0 }}>
            <Typography variant="caption" color="text.disabled">
              {formatRelative(match.date)}
            </Typography>
            {confirmed ? (
              <CheckCircle size={18} color="#10b981" />
            ) : (
              <Button size="small" variant="contained" onClick={() => onConfirm(match)} sx={{ fontSize: '0.75rem', px: 1.5 }}>
                确认
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
