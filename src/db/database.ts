import Dexie, { type EntityTable } from 'dexie'
import type { JobApplication, Attachment, ActivityLog } from '../types'

class JobTrackerDB extends Dexie {
  applications!: EntityTable<JobApplication, 'id'>
  attachments!: EntityTable<Attachment, 'id'>
  activityLogs!: EntityTable<ActivityLog, 'id'>

  constructor() {
    super('JobTrackerDB')

    this.version(1).stores({
      // id auto-incremented by Dexie
      applications: '++id, mainStatus, subStatus, companyName, positionName, createdAt, updatedAt',
      attachments: '++id, applicationId, createdAt',
      activityLogs: '++id, applicationId, timestamp',
    })
  }
}

export const db = new JobTrackerDB()
