import { Component, type ReactNode } from 'react'
import { Box, Typography, Button } from '@mui/material'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <AlertTriangle size={48} color="#ef4444" className="mx-auto mb-3" />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            出错了
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {this.state.error?.message || '发生了未知错误'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              this.setState({ hasError: false })
              window.location.reload()
            }}
          >
            刷新页面
          </Button>
        </Box>
      )
    }
    return this.props.children
  }
}
