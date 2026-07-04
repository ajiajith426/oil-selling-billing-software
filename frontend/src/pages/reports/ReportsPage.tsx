import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart2, TrendingUp, Package, FileText, DollarSign } from 'lucide-react'
import { reportService } from '@/services/report.service'
import { fmtCurrency, today, monthStart } from '@/utils/format'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

type ReportTab = 'sales' | 'purchases' | 'stock' | 'gst' | 'profit'

export default function ReportsPage() {
  const [tab, setTab] = useState<ReportTab>('sales')
  const [fromDate, setFromDate] = useState(monthStart())
  const [toDate, setToDate] = useState(today())

  const tabs = [
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'purchases', label: 'Purchases', icon: BarChart2 },
    { id: 'stock', label: 'Stock', icon: Package },
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

      {/* Date range (not for stock) */}
      {tab !== 'stock' && (
        <div className="card p-4 flex items-end gap-4 flex-wrap">
          <div>
            <label className="label">From Date</label>
            <input type="date" className="input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div>
            <label className="label">To Date</label>
            <input type="date" className="input" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </div>
      )}

      {/* Report panels */}
      {tab === 'sales' && <SalesReport from={fromDate} to={toDate} />}
      {tab === 'purchases' && <PurchaseReport from={fromDate} to={toDate} />}
      {tab === 'stock' && <StockReport />}
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
