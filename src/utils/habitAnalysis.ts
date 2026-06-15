import type { SleepRecord, BedtimeHabitId, WakeHabitId, SleepEnvironment } from '@/types/sleep'
import { BEDTIME_HABITS, WAKE_HABITS, LIGHT_OPTIONS, NOISE_LEVELS } from '@/types/sleep'
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

export interface EnvironmentFactorResult {
  factor: string
  label: string
  icon: string
  bestValue: string
  bestLabel: string
  bestAvgQuality: number
  bestSampleSize: number
  worstValue: string
  worstLabel: string
  worstAvgQuality: number
  worstSampleSize: number
  qualityDifference: number
}

export interface EnvironmentInsights {
  factors: EnvironmentFactorResult[]
  bestConfig: {
    description: string
    avgQuality: number
    sampleSize: number
  } | null
  suggestions: string[]
}

export interface HabitInsights {
  bedtime: BedtimeHabitAnalysis[]
  wake: WakeHabitAnalysis[]
  topBadBedtimeHabits: BedtimeHabitAnalysis[]
  topGoodBedtimeHabits: BedtimeHabitAnalysis[]
  topBadWakeHabits: WakeHabitAnalysis[]
  topGoodWakeHabits: WakeHabitAnalysis[]
  suggestions: string[]
  environment: EnvironmentInsights
}

