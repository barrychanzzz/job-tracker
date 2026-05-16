import { Box, Typography, Button } from '@mui/material'
import { FileSearch } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Box sx={{ mb: 2, opacity: 0.3 }}>
        {icon ?? <FileSearch size={48} className="mx-auto" />}
      </Box>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography color="text.disabled" sx={{ mb: 3 }}>
          {description}
        </Typography>
      )}
      {action && (
        <Button variant="contained" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Box>
  )
}
