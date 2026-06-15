import type { SleepRecord, BedtimeHabitId, WakeHabitId } from '@/types/sleep'
import { BEDTIME_HABITS, WAKE_HABITS } from '@/types/sleep'
import { calculateMinutesDiff } from './sleepCalculations'

export interface BedtimeHabitAnalysis {
  habitId: BedtimeHabitId
  label: string
  icon: string
  impact: 'positive' | 'negative' | 'neutral'
  avgSleepOnsetMinutes: number
  avgSleepOnsetWithout: number
  sampleSize: number
  withoutSampleSize: number
  difference: number
}

export interface WakeHabitAnalysis {
  habitId: WakeHabitId
  label: string
  icon: string
  impact: 'positive' | 'negative' | 'neutral'
  avgQuality: number
  avgQualityWithout: number
  avgEfficiency: number
  avgEfficiencyWithout: number
  sampleSize: number
  withoutSampleSize: number
  qualityDifference: number
  efficiencyDifference: number
}

export interface HabitInsights {
  bedtime: BedtimeHabitAnalysis[]
  wake: WakeHabitAnalysis[]
  topBadBedtimeHabits: BedtimeHabitAnalysis[]
  topGoodBedtimeHabits: BedtimeHabitAnalysis[]
  topBadWakeHabits: WakeHabitAnalysis[]
  topGoodWakeHabits: WakeHabitAnalysis[]
  suggestions: string[]
}

export function analyzeHabits(records: SleepRecord[]): HabitInsights {
  const validRecords = records.filter(
    (r) => r.bedtimeHabits.length > 0 || r.wakeHabits.length > 0
  )

  if (validRecords.length === 0) {
    return {
      bedtime: [],
      wake: [],
      topBadBedtimeHabits: [],
      topGoodBedtimeHabits: [],
      topBadWakeHabits: [],
      topGoodWakeHabits: [],
      suggestions: [],
    }
  }

  const bedtimeAnalysis: BedtimeHabitAnalysis[] = BEDTIME_HABITS.map((habit) => {
    const withHabit = validRecords.filter((r) => r.bedtimeHabits.includes(habit.id))
    const withoutHabit = validRecords.filter((r) => !r.bedtimeHabits.includes(habit.id))

    const avgWith =
      withHabit.length > 0
        ? withHabit.reduce((sum, r) => sum + calculateMinutesDiff(r.bedTime, r.sleepTime), 0) /
          withHabit.length
        : 0

    const avgWithout =
      withoutHabit.length > 0
        ? withoutHabit.reduce((sum, r) => sum + calculateMinutesDiff(r.bedTime, r.sleepTime), 0) /
          withoutHabit.length
        : 0

    return {
      habitId: habit.id,
      label: habit.label,
      icon: habit.icon,
      impact: habit.impact,
      avgSleepOnsetMinutes: Math.round(avgWith),
      avgSleepOnsetWithout: Math.round(avgWithout),
      sampleSize: withHabit.length,
      withoutSampleSize: withoutHabit.length,
      difference: withoutHabit.length > 0 ? Math.round(avgWith - avgWithout) : 0,
    }
  }).filter((a) => a.sampleSize >= 1)

  const wakeAnalysis: WakeHabitAnalysis[] = WAKE_HABITS.map((habit) => {
    const withHabit = validRecords.filter((r) => r.wakeHabits.includes(habit.id))
    const withoutHabit = validRecords.filter((r) => !r.wakeHabits.includes(habit.id))

    const avgQualityWith =
      withHabit.length > 0
        ? withHabit.reduce((sum, r) => sum + r.quality, 0) / withHabit.length
        : 0

    const avgQualityWithout =
      withoutHabit.length > 0
        ? withoutHabit.reduce((sum, r) => sum + r.quality, 0) / withoutHabit.length
        : 0

    const avgEfficiencyWith =
      withHabit.length > 0
        ? withHabit.reduce((sum, r) => sum + r.efficiency, 0) / withHabit.length
        : 0

    const avgEfficiencyWithout =
      withoutHabit.length > 0
        ? withoutHabit.reduce((sum, r) => sum + r.efficiency, 0) / withoutHabit.length
        : 0

    return {
      habitId: habit.id,
      label: habit.label,
      icon: habit.icon,
      impact: habit.impact,
      avgQuality: parseFloat(avgQualityWith.toFixed(1)),
      avgQualityWithout: parseFloat(avgQualityWithout.toFixed(1)),
      avgEfficiency: parseFloat(avgEfficiencyWith.toFixed(1)),
      avgEfficiencyWithout: parseFloat(avgEfficiencyWithout.toFixed(1)),
      sampleSize: withHabit.length,
      withoutSampleSize: withoutHabit.length,
      qualityDifference: withoutHabit.length > 0 ? parseFloat((avgQualityWith - avgQualityWithout).toFixed(1)) : 0,
      efficiencyDifference: withoutHabit.length > 0 ? parseFloat((avgEfficiencyWith - avgEfficiencyWithout).toFixed(1)) : 0,
    }
  }).filter((a) => a.sampleSize >= 1)

  const sortedBedtimeByOnset = [...bedtimeAnalysis]
    .filter((h) => h.withoutSampleSize > 0)
    .sort((a, b) => b.difference - a.difference)
  const topBadBedtimeHabits = sortedBedtimeByOnset.filter((h) => h.difference > 5).slice(0, 3)
  const topGoodBedtimeHabits = [...sortedBedtimeByOnset].reverse().filter((h) => h.difference < -5).slice(0, 3)

  const sortedWakeByQuality = [...wakeAnalysis]
    .filter((h) => h.withoutSampleSize > 0)
    .sort((a, b) => a.qualityDifference - b.qualityDifference)
  const topBadWakeHabits = sortedWakeByQuality.filter((h) => h.qualityDifference < -0.3).slice(0, 3)
  const topGoodWakeHabits = [...sortedWakeByQuality].reverse().filter((h) => h.qualityDifference > 0.3).slice(0, 3)

  const suggestions = generateSuggestions(
    topBadBedtimeHabits,
    topGoodBedtimeHabits,
    topBadWakeHabits,
    topGoodWakeHabits
  )

  return {
    bedtime: bedtimeAnalysis,
    wake: wakeAnalysis,
    topBadBedtimeHabits,
    topGoodBedtimeHabits,
    topBadWakeHabits,
    topGoodWakeHabits,
    suggestions,
  }
}

