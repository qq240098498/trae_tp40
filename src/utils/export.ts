import type { SleepRecord } from '@/types/sleep'
import { formatDate, formatDuration } from './sleepCalculations'

export function exportToCSV(records: SleepRecord[]): void {
  const BOM = '\uFEFF'
  const header = '日期,上床时间,入睡时间,起床时间,醒来次数,睡眠质量(1-5),卧床时长,实际睡眠时长,睡眠效率(%)'
  const rows = records.map(r =>
    [
      r.date,
      r.bedTime,
      r.sleepTime,
      r.wakeTime,
      r.wakeCount ?? '',
      r.quality,
      formatDuration(r.timeInBed),
      formatDuration(r.actualSleep),
      r.efficiency
    ].join(',')
  )
  const csv = BOM + header + '\n' + rows.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `睡眠记录_${formatDate(new Date().toISOString().split('T')[0])}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
