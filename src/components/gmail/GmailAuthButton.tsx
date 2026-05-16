import { Button, Chip, Typography, Box } from '@mui/material'
import { Mail, LogOut } from 'lucide-react'
import { useGoogleLogin } from '@react-oauth/google'
import { useGmailStore } from '../../stores/gmailStore'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

function DisabledButton() {
  return (
    <Chip
      icon={<Mail size={14} />}
      label="需配置 Client ID"
      size="small"
      color="warning"
      variant="outlined"
    />
  )
}

function ConnectedButton() {
  const { connected, setAccessToken, disconnect, error } = useGmailStore()

  const login = useGoogleLogin({
    onSuccess: (response) => {
      setAccessToken(response.access_token)
    },
    onError: () => {
      useGmailStore.getState().setError('授权失败，请重试')
    },
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
    flow: 'implicit',
  })

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {connected ? (
        <Chip
          icon={<Mail size={14} />}
          label="Gmail 已连接"
          size="small"
          color="success"
          variant="outlined"
          onDelete={disconnect}
          deleteIcon={<LogOut size={14} />}
        />
      ) : (
        <Button
          variant="outlined"
          size="small"
          startIcon={<Mail size={14} />}
          onClick={() => login()}
          sx={{ borderRadius: 2 }}
        >
          连接 Gmail
        </Button>
      )}
      {error && (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      )}
    </Box>
  )
}

export default function GmailAuthButton() {
  if (!CLIENT_ID) return <DisabledButton />
  return <ConnectedButton />
}
