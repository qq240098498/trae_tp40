export const LIGHT_OPTIONS = [
  { id: 'pitch_black', label: '全黑', icon: '🌑' },
  { id: 'night_light', label: '小夜灯', icon: '🏮' },
  { id: 'bright', label: '明亮', icon: '💡' },
] as const

export const NOISE_LEVELS = [
  { id: 'quiet', label: '安静', icon: '🤫' },
  { id: 'low', label: '轻微噪音', icon: '🍃' },
  { id: 'moderate', label: '中等噪音', icon: '🔊' },
  { id: 'loud', label: '很吵', icon: '📢' },
] as const

export type LightLevel = typeof LIGHT_OPTIONS[number]['id']
export type NoiseLevel = typeof NOISE_LEVELS[number]['id']

export interface SleepEnvironment {
  roomTemp?: number
  noiseLevel?: NoiseLevel
  lightLevel?: LightLevel
  earPlugs?: boolean
  eyeMask?: boolean
}

export const BEDTIME_HABITS = [
  { id: 'phone', label: '玩手机', icon: '📱', impact: 'negative' },
  { id: 'reading', label: '看书', icon: '📚', impact: 'positive' },
  { id: 'tea', label: '喝茶/咖啡', icon: '🍵', impact: 'negative' },
  { id: 'exercise', label: '运动', icon: '🏃', impact: 'neutral' },
  { id: 'meditation', label: '冥想/放松', icon: '🧘', impact: 'positive' },
  { id: 'music', label: '听音乐', icon: '🎵', impact: 'positive' },
  { id: 'snack', label: '吃夜宵', icon: '🍔', impact: 'negative' },
  { id: 'shower', label: '洗澡/泡脚', icon: '🛁', impact: 'positive' },
] as const

export const WAKE_HABITS = [
  { id: 'getup_immediately', label: '立刻起床', icon: '☀️', impact: 'positive' },
  { id: 'snooze_30', label: '赖床30分钟', icon: '😴', impact: 'negative' },
  { id: 'snooze_10', label: '赖床10分钟', icon: '💤', impact: 'neutral' },
  { id: 'phone_first', label: '先看手机', icon: '📱', impact: 'negative' },
  { id: 'stretch', label: '拉伸/运动', icon: '🤸', impact: 'positive' },
  { id: 'water', label: '喝一杯水', icon: '💧', impact: 'positive' },
  { id: 'breakfast', label: '吃早餐', icon: '🍳', impact: 'positive' },
  { id: 'coffee', label: '喝咖啡', icon: '☕', impact: 'neutral' },
] as const

export type BedtimeHabitId = typeof BEDTIME_HABITS[number]['id']
export type WakeHabitId = typeof WAKE_HABITS[number]['id']

export interface SleepRecord {
  id: string
  date: string
  bedTime: string
  sleepTime: string
  wakeTime: string
  wakeCount?: number
  quality: number
  bedtimeHabits: BedtimeHabitId[]
  wakeHabits: WakeHabitId[]
  environment?: SleepEnvironment
  timeInBed: number
  actualSleep: number
  efficiency: number
  createdAt: number
  updatedAt: number
}

export type SleepRecordInput = Omit<SleepRecord, 'id' | 'timeInBed' | 'actualSleep' | 'efficiency' | 'createdAt' | 'updatedAt'>
