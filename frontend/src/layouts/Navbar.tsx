import { Menu, Sun, Moon, LogOut, Droplet } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

interface Props {
  onMenuClick: () => void
}

export default function Navbar({ onMenuClick }: Props) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 h-16 flex items-center gap-4 px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200/60 dark:border-slate-800/60 shadow-sm shadow-gray-100/5 dark:shadow-none">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      {/* Tagline / Brand header showing current state for desk */}
      <div className="hidden md:flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs">
        <Droplet size={14} className="text-amber-500 animate-pulse" />
        <span className="font-semibold tracking-wide uppercase text-[10px]">MJ Agency Portal</span>
        <span className="text-slate-300 dark:text-slate-800">|</span>
        <span className="text-[10px] font-medium">Wholesale Stock, Billing & Sales</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2.5">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-all duration-200"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User profile details & avatar */}
        <div className="flex items-center gap-3 pl-3.5 border-l border-gray-200 dark:border-slate-800">
          <div className="relative cursor-pointer select-none">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 p-[1.5px] shadow-md shadow-amber-500/10 hover:scale-105 transition-all duration-200">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-white text-[11px] font-extrabold tracking-wider">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
            </div>
            {/* Status dot */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </div>
          <div className="hidden sm:flex flex-col text-left select-none">
            <span className="text-xs font-bold text-gray-800 dark:text-slate-200 leading-none">{user?.name || 'Administrator'}</span>
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-0.5">{user?.role || 'Admin'}</span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-all duration-200"
          aria-label="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
