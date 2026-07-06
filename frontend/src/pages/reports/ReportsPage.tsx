import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart2, TrendingUp, Package, FileText, DollarSign, Users, Truck } from 'lucide-react'
import { reportService } from '@/services/report.service'
import { fmtCurrency, today, monthStart } from '@/utils/format'
import { DateRangePicker } from '@/components/ui/DateRangePicker'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

type ReportTab = 'sales' | 'purchases' | 'stock' | 'creditors' | 'debtors' | 'vehiclexpenses' | 'dailywages' | 'monthlysalaries' | 'gst' | 'profit'

export default function ReportsPage() {
  const [tab, setTab] = useState<ReportTab>('sales')
  const [fromDate, setFromDate] = useState(monthStart())
  const [toDate, setToDate] = useState(today())

  const tabs = [
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'purchases', label: 'Purchase', icon: BarChart2 },
    { id: 'stock', label: 'Stocks', icon: Package },
    { id: 'creditors', label: 'Creditors', icon: Truck },
    { id: 'debtors', label: 'Debtors', icon: Users },
    { id: 'vehiclexpenses', label: 'Vehicle Expenses', icon: Truck },
    { id: 'dailywages', label: 'Daily Wages', icon: DollarSign },
    { id: 'monthlysalaries', label: 'Monthly Salaries', icon: Users },
    { id: 'gst', label: 'GST', icon: FileText },
    { id: 'profit', label: 'Profit & Loss', icon: DollarSign },
  ] as const

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold dark:text-white">Reports</h1>
        <p className="text-sm text-gray-500">Business insights and analytics</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit flex-wrap">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id as ReportTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === id
                ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Date range (not for stock, creditors, debtors, vehicles, wages, salaries) */}
      {tab !== 'stock' && tab !== 'creditors' && tab !== 'debtors' && tab !== 'vehiclexpenses' && tab !== 'dailywages' && tab !== 'monthlysalaries' && (
        <div className="card p-4 flex flex-col gap-2 w-fit">
          <label className="label">Date Range</label>
          <DateRangePicker
            fromDate={fromDate}
            toDate={toDate}
            onChange={(range) => {
              setFromDate(range.from)
              setToDate(range.to)
            }}
          />
        </div>
      )}

      {/* Report panels */}
      {tab === 'sales' && <SalesReport from={fromDate} to={toDate} />}
      {tab === 'purchases' && <PurchaseReport from={fromDate} to={toDate} />}
      {tab === 'stock' && <StockReport />}
      {tab === 'creditors' && <CreditorsReport />}
      {tab === 'debtors' && <DebtorsReport />}
      {tab === 'vehiclexpenses' && <VehicleExpensesReport />}
      {tab === 'dailywages' && <DailyWagesReport />}
      {tab === 'monthlysalaries' && <MonthlySalariesReport />}
      {tab === 'gst' && <GstReport from={fromDate} to={toDate} />}
      {tab === 'profit' && <ProfitLossReport from={fromDate} to={toDate} />}
    </div>
  )
}

// ── Sales Report ─────────────────────────────────────────────────────────

