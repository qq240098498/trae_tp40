import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Edit3, Moon, Clock } from 'lucide-react'
import { useSleepStore } from '@/store/sleepStore'
import { formatDuration, formatDate } from '@/utils/sleepCalculations'
import { cn } from '@/lib/utils'

export default function History() {
  const navigate = useNavigate()
  const { records, deleteRecord } = useSleepStore()
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date))

  const grouped = sorted.reduce<Record<string, typeof sorted>>((acc, r) => {
    const d = new Date(r.date)
    const key = `${d.getFullYear()}年${d.getMonth() + 1}月`
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteRecord(id)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-serif bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">
          睡眠历史
        </h2>
        <p className="text-sm text-slate-500 mt-1">共 {records.length} 条记录</p>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-600">
          <Moon size={48} className="mb-4 text-slate-700" />
          <p className="text-lg font-medium">还没有睡眠记录</p>
          <p className="text-sm mt-1">去记录页添加第一条记录吧</p>
          <button
            onClick={() => navigate('/record')}
            className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium shadow-lg shadow-violet-600/20 hover:shadow-violet-600/40 transition-all"
          >
            开始记录
          </button>
        </div>
      ) : (
        Object.entries(grouped).map(([month, items]) => (
          <div key={month}>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">
              {month}
            </h3>
            <div className="space-y-2">
              {items.map((record) => (
                <div
                  key={record.id}
                  className="bg-slate-900/60 backdrop-blur-sm border border-indigo-900/30 rounded-xl p-4 hover:border-indigo-800/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-200">{formatDate(record.date)}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              i < record.quality ? 'bg-amber-400' : 'bg-slate-700'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate(`/record?edit=${record.id}`)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-slate-800 transition-all"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className={cn(
                          'p-1.5 rounded-lg transition-all',
                          deleteConfirm === record.id
                            ? 'text-red-400 bg-red-500/10'
                            : 'text-slate-500 hover:text-red-400 hover:bg-slate-800'
                        )}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Moon size={10} /> 卧床
                      </span>
                      <span className="text-slate-300 font-medium">{formatDuration(record.timeInBed)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock size={10} /> 睡眠
                      </span>
                      <span className="text-slate-300 font-medium">{formatDuration(record.actualSleep)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">效率</span>
                      <span className={cn(
                        'font-medium',
                        record.efficiency >= 85 ? 'text-emerald-400' : record.efficiency >= 70 ? 'text-amber-400' : 'text-red-400'
                      )}>
                        {record.efficiency}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-2 pt-2 border-t border-indigo-900/20 text-[10px] text-slate-600">
                    <span>{record.bedTime} → {record.wakeTime}</span>
                    <span>入睡 {record.sleepTime}</span>
                    {record.wakeCount !== undefined && <span>醒来 {record.wakeCount} 次</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
