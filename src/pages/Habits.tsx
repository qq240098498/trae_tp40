import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, TrendingDown, TrendingUp, Lightbulb, Moon, Sun, Info } from 'lucide-react'
import { useSleepStore } from '@/store/sleepStore'
import { analyzeHabits } from '@/utils/habitAnalysis'
import { cn } from '@/lib/utils'

export default function Habits() {
  const navigate = useNavigate()
  const records = useSleepStore((s) => s.records)

  const insights = useMemo(() => analyzeHabits(records), [records])

  const hasData = insights.bedtime.length > 0 || insights.wake.length > 0
  const hasSuggestions = insights.suggestions.length > 0
  const hasCompareData = insights.topBadBedtimeHabits.length > 0 || insights.topGoodBedtimeHabits.length > 0 || insights.topBadWakeHabits.length > 0 || insights.topGoodWakeHabits.length > 0

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-serif bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">
          习惯分析
        </h2>
        <p className="text-sm text-slate-500 mt-1">了解你的习惯如何影响睡眠</p>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-600">
          <Sparkles size={48} className="mb-4 text-slate-700" />
          <p className="text-lg font-medium">暂无习惯数据</p>
          <p className="text-sm mt-1">记录睡眠时添加习惯，即可获得个性化分析</p>
          <button
            onClick={() => navigate('/record')}
            className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium shadow-lg shadow-violet-600/20 hover:shadow-violet-600/40 transition-all"
          >
            去记录
          </button>
        </div>
      ) : (
        <>
          {!hasCompareData && hasData && (
            <div className="bg-slate-900/60 backdrop-blur-sm border border-indigo-900/30 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <Info size={20} className="text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-1">数据积累中</h3>
                  <p className="text-sm text-slate-400">
                    目前只有 {records.length} 条记录，系统需要更多数据来分析习惯对睡眠的影响。
                    继续记录，积累更多数据后即可获得个性化的对比分析和改善建议。
                  </p>
                </div>
              </div>
            </div>
          )}

          {hasSuggestions && (
            <div className="bg-gradient-to-br from-violet-900/30 to-indigo-900/30 backdrop-blur-sm border border-violet-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={20} className="text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-200">个性化改善建议</h3>
              </div>
              <div className="space-y-3">
                {insights.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 text-sm text-slate-300"
                  >
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-violet-600/30 flex items-center justify-center text-xs text-violet-300 font-medium shrink-0">
                      {index + 1}
                    </span>
                    <p>{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insights.topBadBedtimeHabits.length > 0 && (
            <div className="bg-slate-900/60 backdrop-blur-sm border border-indigo-900/30 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown size={18} className="text-red-400" />
                <h3 className="text-sm font-semibold text-slate-200">拖慢入睡的睡前习惯</h3>
              </div>
              <div className="space-y-3">
                {insights.topBadBedtimeHabits.map((habit) => (
                  <div
                    key={habit.habitId}
                    className="flex items-center justify-between p-3 rounded-xl bg-red-950/30 border border-red-900/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{habit.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{habit.label}</p>
                        <p className="text-xs text-slate-500">样本: {habit.sampleSize} 天</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-400">+{habit.difference} 分钟</p>
                      <p className="text-[10px] text-slate-500">入睡变慢</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insights.topGoodBedtimeHabits.length > 0 && (
            <div className="bg-slate-900/60 backdrop-blur-sm border border-indigo-900/30 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-200">帮助入睡的睡前习惯</h3>
              </div>
              <div className="space-y-3">
                {insights.topGoodBedtimeHabits.map((habit) => (
                  <div
                    key={habit.habitId}
                    className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{habit.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{habit.label}</p>
                        <p className="text-xs text-slate-500">样本: {habit.sampleSize} 天</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">-{Math.abs(habit.difference)} 分钟</p>
                      <p className="text-[10px] text-slate-500">入睡更快</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insights.topBadWakeHabits.length > 0 && (
            <div className="bg-slate-900/60 backdrop-blur-sm border border-indigo-900/30 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sun size={18} className="text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-200">影响状态的醒后习惯</h3>
              </div>
              <div className="space-y-3">
                {insights.topBadWakeHabits.map((habit) => (
                  <div
                    key={habit.habitId}
                    className="flex items-center justify-between p-3 rounded-xl bg-amber-950/30 border border-amber-900/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{habit.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{habit.label}</p>
                        <p className="text-xs text-slate-500">样本: {habit.sampleSize} 天</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-amber-400">{habit.qualityDifference} ⭐</p>
                      <p className="text-[10px] text-slate-500">质量下降</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insights.topGoodWakeHabits.length > 0 && (
            <div className="bg-slate-900/60 backdrop-blur-sm border border-indigo-900/30 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sun size={18} className="text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-200">提升状态的醒后习惯</h3>
              </div>
              <div className="space-y-3">
                {insights.topGoodWakeHabits.map((habit) => (
                  <div
                    key={habit.habitId}
                    className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{habit.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{habit.label}</p>
                        <p className="text-xs text-slate-500">样本: {habit.sampleSize} 天</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">+{habit.qualityDifference} ⭐</p>
                      <p className="text-[10px] text-slate-500">质量提升</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-slate-900/60 backdrop-blur-sm border border-indigo-900/30 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">详细数据</h3>

            {insights.bedtime.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-medium text-slate-400 mb-3 flex items-center gap-2">
                  <Moon size={12} className="text-indigo-400" />
                  睡前习惯对入睡时间的影响
                </h4>
                <div className="space-y-2">
                  {insights.bedtime.map((habit) => {
                    const hasWithout = habit.withoutSampleSize > 0
                    return (
                      <div
                        key={habit.habitId}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{habit.icon}</span>
                          <span className="text-sm text-slate-300">{habit.label}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-slate-500">
                            有习惯: <span className="text-slate-300">{habit.avgSleepOnsetMinutes}分钟</span>
                          </span>
                          {hasWithout ? (
                            <>
                              <span className="text-slate-600">|</span>
                              <span className="text-slate-500">
                                无习惯: <span className="text-slate-300">{habit.avgSleepOnsetWithout}分钟</span>
                              </span>
                              <span className={cn(
                                'font-medium min-w-[60px] text-right',
                                habit.difference > 0 ? 'text-red-400' : habit.difference < 0 ? 'text-emerald-400' : 'text-slate-500'
                              )}>
                                {habit.difference > 0 ? '+' : ''}{habit.difference}分钟
                              </span>
                            </>
                          ) : (
                            <span className="text-slate-600 text-right min-w-[100px]">
                              暂无对比数据
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {insights.wake.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-slate-400 mb-3 flex items-center gap-2">
                  <Sun size={12} className="text-amber-400" />
                  醒后习惯对睡眠质量的影响
                </h4>
                <div className="space-y-2">
                  {insights.wake.map((habit) => {
                    const hasWithout = habit.withoutSampleSize > 0
                    return (
                      <div
                        key={habit.habitId}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{habit.icon}</span>
                          <span className="text-sm text-slate-300">{habit.label}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-slate-500">
                            有习惯: <span className="text-slate-300">{habit.avgQuality} ⭐</span>
                          </span>
                          {hasWithout ? (
                            <>
                              <span className="text-slate-600">|</span>
                              <span className="text-slate-500">
                                无习惯: <span className="text-slate-300">{habit.avgQualityWithout} ⭐</span>
                              </span>
                              <span className={cn(
                                'font-medium min-w-[50px] text-right',
                                habit.qualityDifference > 0 ? 'text-emerald-400' : habit.qualityDifference < 0 ? 'text-red-400' : 'text-slate-500'
                              )}>
                                {habit.qualityDifference > 0 ? '+' : ''}{habit.qualityDifference} ⭐
                              </span>
                            </>
                          ) : (
                            <span className="text-slate-600 text-right min-w-[100px]">
                              暂无对比数据
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
