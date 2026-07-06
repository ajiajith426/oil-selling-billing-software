import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart2, TrendingUp, Package, FileText, DollarSign, Users, Truck } from 'lucide-react'
import { reportService } from '@/services/report.service'
import { fmtCurrency, today, monthStart } from '@/utils/format'
import { DateRangePicker } from '@/components/ui/DateRangePicker'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

type ReportTab = 'sales' | 'purchases' | 'stock' | 'creditors' | 'debtors' | 'vehiclexpenses' | 'dailywages' | 'monthlysalaries' | 'profit'

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
    { id: 'profit', label: 'Profit & Loss', icon: DollarSign },
  ] as const

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold dark:text-white">Reports</h1>
        <p className="text-sm text-gray-500">Business insights and analytics</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit flex-wrap">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id as ReportTab)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                tab === id
                  ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Date range (not for creditors, debtors) */}
        {tab !== 'creditors' && tab !== 'debtors' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Date Filter:</span>
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
      </div>

      {/* Report panels */}
      {tab === 'sales' && <SalesReport from={fromDate} to={toDate} />}
      {tab === 'purchases' && <PurchaseReport from={fromDate} to={toDate} />}
      {tab === 'stock' && <StockReport />}
      {tab === 'creditors' && <CreditorsReport />}
      {tab === 'debtors' && <DebtorsReport />}
      {tab === 'vehiclexpenses' && <VehicleExpensesReport from={fromDate} to={toDate} />}
      {tab === 'dailywages' && <DailyWagesReport from={fromDate} to={toDate} />}
      {tab === 'monthlysalaries' && <MonthlySalariesReport from={fromDate} to={toDate} />}
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
    <div className="space-y-4 animate-fadeIn">
      {isLoading ? <p className="text-gray-400">Loading…</p> : (
        <>
          <div className="flex justify-between items-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 mr-4">
              <StatBox label="Total Bills" value={data?.total_bills ?? 0} />
              <StatBox label="Total Sales" value={fmtCurrency(data?.total_sales ?? 0)} />
              <StatBox label="Total Tax" value={fmtCurrency(data?.total_tax ?? 0)} />
              <StatBox label="Total Discount" value={fmtCurrency(data?.total_discount ?? 0)} />
            </div>
            <button
              onClick={() => {
                const headers = ['Product', 'Qty Sold', 'Revenue (Rs.)', 'Tax (Rs.)']
                const rows = (data?.product_wise || []).map((r: any) => [r.product, r.qty, r.revenue, r.tax])
                downloadCsv(headers, rows, `sales_report_${from}_to_${to}.csv`)
              }}
              className="btn-primary flex items-center gap-1.5 self-start py-2.5 px-4 shadow-md text-xs font-semibold"
            >
              Download Report
            </button>
          </div>

          <div className="card">
            <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold dark:text-white text-sm">Product-wise Sales Details</h3>
            </div>
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
    <div className="space-y-4">
      {isLoading ? <p className="text-gray-400">Loading…</p> : (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => {
                const headers = ['Metric', 'Value']
                const rows = [
                  ['Total Purchases Count', data?.total_purchases ?? 0],
                  ['Total Amount (Rs.)', data?.total_amount ?? 0],
                  ['Total Tax (Rs.)', data?.total_tax ?? 0]
                ]
                downloadCsv(headers, rows, `purchases_report_${from}_to_${to}.csv`)
              }}
              className="btn-primary text-xs py-2 px-3 shadow"
            >
              Download Report
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatBox label="Total Purchases" value={data?.total_purchases ?? 0} />
            <StatBox label="Total Amount" value={fmtCurrency(data?.total_amount ?? 0)} />
            <StatBox label="Total Tax" value={fmtCurrency(data?.total_tax ?? 0)} />
          </div>
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
          <div className="flex justify-between items-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 mr-4">
              <StatBox label="Total Products" value={data?.total_products ?? 0} />
              <StatBox label="In Stock" value={data?.in_stock_count ?? 0} color="green" />
              <StatBox label="Low Stock" value={data?.low_stock_count ?? 0} color="yellow" />
              <StatBox label="Out of Stock" value={data?.out_of_stock_count ?? 0} color="red" />
            </div>
            <button
              onClick={() => {
                const headers = ['Product', 'Current Stock', 'Minimum Stock', 'Unit']
                const rows = (data?.low_stock_items || []).map((p: any) => [p.name, p.current_stock, p.minimum_stock, p.unit])
                downloadCsv(headers, rows, `low_stock_items.csv`)
              }}
              className="btn-primary text-xs py-2.5 px-4 shadow self-start"
            >
              Download Report
            </button>
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

// GST Report removed

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
        <div className="flex gap-2 items-center flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search supplier by name/phone..."
            className="input pl-4 flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={() => {
              const headers = ['Supplier Name', 'Mobile', 'Email', 'Total Purchases (Rs.)', 'Total Paid (Rs.)', 'Outstanding Balance (Rs.)']
              const rows = filtered.map((r: any) => [r.supplier_name, r.mobile, r.email, r.total_purchases, r.total_paid, r.total_due])
              downloadCsv(headers, rows, 'creditors_report.csv')
            }}
            className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5"
          >
            Download CSV
          </button>
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
        <div className="flex gap-2 items-center flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search customer by name/phone..."
            className="input pl-4 flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={() => {
              const headers = ['Customer Name', 'Mobile', 'Email', 'Total Sales (Rs.)', 'Total Paid (Rs.)', 'Outstanding Balance (Rs.)']
              const rows = filtered.map((r: any) => [r.customer_name, r.mobile, r.email, r.total_sales, r.total_paid, r.total_due])
              downloadCsv(headers, rows, 'debtors_report.csv')
            }}
            className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5"
          >
            Download CSV
          </button>
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

