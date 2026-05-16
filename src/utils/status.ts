import type { MainStatus, SubStatus } from '../types'
import { MAIN_STATUS_SUBSTATUSES, SUB_STATUS_TO_MAIN } from '../types'

// 检查状态转换是否合法（同主状态下子状态可自由切换，跨主状态手动操作）
export function isValidSubStatus(mainStatus: MainStatus, subStatus: SubStatus): boolean {
  return MAIN_STATUS_SUBSTATUSES[mainStatus]?.includes(subStatus) ?? false
}

// 获取某主状态下的可选子状态列表
export function getSubStates(mainStatus: MainStatus): SubStatus[] {
  return MAIN_STATUS_SUBSTATUSES[mainStatus] ?? []
}

// 通过子状态获取所属主状态
export function getMainStatus(subStatus: SubStatus): MainStatus {
  return SUB_STATUS_TO_MAIN[subStatus]
}

// 获取面试轮次显示文本
export function getInterviewRoundLabel(round?: number): string {
  if (round === undefined || round < 1) return ''
  return `第 ${round} 轮面试`
}

// 检查是否需要提示"无回应"
export function shouldPromptNoResponse(sentTime?: string, thresholdDays: number = 30): boolean {
  if (!sentTime) return false
  const sent = new Date(sentTime)
  const now = new Date()
  const diffDays = (now.getTime() - sent.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays > thresholdDays
}