export function analyzeHabits(records: SleepRecord[]): HabitInsights {
  const validRecords = records.filter(
    (r) => r.bedtimeHabits.length > 0 || r.wakeHabits.length > 0
  )

  if (validRecords.length === 0 && records.filter((r) => r.environment).length === 0) {
    return {
      bedtime: [],
      wake: [],
      topBadBedtimeHabits: [],
      topGoodBedtimeHabits: [],
      topBadWakeHabits: [],
      topGoodWakeHabits: [],
      suggestions: [],
      environment: { factors: [], bestConfig: null, suggestions: [] },
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

  const envInsights = analyzeEnvironment(records)

  const suggestions = generateSuggestions(
    topBadBedtimeHabits,
    topGoodBedtimeHabits,
    topBadWakeHabits,
    topGoodWakeHabits,
    envInsights
  )

  return {
    bedtime: bedtimeAnalysis,
    wake: wakeAnalysis,
    topBadBedtimeHabits,
    topGoodBedtimeHabits,
    topBadWakeHabits,
    topGoodWakeHabits,
    suggestions,
    environment: envInsights,
  }
}

function generateSuggestions(
  badBedtime: BedtimeHabitAnalysis[],
  goodBedtime: BedtimeHabitAnalysis[],
  badWake: WakeHabitAnalysis[],
  goodWake: WakeHabitAnalysis[],
  envInsights: EnvironmentInsights
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

  if (envInsights.suggestions.length > 0) {
    suggestions.push(...envInsights.suggestions)
  }

  if (suggestions.length === 0) {
    suggestions.push('记录更多睡眠和习惯数据，系统将为你生成个性化的改善建议。')
  }

  return suggestions
}

function analyzeEnvironment(records: SleepRecord[]): EnvironmentInsights {
  const envRecords = records.filter((r) => r.environment)
  const suggestions: string[] = []

  if (envRecords.length < 2) {
    return { factors: [], bestConfig: null, suggestions: [] }
  }

  const factors: EnvironmentFactorResult[] = []

  const lightGroups = new Map<string, { records: SleepRecord[]; label: string; icon: string }>()
  for (const opt of LIGHT_OPTIONS) {
    const group = envRecords.filter((r) => r.environment?.lightLevel === opt.id)
    if (group.length > 0) {
      lightGroups.set(opt.id, { records: group, label: opt.label, icon: opt.icon })
    }
  }
  const lightFactor = buildFactorResult('lightLevel', '光线条件', '🌓', lightGroups)
  if (lightFactor) factors.push(lightFactor)

  const noiseGroups = new Map<string, { records: SleepRecord[]; label: string; icon: string }>()
  for (const opt of NOISE_LEVELS) {
    const group = envRecords.filter((r) => r.environment?.noiseLevel === opt.id)
    if (group.length > 0) {
      noiseGroups.set(opt.id, { records: group, label: opt.label, icon: opt.icon })
    }
  }
  const noiseFactor = buildFactorResult('noiseLevel', '噪音水平', '🔊', noiseGroups)
  if (noiseFactor) factors.push(noiseFactor)

  const earPlugsYes = envRecords.filter((r) => r.environment?.earPlugs === true)
  const earPlugsNo = envRecords.filter((r) => r.environment?.earPlugs === false || r.environment?.earPlugs === undefined)
  const earPlugsGroups = new Map<string, { records: SleepRecord[]; label: string; icon: string }>()
  if (earPlugsYes.length > 0) earPlugsGroups.set('yes', { records: earPlugsYes, label: '使用耳塞', icon: '🧏' })
  if (earPlugsNo.length > 0) earPlugsGroups.set('no', { records: earPlugsNo, label: '不使用', icon: '👂' })
  const earPlugsFactor = buildFactorResult('earPlugs', '耳塞使用', '🧏', earPlugsGroups)
  if (earPlugsFactor) factors.push(earPlugsFactor)

  const eyeMaskYes = envRecords.filter((r) => r.environment?.eyeMask === true)
  const eyeMaskNo = envRecords.filter((r) => r.environment?.eyeMask === false || r.environment?.eyeMask === undefined)
  const eyeMaskGroups = new Map<string, { records: SleepRecord[]; label: string; icon: string }>()
  if (eyeMaskYes.length > 0) eyeMaskGroups.set('yes', { records: eyeMaskYes, label: '使用眼罩', icon: '🎭' })
  if (eyeMaskNo.length > 0) eyeMaskGroups.set('no', { records: eyeMaskNo, label: '不使用', icon: '👁️' })
  const eyeMaskFactor = buildFactorResult('eyeMask', '眼罩使用', '🎭', eyeMaskGroups)
  if (eyeMaskFactor) factors.push(eyeMaskFactor)

  const tempRecords = envRecords.filter((r) => r.environment?.roomTemp !== undefined)
  if (tempRecords.length >= 2) {
    const sorted = [...tempRecords].sort((a, b) => (a.environment!.roomTemp!) - (b.environment!.roomTemp!))
    const lowTemp = sorted.filter((r) => (r.environment!.roomTemp!) < 20)
    const midTemp = sorted.filter((r) => (r.environment!.roomTemp!) >= 20 && (r.environment!.roomTemp!) <= 24)
    const highTemp = sorted.filter((r) => (r.environment!.roomTemp!) > 24)
    const tempGroups = new Map<string, { records: SleepRecord[]; label: string; icon: string }>()
    if (lowTemp.length > 0) tempGroups.set('low', { records: lowTemp, label: '<20°C 偏冷', icon: '❄️' })
    if (midTemp.length > 0) tempGroups.set('mid', { records: midTemp, label: '20-24°C 适中', icon: '🌡️' })
    if (highTemp.length > 0) tempGroups.set('high', { records: highTemp, label: '>24°C 偏热', icon: '🔥' })
    const tempFactor = buildFactorResult('roomTemp', '室温', '🌡️', tempGroups)
    if (tempFactor) factors.push(tempFactor)
  }

  let bestConfig: EnvironmentInsights['bestConfig'] = null
  if (envRecords.length >= 3) {
    const configMap = new Map<string, { records: SleepRecord[]; parts: string[] }>()
    for (const r of envRecords) {
      const parts: string[] = []
      if (r.environment?.lightLevel) {
        const opt = LIGHT_OPTIONS.find((o) => o.id === r.environment?.lightLevel)
        if (opt) parts.push(`光线:${opt.label}`)
      }
      if (r.environment?.noiseLevel) {
        const opt = NOISE_LEVELS.find((o) => o.id === r.environment?.noiseLevel)
        if (opt) parts.push(`噪音:${opt.label}`)
      }
      if (r.environment?.earPlugs) parts.push('耳塞')
      if (r.environment?.eyeMask) parts.push('眼罩')
      if (r.environment?.roomTemp !== undefined) {
        const t = r.environment.roomTemp
        if (t < 20) parts.push('偏冷室温')
        else if (t <= 24) parts.push('适中室温')
        else parts.push('偏热室温')
      }
      if (parts.length === 0) continue
      const key = parts.join('+')
      const existing = configMap.get(key)
      if (existing) {
        existing.records.push(r)
      } else {
        configMap.set(key, { records: [r], parts })
      }
    }

    let bestKey = ''
    let bestAvg = 0
    let bestSize = 0
    let bestParts: string[] = []
    for (const [key, val] of configMap) {
      if (val.records.length < 2) continue
      const avg = val.records.reduce((s, r) => s + r.quality, 0) / val.records.length
      if (avg > bestAvg) {
        bestAvg = avg
        bestKey = key
        bestSize = val.records.length
        bestParts = val.parts
      }
    }
    if (bestKey) {
      bestConfig = {
        description: bestParts.join('、'),
        avgQuality: parseFloat(bestAvg.toFixed(1)),
        sampleSize: bestSize,
      }
    }
  }

  for (const factor of factors) {
    if (factor.qualityDifference >= 0.5) {
      suggestions.push(
        `${factor.label}方面，「${factor.bestLabel}」时睡眠质量最高（${factor.bestAvgQuality} 星），比「${factor.worstLabel}」高出 ${factor.qualityDifference.toFixed(1)} 星，建议优化此项。`
      )
    }
  }

  if (bestConfig) {
    suggestions.push(
      `最佳环境组合：${bestConfig.description}，此配置下平均睡眠质量 ${bestConfig.avgQuality} 星（${bestConfig.sampleSize} 天样本）。`
    )
  }

  return { factors, bestConfig, suggestions }
}

function buildFactorResult(
  factor: string,
  label: string,
  icon: string,
  groups: Map<string, { records: SleepRecord[]; label: string; icon: string }>
): EnvironmentFactorResult | null {
  const entries = Array.from(groups.entries())
  if (entries.length < 2) return null

  let best: { key: string; avg: number; size: number; groupLabel: string; groupIcon: string } | null = null
  let worst: { key: string; avg: number; size: number; groupLabel: string; groupIcon: string } | null = null

  for (const [key, val] of entries) {
    const avg = val.records.reduce((s, r) => s + r.quality, 0) / val.records.length
    if (!best || avg > best.avg) {
      best = { key, avg, size: val.records.length, groupLabel: val.label, groupIcon: val.icon }
    }
    if (!worst || avg < worst.avg) {
      worst = { key, avg, size: val.records.length, groupLabel: val.label, groupIcon: val.icon }
    }
  }

  if (!best || !worst || best.key === worst.key) return null

  return {
    factor,
    label,
    icon,
    bestValue: best.key,
    bestLabel: best.groupLabel,
    bestAvgQuality: parseFloat(best.avg.toFixed(1)),
    bestSampleSize: best.size,
    worstValue: worst.key,
    worstLabel: worst.groupLabel,
    worstAvgQuality: parseFloat(worst.avg.toFixed(1)),
    worstSampleSize: worst.size,
    qualityDifference: parseFloat((best.avg - worst.avg).toFixed(1)),
  }
}
