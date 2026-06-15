export interface SleepRecord {
  id: string
  date: string
  bedTime: string
  sleepTime: string
  wakeTime: string
  wakeCount?: number
  quality: number
  timeInBed: number
  actualSleep: number
  efficiency: number
  createdAt: number
  updatedAt: number
}

export type SleepRecordInput = Omit<SleepRecord, 'id' | 'timeInBed' | 'actualSleep' | 'efficiency' | 'createdAt' | 'updatedAt'>