function SalesReport({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['report-sales', from, to],
    queryFn: () => reportService.sales(from, to),
  })

  return (
    <div className="space-y-4">
      {isLoading ? <p className="text-gray-400">Loading…</p> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox label="Total Bills" value={data?.total_bills ?? 0} />
            <StatBox label="Total Sales" value={fmtCurrency(data?.total_sales ?? 0)} />
            <StatBox label="Total Tax" value={fmtCurrency(data?.total_tax ?? 0)} />
            <StatBox label="Total Discount" value={fmtCurrency(data?.total_discount ?? 0)} />
          </div>

          {data?.product_wise?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold mb-4 dark:text-white">Product-wise Sales</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.product_wise.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => fmtCurrency(v)} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="tax" fill="#10b981" name="Tax" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="card">
            <div className="table-container border-0 rounded-none">
              <table>
                <thead>
                  <tr><th>Product</th><th>Qty Sold</th><th>Revenue</th><th>Tax</th></tr>
                </thead>
                <tbody>
                  {data?.product_wise?.map((r: { product: string; qty: number; revenue: number; tax: number }) => (
                    <tr key={r.product}>
                      <td className="font-medium dark:text-white">{r.product}</td>
                      <td>{r.qty}</td>
                      <td className="font-semibold">{fmtCurrency(r.revenue)}</td>
                      <td>{fmtCurrency(r.tax)}</td>
                    </tr>
                  ))}
                  {!data?.product_wise?.length && (
                    <tr><td colSpan={4} className="text-center py-8 text-gray-400">No data for selected period</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Purchase Report ───────────────────────────────────────────────────────

function PurchaseReport({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['report-purchases', from, to],
    queryFn: () => reportService.purchases(from, to),
  })

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {isLoading ? <p className="text-gray-400 col-span-3">Loading…</p> : (
        <>
          <StatBox label="Total Purchases" value={data?.total_purchases ?? 0} />
          <StatBox label="Total Amount" value={fmtCurrency(data?.total_amount ?? 0)} />
          <StatBox label="Total Tax" value={fmtCurrency(data?.total_tax ?? 0)} />
        </>
      )}
    </div>
  )
}

// ── Stock Report ──────────────────────────────────────────────────────────

function StockReport() {
  const { data, isLoading } = useQuery({
    queryKey: ['report-stock'],
    queryFn: reportService.stock,
  })

  return (
    <div className="space-y-4">
      {isLoading ? <p className="text-gray-400">Loading…</p> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox label="Total Products" value={data?.total_products ?? 0} />
            <StatBox label="In Stock" value={data?.in_stock_count ?? 0} color="green" />
            <StatBox label="Low Stock" value={data?.low_stock_count ?? 0} color="yellow" />
            <StatBox label="Out of Stock" value={data?.out_of_stock_count ?? 0} color="red" />
          </div>
          <StatBox label="Total Stock Value" value={fmtCurrency(data?.total_stock_value ?? 0)} />

          {data?.low_stock_items?.length > 0 && (
            <div className="card">
              <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold dark:text-white">Low Stock Items</h3>
              </div>
              <div className="table-container border-0 rounded-none">
                <table>
                  <thead><tr><th>Product</th><th>Current Stock</th><th>Minimum Stock</th><th>Unit</th></tr></thead>
                  <tbody>
                    {data.low_stock_items.map((p: { id: number; name: string; current_stock: number; minimum_stock: number; unit: string }) => (
                      <tr key={p.id}>
                        <td className="font-medium dark:text-white">{p.name}</td>
                        <td className="text-orange-500 font-semibold">{p.current_stock}</td>
                        <td className="text-gray-500">{p.minimum_stock}</td>
                        <td>{p.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── GST Report ────────────────────────────────────────────────────────────

function GstReport({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['report-gst', from, to],
    queryFn: () => reportService.gst(from, to),
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {isLoading ? <p className="text-gray-400 col-span-3">Loading…</p> : (
        <>
          <StatBox label="GST Collected (Sales)" value={fmtCurrency(data?.gst_collected ?? 0)} color="green" />
          <StatBox label="GST Paid (Purchases)" value={fmtCurrency(data?.gst_paid ?? 0)} color="red" />
          <StatBox label="Net GST Payable" value={fmtCurrency(data?.net_gst ?? 0)} color={(data?.net_gst ?? 0) >= 0 ? 'blue' : 'green'} />
        </>
      )}
    </div>
  )
}

// ── Profit & Loss ─────────────────────────────────────────────────────────

function ProfitLossReport({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['report-pl', from, to],
    queryFn: () => reportService.profitLoss(from, to),
  })

  return (
    <div className="space-y-4">
      {isLoading ? <p className="text-gray-400">Loading…</p> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox label="Revenue" value={fmtCurrency(data?.revenue ?? 0)} color="green" />
          <StatBox label="Cost of Goods" value={fmtCurrency(data?.cost_of_goods_sold ?? 0)} color="red" />
          <StatBox label="Gross Profit" value={fmtCurrency(data?.gross_profit ?? 0)}
            color={(data?.gross_profit ?? 0) >= 0 ? 'blue' : 'red'} />
          <StatBox label="Gross Margin" value={`${data?.gross_margin_percent ?? 0}%`}
            color={(data?.gross_margin_percent ?? 0) >= 0 ? 'green' : 'red'} />
        </div>
      )}
    </div>
  )
}

// ── Creditors Report ───────────────────────────────────────────────────────

function CreditorsReport() {
  const { data, isLoading } = useQuery({
    queryKey: ['report-creditors'],
    queryFn: () => reportService.creditors(),
  })
  const [search, setSearch] = useState('')
  const [filterOutstanding, setFilterOutstanding] = useState(true)

  if (isLoading) return <p className="text-gray-400">Loading…</p>

  const items = (filterOutstanding ? data?.outstanding_items : data?.all_items) || []
  const filtered = items.filter((item: any) =>
    (item.supplier_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.mobile || '').includes(search)
  )

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatBox label="Total Creditors" value={data?.total_creditors ?? 0} color="yellow" />
        <StatBox label="Total Outstanding Balance" value={fmtCurrency(data?.total_outstanding ?? 0)} color="red" />
      </div>

      <div className="card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search supplier by name/phone..."
            className="input pl-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="filter-outstanding-creditors"
            checked={filterOutstanding}
            onChange={(e) => setFilterOutstanding(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="filter-outstanding-creditors" className="text-sm font-semibold text-gray-700 dark:text-gray-300 select-none cursor-pointer">
            Show Outstanding Balance Only
          </label>
        </div>
      </div>

      <div className="card">
        <div className="table-container border-0 rounded-none">
          <table>
            <thead>
              <tr>
                <th>Supplier Name</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Total Purchases</th>
                <th>Total Paid</th>
                <th>Outstanding Balance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r: any) => (
                <tr key={r.supplier_id}>
                  <td className="font-semibold dark:text-white">{r.supplier_name}</td>
                  <td>{r.mobile}</td>
                  <td>{r.email}</td>
                  <td>{fmtCurrency(r.total_purchases)}</td>
                  <td>{fmtCurrency(r.total_paid)}</td>
                  <td className={`font-bold ${r.total_due > 0 ? 'text-red-500' : 'text-gray-500'}`}>{fmtCurrency(r.total_due)}</td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    No creditors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Debtors Report ─────────────────────────────────────────────────────────

function DebtorsReport() {
  const { data, isLoading } = useQuery({
    queryKey: ['report-debtors'],
    queryFn: () => reportService.debtors(),
  })
  const [search, setSearch] = useState('')
  const [filterOutstanding, setFilterOutstanding] = useState(true)

  if (isLoading) return <p className="text-gray-400">Loading…</p>

  const items = (filterOutstanding ? data?.outstanding_items : data?.all_items) || []
  const filtered = items.filter((item: any) =>
    (item.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.mobile || '').includes(search)
  )

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatBox label="Total Debtors" value={data?.total_debtors ?? 0} color="blue" />
        <StatBox label="Total Owed Balance" value={fmtCurrency(data?.total_outstanding ?? 0)} color="red" />
      </div>

      <div className="card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search customer by name/phone..."
            className="input pl-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="filter-outstanding-debtors"
            checked={filterOutstanding}
            onChange={(e) => setFilterOutstanding(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="filter-outstanding-debtors" className="text-sm font-semibold text-gray-700 dark:text-gray-300 select-none cursor-pointer">
            Show Outstanding Balance Only
          </label>
        </div>
      </div>

      <div className="card">
        <div className="table-container border-0 rounded-none">
          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Total Sales</th>
                <th>Total Paid</th>
                <th>Outstanding Balance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r: any) => (
                <tr key={r.customer_id}>
                  <td className="font-semibold dark:text-white">{r.customer_name}</td>
                  <td>{r.mobile}</td>
                  <td>{r.email}</td>
                  <td>{fmtCurrency(r.total_sales)}</td>
                  <td>{fmtCurrency(r.total_paid)}</td>
                  <td className={`font-bold ${r.total_due > 0 ? 'text-red-500' : 'text-gray-500'}`}>{fmtCurrency(r.total_due)}</td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    No debtors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Vehicle Expenses Report ───────────────────────────────────────────────

function VehicleExpensesReport() {
  const { data, isLoading } = useQuery({
    queryKey: ['report-vehicle-expenses'],
    queryFn: () => reportService.vehicleExpenses(),
  })
  const [search, setSearch] = useState('')

  if (isLoading) return <p className="text-gray-400">Loading…</p>

  const filtered = (data?.all_items || []).filter((item: any) =>
    (item.vehicle_no || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.expense_type || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.notes || '').toLowerCase().includes(search.toLowerCase())
  )

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox label="Total Fuel Expenses" value={fmtCurrency(data?.total_fuel ?? 0)} color="yellow" />
        <StatBox label="Total Maintenance" value={fmtCurrency(data?.total_maintenance ?? 0)} color="blue" />
        <StatBox label="Total Other Expenses" value={fmtCurrency(data?.total_others ?? 0)} color="green" />
        <StatBox label="Total Vehicle Expenses" value={fmtCurrency(data?.total_expenses ?? 0)} color="red" />
      </div>

      <div className="card p-4">
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search expenses by vehicle / remarks..."
            className="input pl-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-container border-0 rounded-none">
          <table>
            <thead>
              <tr>
                <th>Vehicle No</th>
                <th>Date</th>
                <th>Category</th>
                <th>Liters</th>
                <th>Bill No</th>
                <th>Notes</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r: any) => (
                <tr key={r.id}>
                  <td className="font-semibold dark:text-white font-mono">{r.vehicle_no}</td>
                  <td>{fmtDate(r.expense_date)}</td>
                  <td className="capitalize">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      r.expense_type === 'fuel' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400' :
                      r.expense_type === 'maintenance' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {r.expense_type}
                    </span>
                  </td>
                  <td>{r.expense_type === 'fuel' ? `${r.liters || '—'} L` : '—'}</td>
                  <td>{r.bill_no || '—'}</td>
                  <td>{r.notes || '—'}</td>
                  <td className="font-bold text-red-500">{fmtCurrency(r.amount)}</td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    No expense records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Daily Wages Report ─────────────────────────────────────────────────────

function DailyWagesReport() {
  const { data, isLoading } = useQuery({
    queryKey: ['report-daily-wages'],
    queryFn: () => reportService.dailyWages(),
  })
  const [search, setSearch] = useState('')

  if (isLoading) return <p className="text-gray-400">Loading…</p>

  const filtered = (data?.all_items || []).filter((item: any) =>
    (item.staff_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.payment_period || '').includes(search)
  )

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatBox label="Total Daily Wages Paid" value={fmtCurrency(data?.total_daily_wages ?? 0)} color="blue" />
        <StatBox label="Wages Payout Logs Count" value={data?.all_items?.length ?? 0} color="green" />
      </div>

      <div className="card p-4">
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search daily wages by employee name..."
            className="input pl-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-container border-0 rounded-none">
          <table>
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Payment Date</th>
                <th>Wages Date / Period</th>
                <th>Notes</th>
                <th>Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r: any) => (
                <tr key={r.id}>
                  <td className="font-semibold dark:text-white">{r.staff_name}</td>
                  <td>{fmtDate(r.payment_date)}</td>
                  <td>{r.payment_period}</td>
                  <td>{r.notes || '—'}</td>
                  <td className="font-bold text-green-600 dark:text-green-400">{fmtCurrency(r.amount)}</td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    No daily wages records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Monthly Salaries Report ────────────────────────────────────────────────

function MonthlySalariesReport() {
  const { data, isLoading } = useQuery({
    queryKey: ['report-monthly-salaries'],
    queryFn: () => reportService.monthlySalaries(),
  })
  const [search, setSearch] = useState('')

  if (isLoading) return <p className="text-gray-400">Loading…</p>

  const filtered = (data?.all_items || []).filter((item: any) =>
    (item.staff_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.payment_period || '').includes(search)
  )

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatBox label="Total Monthly Salary Paid" value={fmtCurrency(data?.total_monthly_salaries ?? 0)} color="blue" />
        <StatBox label="Salaries Paid Count" value={data?.all_items?.length ?? 0} color="green" />
      </div>

      <div className="card p-4">
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search monthly salaries by employee name..."
            className="input pl-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-container border-0 rounded-none">
          <table>
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Payment Date</th>
                <th>Salary Month / Period</th>
                <th>Notes</th>
                <th>Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r: any) => (
                <tr key={r.id}>
                  <td className="font-semibold dark:text-white">{r.staff_name}</td>
                  <td>{fmtDate(r.payment_date)}</td>
                  <td>{r.payment_period}</td>
                  <td>{r.notes || '—'}</td>
                  <td className="font-bold text-green-600 dark:text-green-400">{fmtCurrency(r.amount)}</td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    No monthly salaries records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────

function StatBox({ label, value, color = 'blue' }: { label: string; value: string | number; color?: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
  }
  return (
    <div className="card p-5">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colors[color] ?? colors.blue}`}>{value}</p>
    </div>
  )
}
