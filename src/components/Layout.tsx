import { useNavigate, useLocation } from 'react-router-dom'
import { Moon, ClipboardList, TrendingUp, Download, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSleepStore } from '@/store/sleepStore'
import { exportToCSV } from '@/utils/export'

const navItems = [
  { path: '/record', label: '记录', icon: Moon },
  { path: '/history', label: '历史', icon: ClipboardList },
  { path: '/trends', label: '趋势', icon: TrendingUp },
  { path: '/habits', label: '习惯', icon: Sparkles },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const records = useSleepStore((s) => s.records)

  const handleExport = () => {
    if (records.length === 0) return
    const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date))
    exportToCSV(sorted)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden md:flex flex-col w-64 border-r border-indigo-900/40 bg-slate-950/60 backdrop-blur-sm p-6 shrink-0">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Moon size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent font-serif">
                SleepTrack
              </h1>
              <p className="text-[10px] text-slate-500 tracking-widest uppercase">睡眠记录</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/20 text-violet-300 shadow-inner shadow-violet-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  )}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-sm shadow-violet-400" />
                  )}
                </button>
              )
            })}
          </nav>

          <div className="pt-4 border-t border-indigo-900/30">
            <button
              onClick={handleExport}
              disabled={records.length === 0}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                records.length > 0
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  : 'text-slate-600 cursor-not-allowed'
              )}
            >
              <Download size={18} />
              <span>导出数据</span>
            </button>
          </div>

          <div className="mt-4 text-[10px] text-slate-600 text-center">
            共 {records.length} 条记录
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border-t border-indigo-900/30 px-2 pb-safe">
            <div className="flex items-center justify-around py-2">
              {navItems.map(({ path, label, icon: Icon }) => {
                const active = location.pathname === path
                return (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className={cn(
                      'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-all duration-200',
                      active ? 'text-violet-400' : 'text-slate-500'
                    )}
                  >
                    <Icon size={20} />
                    <span className="text-[10px]">{label}</span>
                  </button>
                )
              })}
              <button
                onClick={handleExport}
                disabled={records.length === 0}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-all',
                  records.length > 0 ? 'text-slate-500' : 'text-slate-700'
                )}
              >
                <Download size={20} />
                <span className="text-[10px]">导出</span>
              </button>
            </div>
          </div>
          <div className="max-w-3xl mx-auto p-6 md:p-10 pb-24 md:pb-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
