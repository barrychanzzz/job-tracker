import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Card, CardContent, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Chip, Stack, Divider,
  IconButton,
} from '@mui/material'
import { ArrowLeft, Trash2, Save } from 'lucide-react'
import { db } from '../db/database'
import { useApplicationStore } from '../stores/applicationStore'
import type { JobApplication, MainStatus, SubStatus } from '../types'
import { SUB_STATUS_LABELS, SUB_STATUS_COLORS, MAIN_STATUS_SUBSTATUSES } from '../types'
import { formatDateTime } from '../utils/date'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import StatusBadge from '../components/application/StatusBadge'
import AttachmentManager from '../components/application/AttachmentManager'

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { updateApplication, deleteApplication, updateStatus } = useApplicationStore()
  const [app, setApp] = useState<JobApplication | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<JobApplication>>({})
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    db.applications.get(Number(id)).then((data) => {
      if (data) {
        setApp(data)
        setForm({ ...data })
      }
    })
  }, [id])

  if (!app) {
    return <Typography color="text.secondary">记录不存在</Typography>
  }

  const handleStatusChange = (newMain: MainStatus, newSub: SubStatus) => {
    if (!app.id) return
    updateStatus(app.id, newMain, newSub, app.interviewRound)
    setApp((prev) => prev ? { ...prev, mainStatus: newMain, subStatus: newSub, updatedAt: new Date().toISOString() } : null)
    setForm((prev) => ({ ...prev, mainStatus: newMain, subStatus: newSub }))
  }

  const handleSave = async () => {
    if (!app.id) return
    await updateApplication({ id: app.id, ...form })
    const updated = await db.applications.get(app.id)
    if (updated) {
      setApp(updated)
      setForm({ ...updated })
    }
    setEditing(false)
  }

  const handleDelete = async () => {
    if (!app.id) return
    await deleteApplication(app.id)
    navigate('/applications')
  }

  const availableSubs = MAIN_STATUS_SUBSTATUSES[form.mainStatus ?? app.mainStatus] ?? []

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/applications')}><ArrowLeft size={20} /></IconButton>
        <Typography variant="h5" sx={{ fontWeight: 600, flex: 1 }}>
          {app.positionName}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {editing ? (
            <>
              <Button variant="outlined" onClick={() => { setEditing(false); setForm({ ...app }) }}>
                取消
              </Button>
              <Button variant="contained" startIcon={<Save size={16} />} onClick={handleSave}>
                保存
              </Button>
            </>
          ) : (
            <>
              <Button variant="outlined" onClick={() => setEditing(true)}>
                编辑
              </Button>
              <Button variant="outlined" color="error" startIcon={<Trash2 size={16} />} onClick={() => setDeleteOpen(true)}>
                删除
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Stack spacing={2.5}>
        {/* Status Card */}
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>当前状态</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <StatusBadge subStatus={app.subStatus} interviewRound={app.interviewRound} />

              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>主状态</InputLabel>
                <Select
                  value={form.mainStatus ?? app.mainStatus}
                  label="主状态"
                  onChange={(e) => {
                    const newMain = e.target.value as MainStatus
                    const newSubs = MAIN_STATUS_SUBSTATUSES[newMain] ?? []
                    handleStatusChange(newMain, newSubs[0])
                  }}
                >
                  <MenuItem value="active">进行中</MenuItem>
                  <MenuItem value="paused">暂停</MenuItem>
                  <MenuItem value="ended">已结束</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>子状态</InputLabel>
                <Select
                  value={form.subStatus ?? app.subStatus}
                  label="子状态"
                  onChange={(e) => {
                    const newSub = e.target.value as SubStatus
                    handleStatusChange(form.mainStatus ?? app.mainStatus, newSub)
                  }}
                >
                  {availableSubs.map((s) => (
                    <MenuItem key={s} value={s}>
                      <Chip label={SUB_STATUS_LABELS[s]} size="small" sx={{ bgcolor: SUB_STATUS_COLORS[s] + '18', color: SUB_STATUS_COLORS[s], fontWeight: 600 }} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {(form.subStatus ?? app.subStatus) === 'waiting_interview' && (
                <TextField
                  size="small"
                  type="number"
                  label="面试轮次"
                  value={form.interviewRound ?? app.interviewRound ?? ''}
                  onChange={(e) => {
                    const n = parseInt(e.target.value) || 0
                    setForm((prev) => ({ ...prev, interviewRound: n }))
                  }}
                  sx={{ width: 100 }}
                />
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Detail Fields */}
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>基本信息</Typography>

            <Stack spacing={2}>
              {/* Company */}
              <Box>
                <Typography variant="body2" color="text.secondary">公司名称</Typography>
                {editing ? (
                  <TextField fullWidth size="small" value={form.companyName ?? ''} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
                ) : (
                  <Typography>{app.companyName}</Typography>
                )}
              </Box>

              {/* JD */}
              <Box>
                <Typography variant="body2" color="text.secondary">职位描述 (JD)</Typography>
                {editing ? (
                  <TextField fullWidth multiline rows={4} size="small" value={form.jobDescription ?? ''} onChange={(e) => setForm({ ...form, jobDescription: e.target.value })} />
                ) : (
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>{app.jobDescription || '未填写'}</Typography>
                )}
              </Box>

              <Divider />

              {/* Emails */}
              <Box>
                <Typography variant="body2" color="text.secondary">招聘者邮箱</Typography>
                {editing ? (
                  <TextField fullWidth size="small" value={(form.recruiterEmails ?? []).join(', ')} onChange={(e) => setForm({ ...form, recruiterEmails: e.target.value.split(/[,，\s]+/).filter(Boolean) })} />
                ) : (
                  <Typography>{(app.recruiterEmails ?? []).join(', ') || '未填写'}</Typography>
                )}
              </Box>

              {/* Links */}
              <Box>
                <Typography variant="body2" color="text.secondary">投递链接</Typography>
                {editing ? (
                  <TextField fullWidth size="small" value={(form.applyLinks ?? []).join(', ')} onChange={(e) => setForm({ ...form, applyLinks: e.target.value.split(/[,，\s]+/).filter(Boolean) })} />
                ) : (
                  <Stack spacing={0.5}>
                    {(app.applyLinks ?? []).length > 0 ? app.applyLinks!.map((link, i) => (
                      <Typography key={i} component="a" href={link} target="_blank" color="primary" sx={{ fontSize: '0.875rem' }}>
                        {link}
                      </Typography>
                    )) : <Typography>未填写</Typography>}
                  </Stack>
                )}
              </Box>

              {/* Resume Version */}
              <Box>
                <Typography variant="body2" color="text.secondary">简历版本</Typography>
                {editing ? (
                  <TextField fullWidth size="small" value={form.resumeVersion ?? ''} onChange={(e) => setForm({ ...form, resumeVersion: e.target.value })} />
                ) : (
                  <Typography>{app.resumeVersion || '未填写'}</Typography>
                )}
              </Box>

              <Divider />

              {/* Times */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">创建时间</Typography>
                  <Typography variant="body2">{formatDateTime(app.createdAt)}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">最后更新</Typography>
                  <Typography variant="body2">{formatDateTime(app.updatedAt)}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">投递时间</Typography>
                  <Typography variant="body2">{app.sentTime ? formatDateTime(app.sentTime) : '未记录'}</Typography>
                </Box>
              </Box>

              {/* Notes */}
              <Box>
                <Typography variant="body2" color="text.secondary">备注</Typography>
                {editing ? (
                  <TextField fullWidth multiline rows={3} size="small" value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                ) : (
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>{app.notes || '无'}</Typography>
                )}
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Attachments */}
        {app.id && (
          <Card>
            <CardContent>
              <AttachmentManager applicationId={app.id} readOnly={!editing} />
            </CardContent>
          </Card>
        )}
      </Stack>

      <ConfirmDialog
        open={deleteOpen}
        title="删除记录"
        message={`确定要删除「${app.positionName}」的求职记录吗？此操作不可撤销。`}
        confirmLabel="删除"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </Box>
  )
}
