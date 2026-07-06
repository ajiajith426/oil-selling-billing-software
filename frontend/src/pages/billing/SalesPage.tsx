import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { XCircle, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { saleService } from '@/services/sale.service'
import { Sale } from '@/types'
import Pagination from '@/components/ui/Pagination'
import { TableSkeleton } from '@/components/ui/LoadingSkeleton'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { fmtCurrency, fmtDateTime } from '@/utils/format'

const PAGE_SIZE = 15

const statusColors: Record<string, string> = {
  completed: 'badge-green',
  cancelled: 'badge-red',
  refunded: 'badge-yellow',
}

export default function SalesPage() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [cancelId, setCancelId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['sales', page],
    queryFn: () => saleService.list({ skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE }),
  })

  const cancel = useMutation({
    mutationFn: (id: number) => saleService.cancel(id),
    onSuccess: () => {
      toast.success('Sale cancelled — stock restored')
      qc.invalidateQueries({ queryKey: ['sales'] })
      setCancelId(null)
    },
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold dark:text-white">Sales History</h1>
        <p className="text-sm text-gray-500">View all completed bills</p>
      </div>

      <div className="card">
        <div className="table-container border-0 rounded-none">
          <table>
            <thead>
              <tr>
                <th>Invoice</th><th>Customer</th><th>Date & Time</th>
                <th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <TableSkeleton cols={8} /> : data?.items.map((s) => (
                <tr key={s.id}>
                  <td className="font-mono text-xs font-semibold">{s.invoice_number}</td>
                  <td>{s.customer_name || 'Walk-in'}</td>
                  <td className="text-gray-500 text-xs">{fmtDateTime(s.sale_date)}</td>
                  <td className="text-gray-500">{s.items.length} items</td>
                  <td className="font-semibold">{fmtCurrency(s.grand_total)}</td>
                  <td><span className="badge-gray capitalize">{s.payment_method}</span></td>
                  <td><span className={statusColors[s.status] ?? 'badge-gray'}>{s.status}</span></td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn-outline py-1 px-2" onClick={() => navigate(`/sales/${s.id}`)}>
                        <Eye size={14} />
                      </button>
                      {s.status === 'completed' && (
                        <button className="btn-danger py-1 px-2" onClick={() => setCancelId(s.id)}>
                          <XCircle size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !data?.items.length && (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No sales found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={data?.total ?? 0} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>

      {/* Detail Modal removed, now navigates to SaleDetailPage */}

      <ConfirmDialog
        open={cancelId !== null}
        onClose={() => setCancelId(null)}
        onConfirm={() => cancelId && cancel.mutate(cancelId)}
        title="Cancel Sale"
        message="Cancel this sale? Stock will be restored to inventory."
        loading={cancel.isPending}
      />
    </div>
  )
}