function VehicleExpensesReport({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['report-vehicle-expenses', from, to],
    queryFn: () => reportService.vehicleExpenses(from, to),
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

      <div className="card p-4 flex justify-between items-center">
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search expenses by vehicle / remarks..."
            className="input pl-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => {
            const headers = ['Vehicle No', 'Date', 'Category', 'Liters', 'Bill No', 'Notes', 'Amount (Rs.)']
            const rows = filtered.map((r: any) => [r.vehicle_no, r.expense_date, r.expense_type, r.liters, r.bill_no, r.notes, r.amount])
            downloadCsv(headers, rows, 'vehicle_expenses_report.csv')
          }}
          className="btn-outline text-xs py-2 px-3"
        >
          Download CSV
        </button>
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

function DailyWagesReport({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['report-daily-wages', from, to],
    queryFn: () => reportService.dailyWages(from, to),
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

      <div className="card p-4 flex justify-between items-center">
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search daily wages by employee name..."
            className="input pl-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => {
            const headers = ['Employee Name', 'Payment Date', 'Wages Date / Period', 'Notes', 'Amount Paid (Rs.)']
            const rows = filtered.map((r: any) => [r.staff_name, r.payment_date, r.payment_period, r.notes, r.amount])
            downloadCsv(headers, rows, 'daily_wages_report.csv')
          }}
          className="btn-outline text-xs py-2 px-3"
        >
          Download CSV
        </button>
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

function MonthlySalariesReport({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['report-monthly-salaries', from, to],
    queryFn: () => reportService.monthlySalaries(from, to),
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

      <div className="card p-4 flex justify-between items-center">
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search monthly salaries by employee name..."
            className="input pl-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => {
            const headers = ['Employee Name', 'Payment Date', 'Salary Month / Period', 'Notes', 'Amount Paid (Rs.)']
            const rows = filtered.map((r: any) => [r.staff_name, r.payment_date, r.payment_period, r.notes, r.amount])
            downloadCsv(headers, rows, 'monthly_salaries_report.csv')
          }}
          className="btn-outline text-xs py-2 px-3"
        >
          Download CSV
        </button>
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
    <div className="card p-3 shadow-sm">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-lg font-extrabold mt-0.5 ${colors[color] ?? colors.blue}`}>{value}</p>
    </div>
  )
}

function downloadCsv(headers: string[], rows: any[][], filename: string) {
  const csvContent = [
    headers.map(h => `"${h.replace(/'/g, "''").replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => row.map(val => {
      const str = String(val ?? '').replace(/"/g, '""')
      return `"${str}"`
    }).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
