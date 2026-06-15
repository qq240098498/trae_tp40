import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from 'recharts'
import { useSleepStore } from '@/store/sleepStore'
import { formatTimeForChart, formatDate, getWeekDays, getMonthDays } from '@/utils/sleepCalculations'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

type Range = 'week' | 'month'

export default function Trends() {
  const [range, setRange] = useState<Range>('week')
  const records = useSleepStore((s) => s.records)

  const days = range === 'week' ? getWeekDays() : getMonthDays()

  const chartData = useMemo(() => {
    const recordMap = new Map(records.map((r) => [r.date, r]))
    return days.map((day) => {
      const r = recordMap.get(day)
      return {
        date: formatDate(day),
        fullDate: day,
        sleepHours: r ? parseFloat((r.actualSleep / 60).toFixed(1)) : null,
        bedHours: r ? parseFloat((r.timeInBed / 60).toFixed(1)) : null,
        sleepTime: r ? formatTimeForChart(r.sleepTime) : null,
        efficiency: r ? r.efficiency : null,
        quality: r ? r.quality : null,
      }
    })
  }, [records, days])

  const stats = useMemo(() => {
    const withData = chartData.filter((d) => d.sleepHours !== null)
    if (withData.length === 0) return null

    const avgSleep = withData.reduce((s, d) => s + (d.sleepHours ?? 0), 0) / withData.length
    const avgSleepTime = withData.reduce((s, d) => s + (d.sleepTime ?? 0), 0) / withData.length
    const avgEfficiency = withData.reduce((s, d) => s + (d.efficiency ?? 0), 0) / withData.length
    const avgQuality = withData.reduce((s, d) => s + (d.quality ?? 0), 0) / withData.length

    const sleepTrend = withData.length >= 2
      ? (withData[withData.length - 1].sleepHours ?? 0) - (withData[0].sleepHours ?? 0)
      : 0

    return {
      avgSleep: avgSleep.toFixed(1),
      avgSleepTime: avgSleepTime,
      avgEfficiency: avgEfficiency.toFixed(0),
      avgQuality: avgQuality.toFixed(1),
      count: withData.length,
      sleepTrend,
    }
  }, [chartData])

  const sleepTimeFormatted = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}:${m.toString().padStart(2, '0')}`
  }

  const hasData = chartData.some((d) => d.sleepHours !== null)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-serif bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">
            睡眠趋势
          </h2>
          <p className="text-sm text-slate-500 mt-1">追踪你的睡眠变化</p>
        </div>
        <div className="flex bg-slate-800/60 rounded-xl p-1">
          {(['week', 'month'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-xs font-medium transition-all',
                range === r
                  ? 'bg-violet-600/30 text-violet-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              {r === 'week' ? '周' : '月'}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-600">
          <TrendingUp size={48} className="mb-4 text-slate-700" />
          <p className="text-lg font-medium">暂无足够数据</p>
          <p className="text-sm mt-1">记录更多睡眠数据后即可查看趋势</p>
        </div>
      ) : (
        <>
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBlock
                label="平均睡眠"
                value={`${stats.avgSleep}h`}
                trend={stats.sleepTrend}
              />
              <StatBlock
                label="平均入睡"
                value={sleepTimeFormatted(stats.avgSleepTime)}
              />
              <StatBlock
                label="平均效率"
                value={`${stats.avgEfficiency}%`}
              />
              <StatBlock
                label="平均质量"
                value={`${stats.avgQuality} ⭐`}
              />
            </div>
          )}

          <div className="bg-slate-900/60 backdrop-blur-sm border border-indigo-900/30 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">睡眠时长趋势</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="bedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#1e1b4b' }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 12]}
                    tickFormatter={(v) => `${v}h`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #312e81',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#e2e8f0',
                    }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                    formatter={(value: number | null, name: string) => {
                      if (value === null) return ['—', name]
                      return [`${value}h`, name === 'sleepHours' ? '实际睡眠' : '卧床时长']
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="bedHours"
                    stroke="#6366f1"
                    strokeWidth={1.5}
                    fill="url(#bedGradient)"
                    connectNulls={false}
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="sleepHours"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#sleepGradient)"
                    connectNulls={false}
                    dot={{ r: 3, fill: '#8b5cf6', stroke: '#0f172a', strokeWidth: 2 }}
                    activeDot={{ r: 5, fill: '#a78bfa', stroke: '#0f172a', strokeWidth: 2 }}
                  />
                  <ReferenceLine y={8} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-6 mt-3 text-[10px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-violet-500 rounded" /> 实际睡眠
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-indigo-500 rounded" /> 卧床时长
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-green-500/30 rounded border-t border-dashed border-green-500/50" /> 8h推荐
              </span>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-indigo-900/30 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">入睡时间趋势</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#1e1b4b' }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    domain={[20, 28]}
                    ticks={[21, 22, 23, 24, 25, 26]}
                    tickFormatter={(v) => {
                      const h = v >= 24 ? v - 24 : v
                      return `${h}:00`
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #312e81',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#e2e8f0',
                    }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                    formatter={(value: number | null) => {
                      if (value === null) return '—'
                      return sleepTimeFormatted(value)
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sleepTime"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    connectNulls={false}
                    dot={{ r: 3, fill: '#f59e0b', stroke: '#0f172a', strokeWidth: 2 }}
                    activeDot={{ r: 5, fill: '#fbbf24', stroke: '#0f172a', strokeWidth: 2 }}
                  />
                  <ReferenceLine y={23} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-6 mt-3 text-[10px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-amber-500 rounded" /> 入睡时间
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-green-500/30 rounded border-t border-dashed border-green-500/50" /> 23:00推荐
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatBlock({
  label,
  value,
  trend,
}: {
  label: string
  value: string
  trend?: number
}) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-sm border border-indigo-900/30 rounded-xl p-3">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-end gap-2 mt-1">
        <span className="text-xl font-bold text-slate-100">{value}</span>
        {trend !== undefined && trend !== 0 && (
          <span className={cn(
            'flex items-center text-[10px] font-medium mb-1',
            trend > 0 ? 'text-emerald-400' : 'text-red-400'
          )}>
            {trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}h
          </span>
        )}
        {trend === 0 && (
          <span className="flex items-center text-[10px] text-slate-500 mb-1">
            <Minus size={10} />
          </span>
        )}
      </div>
    </div>
  )
}
