import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SleepRecord } from '@/types/sleep'
import { calculateSleepData, generateId } from '@/utils/sleepCalculations'

interface SleepStore {
  records: SleepRecord[]
  addRecord: (data: Omit<SleepRecord, 'id' | 'timeInBed' | 'actualSleep' | 'efficiency' | 'createdAt' | 'updatedAt'>) => void
  updateRecord: (id: string, data: Omit<SleepRecord, 'id' | 'timeInBed' | 'actualSleep' | 'efficiency' | 'createdAt' | 'updatedAt'>) => void
  deleteRecord: (id: string) => void
  getRecordByDate: (date: string) => SleepRecord | undefined
}

export const useSleepStore = create<SleepStore>()(
  persist(
    (set, get) => ({
      records: [],
      addRecord: (data) => {
        const { timeInBed, actualSleep, efficiency } = calculateSleepData(data.bedTime, data.sleepTime, data.wakeTime)
        const now = Date.now()
        const record: SleepRecord = {
          id: generateId(),
          ...data,
          timeInBed,
          actualSleep,
          efficiency,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ records: [...state.records, record] }))
      },
      updateRecord: (id, data) => {
        const { timeInBed, actualSleep, efficiency } = calculateSleepData(data.bedTime, data.sleepTime, data.wakeTime)
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id
              ? { ...r, ...data, timeInBed, actualSleep, efficiency, updatedAt: Date.now() }
              : r
          ),
        }))
      },
      deleteRecord: (id) => {
        set((state) => ({ records: state.records.filter((r) => r.id !== id) }))
      },
      getRecordByDate: (date) => {
        return get().records.find((r) => r.date === date)
      },
    }),
    {
      name: 'sleep-records',
    }
  )
)
