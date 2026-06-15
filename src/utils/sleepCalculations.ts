export function calculateMinutesDiff(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  let startMinutes = sh * 60 + sm
  let endMinutes = eh * 60 + em
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60
  }
  return endMinutes - startMinutes
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}分钟`
  if (m === 0) return `${h}小时`
  return `${h}小时${m}分钟`
}

export function calculateSleepData(bedTime: string, sleepTime: string, wakeTime: string) {
  const timeInBed = calculateMinutesDiff(bedTime, wakeTime)
  const actualSleep = calculateMinutesDiff(sleepTime, wakeTime)
  const efficiency = timeInBed > 0 ? Math.round((actualSleep / timeInBed) * 10000) / 100 : 0
  return { timeInBed, actualSleep, efficiency }
}

export function formatTimeForChart(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  return h + m / 60
}

export function formatHoursForChart(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}:${m.toString().padStart(2, '0')}`
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  return `${month}月${day}日`
}

export function getWeekDays(): string[] {
  const days: string[] = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export function getMonthDays(): string[] {
  const days: string[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}
