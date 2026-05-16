import { Box, TextField, ToggleButtonGroup, ToggleButton, Typography } from '@mui/material'
import { ArrowUpDown } from 'lucide-react'
import type { SortField, SortOrder } from '../../stores/uiStore'

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  sortField: SortField
  sortOrder: SortOrder
  onSortFieldChange: (field: SortField) => void
  onSortOrderChange: (order: SortOrder) => void
}

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'updatedAt', label: '最近更新' },
  { value: 'createdAt', label: '创建时间' },
  { value: 'sentTime', label: '投递时间' },
]

export default function SearchBar({ searchQuery, onSearchChange, sortField, sortOrder, onSortFieldChange, onSortOrderChange }: SearchBarProps) {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
      <TextField
        size="small"
        placeholder="搜索岗位名或公司名..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ flex: 1, minWidth: 200, maxWidth: 400 }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
          排序:
        </Typography>
        <ToggleButtonGroup
          size="small"
          value={sortField}
          exclusive
          onChange={(_, v) => v && onSortFieldChange(v)}
        >
          {SORT_OPTIONS.map((opt) => (
            <ToggleButton key={opt.value} value={opt.value} sx={{ px: 1.5, textTransform: 'none' }}>
              {opt.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <ToggleButton
          size="small"
          value="toggle"
          selected={sortOrder === 'asc'}
          onChange={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
          sx={{ minWidth: 40, p: 1 }}
        >
          <ArrowUpDown size={16} />
        </ToggleButton>
      </Box>
    </Box>
  )
}
