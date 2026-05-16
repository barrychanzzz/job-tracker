import { create } from 'zustand'
import { db } from '../db/database'
import type { JobApplication, CreateApplicationInput, UpdateApplicationInput } from '../types'

interface ApplicationState {
  applications: JobApplication[]
  loading: boolean

  // Actions
  loadApplications: () => Promise<void>
  createApplication: (input: CreateApplicationInput) => Promise<number>
  updateApplication: (input: UpdateApplicationInput) => Promise<void>
  deleteApplication: (id: number) => Promise<void>
  getApplicationById: (id: number) => Promise<JobApplication | undefined>
  updateStatus: (id: number, mainStatus: string, subStatus: string, interviewRound?: number) => Promise<void>
  addActivityLog: (applicationId: number, action: string) => Promise<void>
}

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  applications: [],
  loading: false,

  loadApplications: async () => {
    set({ loading: true })
    const apps = await db.applications.orderBy('updatedAt').reverse().toArray()
    set({ applications: apps, loading: false })
  },

  createApplication: async (input) => {
    const now = new Date().toISOString()
    const id = await db.applications.add({
      positionName: input.positionName,
      companyName: input.companyName,
      jobDescription: input.jobDescription,
      applyLinks: input.applyLinks,
      recruiterEmails: input.recruiterEmails,
      resumeVersion: input.resumeVersion,
      sentTime: input.sentTime,
      interviewTimes: input.interviewTimes,
      replyTimes: input.replyTimes,
      mainStatus: input.mainStatus ?? 'active',
      subStatus: input.subStatus ?? 'sent',
      interviewRound: input.interviewRound,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    })

    // log creation
    await db.activityLogs.add({
      applicationId: id as number,
      action: '创建求职记录',
      timestamp: now,
    })

    await get().loadApplications()
    return id as number
  },

  updateApplication: async (input) => {
    const now = new Date().toISOString()
    await db.applications.update(input.id, {
      ...input,
      updatedAt: now,
    })
    await get().loadApplications()
  },

  deleteApplication: async (id) => {
    await db.applications.delete(id)
    await db.attachments.where('applicationId').equals(id).delete()
    await db.activityLogs.where('applicationId').equals(id).delete()
    await get().loadApplications()
  },

  getApplicationById: async (id) => {
    return db.applications.get(id)
  },

  updateStatus: async (id, mainStatus, subStatus, interviewRound) => {
    const app = await db.applications.get(id)
    if (!app) return

    const now = new Date().toISOString()
    const updates: Partial<JobApplication> = {
      mainStatus: mainStatus as JobApplication['mainStatus'],
      subStatus: subStatus as JobApplication['subStatus'],
      updatedAt: now,
    }
    if (interviewRound !== undefined) {
      updates.interviewRound = interviewRound
    }

    await db.applications.update(id, updates)

    // log status change
    const oldStatus = `${app.mainStatus}/${app.subStatus}`
    const newStatus = `${mainStatus}/${subStatus}`
    await db.activityLogs.add({
      applicationId: id,
      action: `状态变更: ${oldStatus} → ${newStatus}`,
      timestamp: now,
    })

    await get().loadApplications()
  },

  addActivityLog: async (applicationId, action) => {
    await db.activityLogs.add({
      applicationId,
      action,
      timestamp: new Date().toISOString(),
    })
  },
}))
