import { useState, useRef, useEffect } from 'react'
import { Box, Typography, Chip, IconButton, Button, Stack } from '@mui/material'
import { Paperclip, X, Trash2 } from 'lucide-react'
import { db } from '../../db/database'
import type { Attachment } from '../../types'
import { formatDate } from '../../utils/date'
import ConfirmDialog from '../shared/ConfirmDialog'

interface AttachmentManagerProps {
  applicationId: number
  readOnly?: boolean
}

export default function AttachmentManager({ applicationId, readOnly }: AttachmentManagerProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Attachment | null>(null)
  const [preview, setPreview] = useState<Attachment | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadAttachments()
  }, [applicationId])

  const loadAttachments = async () => {
    const list = await db.attachments.where('applicationId').equals(applicationId).toArray()
    setAttachments(list)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      const reader = new FileReader()
      reader.onload = async () => {
        await db.attachments.add({
          applicationId,
          fileName: file.name,
          fileType: file.type,
          dataUrl: reader.result as string,
          createdAt: new Date().toISOString(),
        })
        loadAttachments()
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  const handleDelete = async () => {
    if (!deleteTarget?.id) return
    await db.attachments.delete(deleteTarget.id)
    setDeleteTarget(null)
    loadAttachments()
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Paperclip size={16} color="#6b7280" />
        <Typography variant="subtitle2" color="text.secondary">
          附件 ({attachments.length})
        </Typography>
        {!readOnly && (
          <>
            <Button size="small" variant="text" onClick={() => fileInputRef.current?.click()} sx={{ ml: 'auto', minWidth: 'auto' }}>
              上传
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*,.pdf" multiple hidden onChange={handleUpload} />
          </>
        )}
      </Box>

      {attachments.length === 0 ? (
        <Typography variant="body2" color="text.disabled" sx={{ py: 1 }}>
          暂无附件
        </Typography>
      ) : (
        <Stack spacing={0.5}>
          {attachments.map((att) => (
            <Chip
              key={att.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{att.fileName}</span>
                  <Typography variant="caption" color="text.disabled">
                    {formatDate(att.createdAt)}
                  </Typography>
                </Box>
              }
              variant="outlined"
              size="small"
              onClick={() => setPreview(att)}
              onDelete={readOnly ? undefined : () => setDeleteTarget(att)}
              deleteIcon={readOnly ? undefined : <Trash2 size={14} />}
              sx={{ '& .MuiChip-label': { py: 0.5 } }}
            />
          ))}
        </Stack>
      )}

      {/* Preview Dialog */}
      {preview && (
        <Box
          onClick={() => setPreview(null)}
          sx={{
            position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.7)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Box sx={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <IconButton
              onClick={() => setPreview(null)}
              sx={{ position: 'absolute', top: -40, right: -40, color: 'white' }}
            >
              <X size={24} />
            </IconButton>
            {preview.fileType.startsWith('image/') ? (
              <img src={preview.dataUrl} alt={preview.fileName} style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 8 }} />
            ) : (
              <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 2 }}>
                <Typography>{preview.fileName}</Typography>
                <Button variant="outlined" href={preview.dataUrl} download={preview.fileName} sx={{ mt: 2 }}>
                  下载查看
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="删除附件"
        message={`确定要删除「${deleteTarget?.fileName}」吗？`}
        confirmLabel="删除"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
