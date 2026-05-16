import { create } from 'zustand'
import type { MainStatus } from '../types'

export type SortField = 'createdAt' | 'updatedAt' | 'sentTime'
export type SortOrder = 'asc' | 'desc'

interface UIState {
  activeTab: MainStatus
  searchQuery: string
  sortField: SortField
  sortOrder: SortOrder
  filterCompany: string

  // Actions
  setActiveTab: (tab: MainStatus) => void
  setSearchQuery: (query: string) => void
  setSortField: (field: SortField) => void
  setSortOrder: (order: SortOrder) => void
  toggleSortOrder: () => void
  setFilterCompany: (company: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'active',
  searchQuery: '',
  sortField: 'updatedAt',
  sortOrder: 'desc',
  filterCompany: '',

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortField: (field) => set({ sortField: field }),
  setSortOrder: (order) => set({ sortOrder: order }),
  toggleSortOrder: () => set((s) => ({ sortOrder: s.sortOrder === 'asc' ? 'desc' : 'asc' })),
  setFilterCompany: (company) => set({ filterCompany: company }),
}))
