import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Eye } from 'lucide-react'
import { purchaseService } from '@/services/purchase.service'
import Pagination from '@/components/ui/Pagination'
import { TableSkeleton } from '@/components/ui/LoadingSkeleton'
import { fmtCurrency, fmtDate } from '@/utils/format'

const PAGE_SIZE = 15

const statusColors: Record<string, string> = {
  received: 'badge-green',
  pending: 'badge-yellow',
  cancelled: 'badge-red',
}

export default function PurchasesPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['purchases', page],
    queryFn: () => purchaseService.list({ skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE }),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold dark:text-white">Purchases</h1>
          <p className="text-sm text-gray-500">Track all purchase invoices</p>
        </div>
        <Link to="/purchases/new" className="btn-primary"><Plus size={16} /> New Purchase</Link>
      </div>

      <div className="card">
        <div className="table-container border-0 rounded-none">
          <table>
            <thead>
              <tr>
                <th>Invoice</th><th>Supplier</th><th>Date</th>
                <th>Total</th><th>Paid</th><th>Due</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <TableSkeleton cols={8} /> : data?.items.map((p) => (
                <tr key={p.id}>
                  <td className="font-mono text-xs font-semibold">{p.invoice_number}</td>
                  <td>{p.supplier_name || 'Walk-in'}</td>
                  <td className="text-gray-500">{fmtDate(p.purchase_date)}</td>
                  <td className="font-semibold">{fmtCurrency(p.grand_total)}</td>
                  <td className="text-green-600">{fmtCurrency(p.paid_amount)}</td>
                  <td className={p.due_amount > 0 ? 'text-red-500 font-semibold' : ''}>{fmtCurrency(p.due_amount)}</td>
                  <td><span className={statusColors[p.status] ?? 'badge-gray'}>{p.status}</span></td>
                  <td>
                    <Link to={`/purchases/${p.id}`} className="btn-outline py-1 px-2"><Eye size={14} /></Link>
                  </td>
                </tr>
              ))}
              {!isLoading && !data?.items.length && (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No purchases found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={data?.total ?? 0} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>
    </div>
  )
}
