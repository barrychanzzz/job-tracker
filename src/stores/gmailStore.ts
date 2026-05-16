import { create } from 'zustand'

interface GmailState {
  accessToken: string | null
  connected: boolean
  scanning: boolean
  scanResults: GmailMatch[]
  lastScanTime: string | null
  error: string | null
  
  setAccessToken: (token: string) => void
  disconnect: () => void
  setScanning: (val: boolean) => void
  setScanResults: (results: GmailMatch[]) => void
  setError: (err: string | null) => void
  clearScanResults: () => void
}

export interface GmailMatch {
  id: string
  threadId: string
  subject: string
  from: string
  to: string
  date: string
  snippet: string
  matchType: 'sent' | 'received'
  matchedApplicationId?: number
  matchedApplicationName?: string
}

export const useGmailStore = create<GmailState>((set) => ({
  accessToken: null,
  connected: false,
  scanning: false,
  scanResults: [],
  lastScanTime: null,
  error: null,

  setAccessToken: (token) => set({ accessToken: token, connected: true, error: null }),
  disconnect: () => set({ accessToken: null, connected: false, scanResults: [] }),
  setScanning: (val) => set({ scanning: val }),
  setScanResults: (results) => set({ 
    scanResults: results, 
    scanning: false, 
    lastScanTime: new Date().toISOString(),
    error: null,
  }),
  setError: (err) => set({ error: err, scanning: false }),
  clearScanResults: () => set({ scanResults: [] }),
}))
