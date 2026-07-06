import { LucideIcon } from 'lucide-react'

interface Props {
  title: string
  value: string | number
  icon: LucideIcon
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal'
  subtitle?: string
}

const colors = {
  blue: 'from-amber-500/10 to-yellow-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20 dark:border-amber-500/10',
  green: 'from-emerald-500/10 to-teal-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/10',
  purple: 'from-purple-500/10 to-indigo-500/5 text-purple-600 dark:text-purple-400 border-purple-500/20 dark:border-purple-500/10',
  orange: 'from-orange-500/10 to-amber-500/5 text-orange-600 dark:text-orange-400 border-orange-500/20 dark:border-orange-500/10',
  red: 'from-red-500/10 to-rose-500/5 text-red-600 dark:text-red-400 border-red-500/20 dark:border-red-500/10',
  teal: 'from-teal-500/10 to-emerald-500/5 text-teal-600 dark:text-teal-400 border-teal-500/20 dark:border-teal-500/10',
}

export default function StatCard({ title, value, icon: Icon, color, subtitle }: Props) {
  return (
    <div className="card p-5 relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 hover:shadow-lg hover:shadow-black/[0.015] dark:hover:shadow-black/20">
      {/* Accent hover top bar */}
      <div className="absolute top-0 left-0 w-full h-[2.5px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-none">{title}</span>
          <p className="text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight">{value}</p>
          {subtitle && <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br border shadow-sm ${colors[color]} group-hover:scale-105 transition-transform duration-300`}>
          <Icon size={20} className="stroke-[2.25]" />
        </div>
      </div>
    </div>
  )
}
