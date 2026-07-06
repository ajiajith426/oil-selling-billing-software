import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Tag, Layers, Package, Users, Truck,
  ShoppingCart, Receipt, BarChart2, Settings, ChevronRight,
  Boxes, TrendingUp, X, Droplet,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const nav = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  { label: 'Categories', icon: Tag, to: '/categories' },
  { label: 'Sub Categories', icon: Layers, to: '/subcategories' },
  { label: 'Products', icon: Package, to: '/products' },
  { label: 'Customers', icon: Users, to: '/customers' },
  { label: 'Suppliers', icon: Truck, to: '/suppliers' },
  { label: 'Purchase', icon: ShoppingCart, to: '/purchases' },
  { label: 'Billing / POS', icon: Receipt, to: '/billing' },
  { label: 'Sales History', icon: TrendingUp, to: '/sales' },
  { label: 'Stock', icon: Boxes, to: '/stock' },
  { label: 'Reports', icon: BarChart2, to: '/reports' },
  { label: 'Settings', icon: Settings, to: '/settings' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: Props) {
  const { user } = useAuth()

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-50
          bg-slate-950 text-slate-100 flex flex-col border-r border-slate-900/60
          transition-transform duration-300 shadow-2xl shadow-black/40
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto lg:shadow-none
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Droplet size={18} className="text-white fill-current animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-wide text-white leading-tight">MJ AGENCY</span>
              <span className="text-[9px] text-amber-400 font-bold tracking-widest uppercase">Wholesale</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-5 px-3.5 space-y-1 custom-scrollbar">
          {nav.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border-l-4 group
                ${isActive
                  ? 'bg-gradient-to-r from-amber-500/10 to-transparent text-amber-400 border-amber-500 pl-2.5 shadow-sm shadow-amber-500/[0.02]'
                  : 'text-slate-400 border-transparent hover:bg-slate-900 hover:text-slate-200 hover:pl-3.5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={`transition-colors duration-200 group-hover:scale-110 duration-200
                      ${isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'}`}
                  />
                  <span className="flex-1 transition-transform duration-200">{label}</span>
                  <ChevronRight
                    size={14}
                    className={`transition-opacity duration-200
                      ${isActive ? 'opacity-80 text-amber-400' : 'opacity-10 group-hover:opacity-30'}`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logged in User info */}
        <div className="px-5 py-4 border-t border-slate-900 bg-slate-950/80 backdrop-blur-sm">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Session Profile</p>
          <div className="flex items-center gap-2.5 mt-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-amber-500/10">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.name || 'Administrator'}</p>
              <span className="inline-block bg-amber-500/10 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-0.5 border border-amber-500/10">
                {user?.role?.toUpperCase() || 'ADMIN'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
