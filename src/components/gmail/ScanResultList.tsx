import { useState } from 'react'
import {
  Box, Typography, Button, Stack, LinearProgress, Alert,
  IconButton, Tabs, Tab,
} from '@mui/material'
import { RefreshCw, X } from 'lucide-react'
import { useGmailStore, type GmailMatch } from '../../stores/gmailStore'
import { useApplicationStore } from '../../stores/applicationStore'
import { scanSentMail, scanInboxMail, classifyEmail } from '../../services/gmail'
import MatchCard from './MatchCard'
import GmailAuthButton from './GmailAuthButton'

export default function ScanResultList() {
  const { accessToken, connected, scanning, scanResults, setScanning, setScanResults, setError, clearScanResults } = useGmailStore()
  const { createApplication, updateStatus } = useApplicationStore()
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set())
  const [tab, setTab] = useState(0)

  const handleScan = async () => {
    if (!accessToken) return
    setScanning(true)
    try {
      const [sent, inbox] = await Promise.all([
        scanSentMail(accessToken),
        scanInboxMail(accessToken),
      ])
      setScanResults([...sent, ...inbox])
    } catch (err: any) {
      setError(err.message || '扫描失败')
    }
  }

  const handleConfirm = async (match: GmailMatch) => {
    if (match.matchType === 'sent') {
      // Create new application from sent mail
      await createApplication({
        positionName: match.subject.slice(0, 50),
        companyName: '',
        recruiterEmails: match.to.match(/[\w.-]+@[\w.-]+\.\w+/g) ?? [],
        sentTime: match.date,
        notes: `来自 Gmail 自动匹配: ${match.subject}`,
      })
    } else if (match.matchType === 'received' && match.matchedApplicationId) {
      // Update status based on email classification
      const classify = classifyEmail(match)
      const replyTime = match.date

      // Add reply time
      await useApplicationStore.getState().updateApplication({
        id: match.matchedApplicationId,
        replyTimes: [replyTime],
      })

      // Update status if classified
      if (classify === 'interview') {
        await updateStatus(match.matchedApplicationId, 'active', 'waiting_interview', 1)
      } else if (classify === 'rejection') {
        await updateStatus(match.matchedApplicationId, 'ended', 'rejected')
      } else if (classify === 'offer') {
        await updateStatus(match.matchedApplicationId, 'ended', 'offer')
      }
    }

    setConfirmed((prev) => new Set([...prev, match.id]))
  }

  const sentMail = scanResults.filter((r) => r.matchType === 'sent')
  const inboxMail = scanResults.filter((r) => r.matchType === 'received')

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Gmail 邮件匹配
          </Typography>
          <GmailAuthButton />
        </Box>
        {connected && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {scanResults.length > 0 && (
              <IconButton size="small" onClick={clearScanResults}>
                <X size={16} />
              </IconButton>
            )}
            <Button
              variant="contained"
              size="small"
              startIcon={<RefreshCw size={14} />}
              onClick={handleScan}
              disabled={scanning}
              sx={{ borderRadius: 2 }}
            >
              {scanning ? '扫描中...' : '扫描邮件'}
            </Button>
          </Box>
        )}
      </Box>

      {scanning && <LinearProgress sx={{ mb: 2, borderRadius: 2 }} />}

      {!connected && (
        <Alert severity="info" sx={{ mb: 2 }}>
          请先连接 Gmail 以自动匹配求职邮件
        </Alert>
      )}

      {scanResults.length > 0 && (
        <>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label={`发件箱 (${sentMail.length})`} />
            <Tab label={`收件箱 (${inboxMail.length})`} />
            <Tab label={`全部 (${scanResults.length})`} />
          </Tabs>

          <Stack>
            {(tab === 0 ? sentMail : tab === 1 ? inboxMail : scanResults).map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onConfirm={handleConfirm}
                confirmed={confirmed.has(match.id)}
              />
            ))}
          </Stack>
        </>
      )}

      {!scanning && scanResults.length === 0 && connected && (
        <Typography color="text.secondary" sx={{ py: 3 }}>
          点击「扫描邮件」开始匹配求职相关邮件
        </Typography>
      )}
    </Box>
  )
}
