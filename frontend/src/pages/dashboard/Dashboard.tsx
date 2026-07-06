import { useQuery } from '@tanstack/react-query'
import {
  DollarSign, ShoppingBag, Users, Truck, Tag, AlertTriangle, TrendingUp, Receipt,
} from 'lucide-react'
import { dashboardService } from '@/services/dashboard.service'
import { reportService } from '@/services/report.service'
import { customerService } from '@/services/customer.service'
import StatCard from '@/components/ui/StatCard'
import { SkeletonCard } from '@/components/ui/LoadingSkeleton'
import { fmtCurrency } from '@/utils/format'
import { useAuth } from '@/context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.stats,
  })
  const { data: stockReport } = useQuery({
    queryKey: ['dashboard-low-stock'],
    queryFn: () => reportService.stock(),
  })
  const { data: customersData } = useQuery({
    queryKey: ['dashboard-top-customers'],
    queryFn: () => customerService.list({ limit: 100 }),
  })
  const { data: recentBills } = useQuery({
    queryKey: ['recent-bills'],
    queryFn: () => dashboardService.recentBills(8),
  })
  const { data: topProducts } = useQuery({
    queryKey: ['top-products'],
    queryFn: () => dashboardService.topProducts(8),
  })

  const lowStockItems = stockReport?.low_stock_items || []
  const topCustomers = [...(customersData?.items || [])]
    .sort((a, b) => (b.total_sales ?? 0) - (a.total_sales ?? 0))
    .slice(0, 8)

  const getGreeting = () => {
    const hr = new Date().getHours()
    if (hr < 12) return 'Good morning'
    if (hr < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {getGreeting()}, {user?.name || 'Admin'}! Here's what's happening.
        </p>
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

      {/* List row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-base font-semibold dark:text-white flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500 animate-pulse" /> Low Stock Alerts
            </h2>
          </div>
          <div className="table-container border-0 rounded-none">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Current Stock</th>
                  <th>Min Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.slice(0, 8).map((p: any) => (
                  <tr key={p.id}>
                    <td className="font-semibold dark:text-gray-200">{p.name}</td>
                    <td className="text-red-600 dark:text-red-400 font-bold">{p.current_stock} {p.unit}</td>
                    <td className="text-gray-500">{p.minimum_stock} {p.unit}</td>
                    <td>
                      <span className="badge-red text-[10px] font-bold">Reorder</span>
                    </td>
                  </tr>
                ))}
                {!lowStockItems.length && (
                  <tr><td colSpan={4} className="text-center text-gray-400 py-8">All products in good stock</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Customers & Credit Dues */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-base font-semibold dark:text-white flex items-center gap-2">
              <Users size={16} className="text-blue-500" /> Top Customers Ledger
            </h2>
          </div>
          <div className="table-container border-0 rounded-none">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Total Purchases</th>
                  <th>Paid Amount</th>
                  <th>Balance Due</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c: any) => (
                  <tr key={c.id}>
                    <td className="font-semibold dark:text-gray-200">{c.name}</td>
                    <td className="font-semibold">{fmtCurrency(c.total_sales ?? 0)}</td>
                    <td className="text-emerald-600 dark:text-emerald-400 font-semibold">{fmtCurrency(c.total_paid ?? 0)}</td>
                    <td className={`font-semibold ${c.total_due > 0 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                      {fmtCurrency(c.total_due ?? 0)}
                    </td>
                  </tr>
                ))}
                {!topCustomers.length && (
                  <tr><td colSpan={4} className="text-center text-gray-400 py-8">No customer data</td></tr>
                )}
              </tbody>
            </table>
          </div>
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
                  <tr><td colSpan={4} className="text-center text-gray-400 py-8">No sales data yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
