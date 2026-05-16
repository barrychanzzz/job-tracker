// 主状态
export type MainStatus = 'active' | 'paused' | 'ended'

// 子状态
export type SubStatus =
  | 'sent'              // 已发送求职邮件
  | 'waiting_interview' // 等待第 N 轮面试
  | 'interview_done'    // 面试已完成
  | 'pending'           // 待定
  | 'offer'             // 收到 Offer
  | 'onboarded'         // 已入职
  | 'rejected'          // 已拒
  | 'no_response'       // 无回应
  | 'abandoned'         // 放弃

// 主状态显示名
export const MAIN_STATUS_LABELS: Record<MainStatus, string> = {
  active: '进行中',
  paused: '暂停',
  ended: '已结束',
}

// 子状态显示名
export const SUB_STATUS_LABELS: Record<SubStatus, string> = {
  sent: '已发送求职邮件',
  waiting_interview: '等待面试',
  interview_done: '面试已完成',
  pending: '待定',
  offer: '收到 Offer',
  onboarded: '已入职',
  rejected: '已拒',
  no_response: '无回应',
  abandoned: '放弃',
}

// 子状态所属主状态映射
export const SUB_STATUS_TO_MAIN: Record<SubStatus, MainStatus> = {
  sent: 'active',
  waiting_interview: 'active',
  interview_done: 'active',
  pending: 'paused',
  offer: 'ended',
  onboarded: 'ended',
  rejected: 'ended',
  no_response: 'ended',
  abandoned: 'ended',
}

// 每个主状态可用的子状态列表
export const MAIN_STATUS_SUBSTATUSES: Record<MainStatus, SubStatus[]> = {
  active: ['sent', 'waiting_interview', 'interview_done'],
  paused: ['pending'],
  ended: ['offer', 'onboarded', 'rejected', 'no_response', 'abandoned'],
}

// 子状态徽章颜色
export const SUB_STATUS_COLORS: Record<SubStatus, string> = {
  sent: '#3b82f6',              // blue
  waiting_interview: '#f59e0b',  // amber
  interview_done: '#8b5cf6',     // violet
  pending: '#6b7280',            // gray
  offer: '#10b981',              // emerald
  onboarded: '#059669',          // green
  rejected: '#ef4444',           // red
  no_response: '#9ca3af',        // gray-400
  abandoned: '#6b7280',          // gray
}

// 求职记录
export interface JobApplication {
  id?: number
  positionName: string
  companyName: string
  jobDescription?: string
  applyLinks?: string[]        // 投递链接
  recruiterEmails?: string[]   // 招聘者邮箱
  resumeVersion?: string       // 简历版本
  sentTime?: string            // 求职邮件发送时间 ISO 8601
  interviewTimes?: string[]    // 面试时间列表
  replyTimes?: string[]        // 对方回复时间列表
  mainStatus: MainStatus
  subStatus: SubStatus
  interviewRound?: number      // 面试轮次 (waiting_interview时有效)
  notes?: string               // 备注
  createdAt: string            // ISO 8601
  updatedAt: string            // ISO 8601
}

// 新建记录的输入类型（必填字段）
export type CreateApplicationInput = Pick<JobApplication, 'positionName' | 'companyName'> & Partial<Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>>

// 更新记录的输入类型
export type UpdateApplicationInput = Partial<Omit<JobApplication, 'id' | 'createdAt'>> & { id: number }

// 附件
export interface Attachment {
  id?: number
  applicationId: number
  fileName: string
  fileType: string
  dataUrl: string              // Base64 data URL
  createdAt: string
}

// 活动日志
export interface ActivityLog {
  id?: number
  applicationId: number
  action: string               // 如 "状态从已发送变为等待面试"
  timestamp: string
}
