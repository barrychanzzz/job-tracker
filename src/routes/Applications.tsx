import { useEffect, useMemo } from 'react'
import { Box, Tabs, Tab, Typography, Stack } from '@mui/material'
import { useApplicationStore } from '../stores/applicationStore'
import { useUIStore } from '../stores/uiStore'
import ApplicationCard from '../components/application/ApplicationCard'
import CreateButton from '../components/application/CreateButton'
import SearchBar from '../components/shared/SearchBar'
import ScanResultList from '../components/gmail/ScanResultList'
import type { MainStatus } from '../types'
import { MAIN_STATUS_LABELS } from '../types'

const TABS: MainStatus[] = ['active', 'paused', 'ended']

export default function Applications() {
  const { applications, loading, loadApplications } = useApplicationStore()
  const { activeTab, setActiveTab, searchQuery, sortField, sortOrder, setSortField, setSortOrder } = useUIStore()

  useEffect(() => {
    loadApplications()
  }, [loadApplications])

  const filtered = useMemo(() => {
    let result = applications.filter((a) => a.mainStatus === activeTab)

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (a) =>
          a.positionName.toLowerCase().includes(q) ||
          a.companyName.toLowerCase().includes(q)
      )
    }

    result.sort((a, b) => {
      const aVal = (a as any)[sortField] ?? ''
      const bVal = (b as any)[sortField] ?? ''
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortOrder === 'asc' ? cmp : -cmp
    })

    return result
  }, [applications, activeTab, searchQuery, sortField, sortOrder])

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>求职记录</Typography>
        <CreateButton />
      </Box>

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={(q) => useUIStore.getState().setSearchQuery(q)}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortFieldChange={setSortField}
        onSortOrderChange={setSortOrder}
      />

      <ScanResultList />

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        {TABS.map((tab) => (
          <Tab
            key={tab}
            value={tab}
            label={`${MAIN_STATUS_LABELS[tab]} (${applications.filter((a) => a.mainStatus === tab).length})`}
          />
        ))}
      </Tabs>

      {loading ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>加载中...</Typography>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            暂无记录
          </Typography>
          <Typography color="text.disabled">
            点击「新增记录」开始追踪你的求职进度
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {filtered.map((app) => (
            <ApplicationCard key={app.id} app={app} />
          ))}
        </Stack>
      )}
    </Box>
  )
}
