import { db } from '../db/database'

export async function exportJSON(): Promise<void> {
  const apps = await db.applications.toArray()
  const json = JSON.stringify(apps, null, 2)
  downloadFile(json, 'job-tracker-export.json', 'application/json')
}

export async function exportCSV(): Promise<void> {
  const apps = await db.applications.toArray()

  const headers = ['岗位名称', '公司名称', '主状态', '子状态', '面试轮次', '投递时间', '简历版本', '备注', '创建时间', '更新时间']
  const rows = apps.map((a) => [
    a.positionName,
    a.companyName,
    a.mainStatus,
    a.subStatus,
    a.interviewRound ?? '',
    a.sentTime ?? '',
    a.resumeVersion ?? '',
    a.notes ?? '',
    a.createdAt,
    a.updatedAt,
  ])

  const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n')

  // Add BOM for Excel Chinese support
  const bom = '\uFEFF'
  downloadFile(bom + csv, 'job-tracker-export.csv', 'text/csv')
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
