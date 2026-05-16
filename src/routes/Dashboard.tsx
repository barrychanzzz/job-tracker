import { useEffect, useMemo } from 'react'
import { Box, Typography, Card, CardContent } from '@mui/material'
import { Briefcase, UserCheck, Award, XCircle } from 'lucide-react'
import { useApplicationStore } from '../stores/applicationStore'
import StatCard from '../components/dashboard/StatCard'
import StatusPieChart from '../components/dashboard/StatusPieChart'
import ActivityTimeline from '../components/dashboard/ActivityTimeline'
import { MAIN_STATUS_LABELS } from '../types'

export default function Dashboard() {
  const { applications, loadApplications } = useApplicationStore()

  useEffect(() => {
    loadApplications()
  }, [loadApplications])

  const stats = useMemo(() => {
    const total = applications.length
    const interviewing = applications.filter(
      (a) => a.subStatus === 'waiting_interview' || a.subStatus === 'interview_done'
    ).length
    const offers = applications.filter((a) => a.subStatus === 'offer').length
    const rejected = applications.filter((a) => a.subStatus === 'rejected').length

    const interviewRate = total > 0 ? Math.round((interviewing / total) * 100) : 0
    const offerRate = total > 0 ? Math.round((offers / total) * 100) : 0

    const pieData = Object.entries(MAIN_STATUS_LABELS).map(([key, label]) => ({
      name: label,
      value: applications.filter((a) => a.mainStatus === key).length,
      color: key === 'active' ? '#3b82f6' : key === 'paused' ? '#f59e0b' : '#10b981',
    }))

    return { total, interviewing, offers, rejected, interviewRate, offerRate, pieData }
  }, [applications])

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>仪表盘</Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <StatCard label="总投递" value={stats.total} color="#3b82f6" icon={<Briefcase size={28} />} />
        <StatCard label="面试中" value={stats.interviewing} color="#f59e0b" icon={<UserCheck size={28} />} />
        <StatCard label="Offer" value={stats.offers} color="#10b981" icon={<Award size={28} />} />
        <StatCard label="已拒" value={stats.rejected} color="#ef4444" icon={<XCircle size={28} />} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>状态分布</Typography>
            <StatusPieChart data={stats.pieData} />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>效率指标</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">面试转化率</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b82f6' }}>{stats.interviewRate}%</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Offer 率</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981' }}>{stats.offerRate}%</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>最近活动</Typography>
          <ActivityTimeline />
        </CardContent>
      </Card>
    </Box>
  )
}
