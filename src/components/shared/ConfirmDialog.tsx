import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  danger?: boolean
}

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = '确认', danger }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {danger && <AlertTriangle size={20} color="#ef4444" />}
        <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onCancel} color="inherit">取消</Button>
        <Button onClick={onConfirm} variant="contained" color={danger ? 'error' : 'primary'}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