function generateSuggestions(
  badBedtime: BedtimeHabitAnalysis[],
  goodBedtime: BedtimeHabitAnalysis[],
  badWake: WakeHabitAnalysis[],
  goodWake: WakeHabitAnalysis[]
): string[] {
  const suggestions: string[] = []

  if (badBedtime.length > 0) {
    const worst = badBedtime[0]
    suggestions.push(
      `睡前「${worst.label}」会让你多花约 ${worst.difference} 分钟才能入睡，建议在睡前1小时避免${worst.label}。`
    )
  }

  if (goodBedtime.length > 0) {
    const best = goodBedtime[0]
    suggestions.push(
      `睡前「${best.label}」能帮你更快入睡（少花约 ${Math.abs(best.difference)} 分钟），可以保持这个好习惯。`
    )
  }

  if (badWake.length > 0) {
    const worst = badWake[0]
    suggestions.push(
      `醒后「${worst.label}」会降低睡眠质量（下降 ${Math.abs(worst.qualityDifference)} 星），建议调整起床后的习惯。`
    )
  }

  if (goodWake.length > 0) {
    const best = goodWake[0]
    suggestions.push(
      `醒后「${best.label}」能提升睡眠质量（提升 ${best.qualityDifference} 星），继续保持！`
    )
  }

  if (suggestions.length === 0) {
    suggestions.push('记录更多睡眠和习惯数据，系统将为你生成个性化的改善建议。')
  }

  return suggestions
}
