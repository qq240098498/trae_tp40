import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Moon, Clock, Sun, Eye, Save, RotateCcw, Thermometer, Volume2 } from 'lucide-react'
import { useSleepStore } from '@/store/sleepStore'
import { calculateSleepData, formatDuration, getTodayStr } from '@/utils/sleepCalculations'
import StarRating from '@/components/StarRating'
import { cn } from '@/lib/utils'
import { BEDTIME_HABITS, WAKE_HABITS, LIGHT_OPTIONS, NOISE_LEVELS, type BedtimeHabitId, type WakeHabitId, type SleepEnvironment, type LightLevel, type NoiseLevel } from '@/types/sleep'

export default function Record() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const { addRecord, updateRecord, records } = useSleepStore()

  const editRecord = editId ? records.find((r) => r.id === editId) : undefined

  const [date, setDate] = useState(editRecord?.date ?? getTodayStr())
  const [bedTime, setBedTime] = useState(editRecord?.bedTime ?? '23:00')
  const [sleepTime, setSleepTime] = useState(editRecord?.sleepTime ?? '23:30')
  const [wakeTime, setWakeTime] = useState(editRecord?.wakeTime ?? '07:00')
  const [wakeCount, setWakeCount] = useState<string>(editRecord?.wakeCount?.toString() ?? '')
  const [quality, setQuality] = useState(editRecord?.quality ?? 3)
  const [bedtimeHabits, setBedtimeHabits] = useState<BedtimeHabitId[]>(editRecord?.bedtimeHabits ?? [])
  const [wakeHabits, setWakeHabits] = useState<WakeHabitId[]>(editRecord?.wakeHabits ?? [])
  const [environment, setEnvironment] = useState<SleepEnvironment>(editRecord?.environment ?? {})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (editRecord) {
      setDate(editRecord.date)
      setBedTime(editRecord.bedTime)
      setSleepTime(editRecord.sleepTime)
      setWakeTime(editRecord.wakeTime)
      setWakeCount(editRecord.wakeCount?.toString() ?? '')
      setQuality(editRecord.quality)
      setBedtimeHabits(editRecord.bedtimeHabits ?? [])
      setWakeHabits(editRecord.wakeHabits ?? [])
      setEnvironment(editRecord.environment ?? {})
    }
  }, [editRecord])

  const computed = useMemo(() => {
    if (!bedTime || !sleepTime || !wakeTime) return null
    return calculateSleepData(bedTime, sleepTime, wakeTime)
  }, [bedTime, sleepTime, wakeTime])

  const existingRecord = useSleepStore((s) => s.records.find((r) => r.date === date && r.id !== editId))

  const handleSubmit = () => {
    const data = {
      date,
      bedTime,
      sleepTime,
      wakeTime,
      wakeCount: wakeCount ? parseInt(wakeCount) : undefined,
      quality,
      bedtimeHabits,
      wakeHabits,
      environment,
    }

    if (editId) {
      updateRecord(editId, data)
    } else {
      addRecord(data)
    }

    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      navigate('/history')
    }, 1200)
  }

  const handleReset = () => {
    setDate(getTodayStr())
    setBedTime('23:00')
    setSleepTime('23:30')
    setWakeTime('07:00')
    setWakeCount('')
    setQuality(3)
    setBedtimeHabits([])
    setWakeHabits([])
    setEnvironment({})
  }

  const isValid = date && bedTime && sleepTime && wakeTime && quality

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-serif bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">
          {editId ? '编辑记录' : '睡眠记录'}
        </h2>
        <p className="text-sm text-slate-500 mt-1">记录昨晚的睡眠数据</p>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-sm border border-indigo-900/30 rounded-2xl p-6 space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
            <CalendarIcon className="text-violet-400" size={16} />
            记录日期
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-800/80 border border-indigo-900/30 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
          />
          {existingRecord && !editId && (
            <p className="text-xs text-amber-400 mt-1.5">该日期已有记录，保存将新增（如需修改请前往历史页编辑）</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TimeField
            label="上床时间"
            icon={<Moon size={16} className="text-indigo-400" />}
            value={bedTime}
            onChange={setBedTime}
          />
          <TimeField
            label="入睡时间"
            icon={<Clock size={16} className="text-violet-400" />}
            value={sleepTime}
            onChange={setSleepTime}
          />
          <TimeField
            label="起床时间"
            icon={<Sun size={16} className="text-amber-400" />}
            value={wakeTime}
            onChange={setWakeTime}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Eye size={16} className="text-slate-400" />
                醒来次数
                <span className="text-[10px] text-slate-600">（可选）</span>
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={wakeCount}
                onChange={(e) => setWakeCount(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-800/80 border border-indigo-900/30 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
                睡眠质量自评
              </label>
              <StarRating value={quality} onChange={setQuality} size={32} />
              <div className="flex justify-between text-[10px] text-slate-600 mt-1 px-1">
                <span>很差</span>
                <span>一般</span>
                <span>很好</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-sm border border-indigo-900/30 rounded-2xl p-6 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
              <Moon size={16} className="text-indigo-400" />
              睡前习惯
              <span className="text-[10px] text-slate-600">（可多选）</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BEDTIME_HABITS.map((habit) => {
                const selected = bedtimeHabits.includes(habit.id)
                return (
                  <button
                    key={habit.id}
                    type="button"
                    onClick={() => {
                      if (selected) {
                        setBedtimeHabits(bedtimeHabits.filter((h) => h !== habit.id))
                      } else {
                        setBedtimeHabits([...bedtimeHabits, habit.id])
                      }
                    }}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-medium transition-all duration-200',
                      selected
                        ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40 shadow-inner shadow-violet-500/10'
                        : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-slate-300'
                    )}
                  >
                    <span className="text-xl">{habit.icon}</span>
                    <span>{habit.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
              <Sun size={16} className="text-amber-400" />
              醒后习惯
              <span className="text-[10px] text-slate-600">（可多选）</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {WAKE_HABITS.map((habit) => {
                const selected = wakeHabits.includes(habit.id)
                return (
                  <button
                    key={habit.id}
                    type="button"
                    onClick={() => {
                      if (selected) {
                        setWakeHabits(wakeHabits.filter((h) => h !== habit.id))
                      } else {
                        setWakeHabits([...wakeHabits, habit.id])
                      }
                    }}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-medium transition-all duration-200',
                      selected
                        ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 shadow-inner shadow-amber-500/10'
                        : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-slate-300'
                    )}
                  >
                    <span className="text-xl">{habit.icon}</span>
                    <span>{habit.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-sm border border-indigo-900/30 rounded-2xl p-6 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
              <Thermometer size={16} className="text-cyan-400" />
              睡眠环境
              <span className="text-[10px] text-slate-600">（可选）</span>
            </label>

            <div className="space-y-5">
              <div>
                <p className="text-xs text-slate-400 mb-2">室温 (°C)</p>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="35"
                    step="1"
                    value={environment.roomTemp ?? 22}
                    onChange={(e) => setEnvironment({ ...environment, roomTemp: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <span className="text-sm font-medium text-cyan-300 min-w-[48px] text-right">
                    {environment.roomTemp ?? 22}°C
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-2">噪音水平</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {NOISE_LEVELS.map((level) => {
                    const selected = environment.noiseLevel === level.id
                    return (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => setEnvironment({
                          ...environment,
                          noiseLevel: selected ? undefined : level.id as NoiseLevel,
                        })}
                        className={cn(
                          'flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-medium transition-all duration-200',
                          selected
                            ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 shadow-inner shadow-cyan-500/10'
                            : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-slate-300'
                        )}
                      >
                        <span className="text-xl">{level.icon}</span>
                        <span>{level.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-2">光线条件</p>
                <div className="grid grid-cols-3 gap-2">
                  {LIGHT_OPTIONS.map((option) => {
                    const selected = environment.lightLevel === option.id
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setEnvironment({
                          ...environment,
                          lightLevel: selected ? undefined : option.id as LightLevel,
                        })}
                        className={cn(
                          'flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-medium transition-all duration-200',
                          selected
                            ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 shadow-inner shadow-cyan-500/10'
                            : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-slate-300'
                        )}
                      >
                        <span className="text-xl">{option.icon}</span>
                        <span>{option.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEnvironment({ ...environment, earPlugs: !environment.earPlugs })}
                  className={cn(
                    'flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-medium transition-all duration-200',
                    environment.earPlugs
                      ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-slate-300'
                  )}
                >
                  <span className="text-lg">🧏</span>
                  使用耳塞
                </button>
                <button
                  type="button"
                  onClick={() => setEnvironment({ ...environment, eyeMask: !environment.eyeMask })}
                  className={cn(
                    'flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-medium transition-all duration-200',
                    environment.eyeMask
                      ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-slate-300'
                  )}
                >
                  <span className="text-lg">🎭</span>
                  使用眼罩
                </button>
              </div>
            </div>
          </div>
        </div>

      {computed && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="卧床时长"
            value={formatDuration(computed.timeInBed)}
            color="from-indigo-500 to-blue-500"
            sub={`${(computed.timeInBed / 60).toFixed(1)}h`}
          />
          <StatCard
            label="实际睡眠"
            value={formatDuration(computed.actualSleep)}
            color="from-violet-500 to-purple-500"
            sub={`${(computed.actualSleep / 60).toFixed(1)}h`}
          />
          <StatCard
            label="睡眠效率"
            value={`${computed.efficiency}%`}
            color={computed.efficiency >= 85 ? 'from-emerald-500 to-green-500' : computed.efficiency >= 70 ? 'from-amber-500 to-yellow-500' : 'from-red-500 to-rose-500'}
            sub={computed.efficiency >= 85 ? '优秀' : computed.efficiency >= 70 ? '一般' : '较差'}
          />
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={!isValid || saved}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300',
            isValid && !saved
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20 hover:shadow-violet-600/40 hover:-translate-y-0.5'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          )}
        >
          {saved ? (
            <>已保存 ✓</>
          ) : (
            <>
              <Save size={16} />
              {editId ? '更新记录' : '保存记录'}
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-3.5 rounded-xl text-sm text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 transition-all"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  )
}

function TimeField({
  label,
  icon,
  value,
  onChange,
}: {
  label: string
  icon: React.ReactNode
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
        {icon}
        {label}
      </label>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800/80 border border-indigo-900/30 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
      />
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
  sub,
}: {
  label: string
  value: string
  color: string
  sub: string
}) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-sm border border-indigo-900/30 rounded-xl p-4 relative overflow-hidden group">
      <div className={cn('absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r', color)} />
      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-bold text-slate-100">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
    </div>
  )
}

function CalendarIcon({ className, size }: { className?: string; size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size ?? 16} height={size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}
