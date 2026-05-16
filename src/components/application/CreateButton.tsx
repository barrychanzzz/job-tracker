import { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Typography, IconButton,
} from '@mui/material'
import { Plus, X } from 'lucide-react'
import { useApplicationStore } from '../../stores/applicationStore'
import type { CreateApplicationInput } from '../../types'
import OcrProcessor from '../ocr/OcrUploader'
import type { OcrResult } from '../../services/ocr'

export default function CreateButton() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<CreateApplicationInput>({
    positionName: '',
    companyName: '',
    jobDescription: '',
    applyLinks: [],
    recruiterEmails: [],
    resumeVersion: '',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const createApplication = useApplicationStore((s) => s.createApplication)

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.positionName.trim()) errs.positionName = '请输入岗位名称'
    if (!form.companyName.trim()) errs.companyName = '请输入公司名称'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    await createApplication({
      ...form,
      positionName: form.positionName.trim(),
      companyName: form.companyName.trim(),
    })
    setOpen(false)
    setForm({ positionName: '', companyName: '' })
    setErrors({})
  }

  const handleOcrComplete = (result: OcrResult) => {
    setForm({
      ...form,
      positionName: result.positionName || form.positionName,
      companyName: result.companyName || form.companyName,
      jobDescription: result.jobDescription || form.jobDescription,
    })
  }

  const handleClose = () => {
    setOpen(false)
    setErrors({})
  }

  return (
    <>
      <Button
        variant="contained"
        startIcon={<Plus size={18} />}
        onClick={() => setOpen(true)}
        sx={{ px: 3, py: 1.2, borderRadius: 2 }}
      >
        新增记录
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>新增求职记录</Typography>
          <IconButton onClick={handleClose} size="small"><X size={18} /></IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="岗位名称"
              required
              fullWidth
              value={form.positionName}
              onChange={(e) => setForm({ ...form, positionName: e.target.value })}
              error={!!errors.positionName}
              helperText={errors.positionName}
              placeholder="如：前端开发工程师"
            />
            <TextField
              label="公司名称"
              required
              fullWidth
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              error={!!errors.companyName}
              helperText={errors.companyName}
              placeholder="如：字节跳动"
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <OcrProcessor onComplete={handleOcrComplete} />
            </Box>
            <TextField
              label="职位描述 (JD)"
              fullWidth
              multiline
              rows={3}
              value={form.jobDescription}
              onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
              placeholder="粘贴或通过截图 OCR 自动填入"
            />
            <TextField
              label="招聘者邮箱"
              fullWidth
              value={(form.recruiterEmails ?? []).join(', ')}
              onChange={(e) => setForm({ ...form, recruiterEmails: e.target.value.split(/[,，\s]+/).filter(Boolean) })}
              placeholder="多个邮箱用逗号分隔"
            />
            <TextField
              label="投递链接"
              fullWidth
              value={(form.applyLinks ?? []).join(', ')}
              onChange={(e) => setForm({ ...form, applyLinks: e.target.value.split(/[,，\s]+/).filter(Boolean) })}
              placeholder="多个链接用逗号分隔"
            />
            <TextField
              label="简历版本"
              fullWidth
              value={form.resumeVersion ?? ''}
              onChange={(e) => setForm({ ...form, resumeVersion: e.target.value })}
              placeholder="如：v2-前端"
            />
            <TextField
              label="备注"
              fullWidth
              multiline
              rows={2}
              value={form.notes ?? ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="面试感受、后续动作等"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleClose} color="inherit">取消</Button>
          <Button onClick={handleSubmit} variant="contained">确认创建</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
