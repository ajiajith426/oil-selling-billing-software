import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Tag, Layers, Package, Users, Truck,
  ShoppingCart, Receipt, BarChart2, Settings, ChevronRight,
  Boxes, TrendingUp, X,
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
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-30
          bg-gray-900 text-white flex flex-col
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Receipt size={18} />
            </div>
            <span className="font-bold text-base leading-tight">BillSoft</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {nav.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              <ChevronRight size={14} className="opacity-30" />
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-3 border-t border-gray-700">
          <p className="text-xs text-gray-400">Logged in as</p>
          <p className="text-sm font-medium truncate">{user?.name}</p>
          <span className="badge badge-blue mt-1">{user?.role}</span>
        </div>
      </aside>
    </>
  )
}
