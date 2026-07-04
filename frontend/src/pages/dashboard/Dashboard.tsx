import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from 'recharts'
import {
  DollarSign, ShoppingBag, Users, Truck, Tag, AlertTriangle, TrendingUp, Receipt,
} from 'lucide-react'
import { dashboardService } from '@/services/dashboard.service'
import StatCard from '@/components/ui/StatCard'
import { SkeletonCard } from '@/components/ui/LoadingSkeleton'
import { fmtCurrency, fmtDate } from '@/utils/format'

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.stats,
  })
  const { data: salesGraph } = useQuery({
    queryKey: ['sales-graph'],
    queryFn: () => dashboardService.salesGraph(30),
  })
  const { data: monthlyRevenue } = useQuery({
    queryKey: ['monthly-revenue'],
    queryFn: () => dashboardService.monthlyRevenue(),
  })
  const { data: recentBills } = useQuery({
    queryKey: ['recent-bills'],
    queryFn: () => dashboardService.recentBills(8),
  })
  const { data: topProducts } = useQuery({
    queryKey: ['top-products'],
    queryFn: () => dashboardService.topProducts(8),
  })

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard title="Today's Sales" value={fmtCurrency(stats?.today_sales ?? 0)} icon={DollarSign} color="green" />
            <StatCard title="Monthly Sales" value={fmtCurrency(stats?.monthly_sales ?? 0)} icon={TrendingUp} color="blue" />
            <StatCard title="Products" value={stats?.total_products ?? 0} icon={ShoppingBag} color="purple" />
            <StatCard title="Categories" value={stats?.total_categories ?? 0} icon={Tag} color="teal" />
            <StatCard title="Customers" value={stats?.total_customers ?? 0} icon={Users} color="orange" />
            <StatCard title="Suppliers" value={stats?.total_suppliers ?? 0} icon={Truck} color="blue" />
            <StatCard title="Low Stock" value={stats?.low_stock_count ?? 0} icon={AlertTriangle} color="red" subtitle="Items need attention" />
          </>
        )}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sales trend */}
        <div className="card p-5">
          <h2 className="text-base font-semibold mb-4 dark:text-white">Sales (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesGraph ?? []}>
              <defs>
                <linearGradient id="sales-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => fmtCurrency(v)} />
              <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="url(#sales-grad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly revenue */}
        <div className="card p-5">
          <h2 className="text-base font-semibold mb-4 dark:text-white">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={(monthlyRevenue ?? []).map((r: { month: number; revenue: number; tax: number }) => ({
              ...r,
              name: months[r.month - 1],
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => fmtCurrency(v)} />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue" />
              <Bar dataKey="tax" fill="#10b981" radius={[4, 4, 0, 0]} name="Tax" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent bills */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-base font-semibold dark:text-white flex items-center gap-2">
              <Receipt size={16} className="text-blue-500" /> Recent Bills
            </h2>
          </div>
          <div className="table-container border-0 rounded-none">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(recentBills ?? []).map((b: { id: number; invoice_number: string; customer_name: string; grand_total: number; status: string }) => (
                  <tr key={b.id}>
                    <td className="font-mono text-xs">{b.invoice_number}</td>
                    <td>{b.customer_name}</td>
                    <td className="font-semibold">{fmtCurrency(b.grand_total)}</td>
                    <td>
                      <span className={b.status === 'completed' ? 'badge-green' : 'badge-red'}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!recentBills?.length && (
                  <tr><td colSpan={4} className="text-center text-gray-400 py-8">No bills yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top products */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-base font-semibold dark:text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-green-500" /> Top Selling Products
            </h2>
          </div>
          <div className="table-container border-0 rounded-none">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Qty Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(topProducts ?? []).map((p: { product_id: number; product_name: string; total_qty: number; total_revenue: number }, i: number) => (
                  <tr key={p.product_id}>
                    <td className="text-gray-400">{i + 1}</td>
                    <td className="font-medium">{p.product_name}</td>
                    <td>{p.total_qty}</td>
                    <td className="font-semibold">{fmtCurrency(p.total_revenue)}</td>
                  </tr>
                ))}
                {!topProducts?.length && (
                  <tr><td colSpan={4} className="text-center text-gray-400 py-8">No data yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
