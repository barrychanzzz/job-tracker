import { useState, useRef, useCallback } from 'react'
import {
  Box, Typography, LinearProgress, Button, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Stack,
} from '@mui/material'
import { Upload, X, ScanLine } from 'lucide-react'
import { recognizeImage, type OcrResult } from '../../services/ocr'

interface OcrProcessorProps {
  onComplete: (result: OcrResult) => void
}

export default function OcrProcessor({ onComplete }: OcrProcessorProps) {
  const [open, setOpen] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const [preview, setPreview] = useState<OcrResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [editing, setEditing] = useState(false)
  const [editResult, setEditResult] = useState<OcrResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  const readFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      setImage(reader.result as string)
      setPreview(null)
      runOcr(reader.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const runOcr = async (imgData: string) => {
    setLoading(true)
    setProgress(0)
    setStatus('正在加载模型...')
    try {
      const result = await recognizeImage(imgData, (p, s) => {
        setProgress(p)
        setStatus(s)
      })
      setPreview(result)
      setEditResult({ ...result })
    } catch (err) {
      console.error('OCR error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      readFile(file)
    }
  }, [readFile])

  const handleConfirm = () => {
    if (editResult) onComplete(editResult)
    handleClose()
  }

  const handleClose = () => {
    setOpen(false)
    setImage(null)
    setPreview(null)
    setLoading(false)
    setEditing(false)
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<ScanLine size={16} />}
        onClick={() => setOpen(true)}
        sx={{ borderRadius: 2 }}
      >
        OCR 截图录入
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>截图 OCR 录入</Typography>
          <IconButton onClick={handleClose} size="small"><X size={18} /></IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {!image ? (
            <Box
              ref={dropRef}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: '2px dashed #d1d5db',
                borderRadius: 3,
                p: 6,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                '&:hover': { borderColor: '#3b82f6', bgcolor: '#eff6ff' },
              }}
            >
              <Upload size={40} className="mx-auto mb-3" color="#9ca3af" />
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                拖拽截图到此处，或点击上传
              </Typography>
              <Typography variant="body2" color="text.secondary">
                支持 JPG、PNG 格式的 JD 截图
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) readFile(file)
                }}
              />
            </Box>
          ) : loading ? (
            <Stack spacing={3}  sx={{ py: 4 }}>
              <img src={image} alt="截图预览" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, opacity: 0.5 }} />
              <Box sx={{ width: '80%' }}>
                <Typography variant="body2" color="text.secondary"  sx={{ mb: 1 }}>
                  {status}
                </Typography>
                <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 4, height: 6 }} />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {Math.round(progress)}%
                </Typography>
              </Box>
            </Stack>
          ) : preview && !editing ? (
            <Stack spacing={2}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <img src={image} alt="截图" style={{ maxWidth: '100%', borderRadius: 8 }} />
                </Box>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">岗位名称</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {preview.positionName || <Typography component="span" color="text.disabled">未识别</Typography>}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">公司名称</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {preview.companyName || <Typography component="span" color="text.disabled">未识别</Typography>}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">识别文本</Typography>
                    <Typography variant="body2" sx={{ maxHeight: 100, overflow: 'auto', whiteSpace: 'pre-wrap', fontSize: '0.8rem', bgcolor: '#f9fafb', p: 1, borderRadius: 1 }}>
                      {preview.jobDescription.slice(0, 300)}...
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small" onClick={() => {
                  setEditing(true)
                  setEditResult({ ...preview })
                }}>
                  修改结果
                </Button>
                <Button variant="outlined" size="small" color="error" onClick={() => {
                  setImage(null)
                  setPreview(null)
                }}>
                  重新上传
                </Button>
              </Box>
            </Stack>
          ) : editing && editResult ? (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="岗位名称"
                fullWidth
                value={editResult.positionName ?? ''}
                onChange={(e) => setEditResult({ ...editResult, positionName: e.target.value })}
              />
              <TextField
                label="公司名称"
                fullWidth
                value={editResult.companyName ?? ''}
                onChange={(e) => setEditResult({ ...editResult, companyName: e.target.value })}
              />
              <TextField
                label="职位描述"
                fullWidth
                multiline
                rows={6}
                value={editResult.jobDescription}
                onChange={(e) => setEditResult({ ...editResult, jobDescription: e.target.value })}
              />
            </Stack>
          ) : null}
        </DialogContent>

        {image && !loading && (
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleClose} color="inherit">取消</Button>
            <Button variant="contained" onClick={handleConfirm} disabled={!editResult && !preview}>
              确认创建记录
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  )
}
