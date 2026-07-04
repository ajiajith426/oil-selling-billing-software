import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { XCircle, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { saleService } from '@/services/sale.service'
import { Sale } from '@/types'
import Pagination from '@/components/ui/Pagination'
import { TableSkeleton } from '@/components/ui/LoadingSkeleton'
import Modal from '@/components/ui/Modal'
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
  const [page, setPage] = useState(1)
  const [viewSale, setViewSale] = useState<Sale | null>(null)
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
                      <button className="btn-outline py-1 px-2" onClick={() => setViewSale(s)}>
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

      {/* Sale detail modal */}
      <Modal open={!!viewSale} onClose={() => setViewSale(null)} title={`Invoice: ${viewSale?.invoice_number}`} size="lg">
        {viewSale && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Customer</p>
                <p className="font-medium dark:text-white">{viewSale.customer_name || 'Walk-in'}</p>
              </div>
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium dark:text-white">{fmtDateTime(viewSale.sale_date)}</p>
              </div>
              <div>
                <p className="text-gray-500">Payment</p>
                <p className="font-medium capitalize dark:text-white">{viewSale.payment_method}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <span className={statusColors[viewSale.status]}>{viewSale.status}</span>
              </div>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Product</th><th>Qty</th><th>Price</th><th>GST</th><th>Total</th></tr>
                </thead>
                <tbody>
                  {viewSale.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>{fmtCurrency(item.unit_price)}</td>
                      <td>{fmtCurrency(item.gst_amount)}</td>
                      <td className="font-semibold">{fmtCurrency(item.total_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <div className="space-y-1 text-sm min-w-[200px]">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{fmtCurrency(viewSale.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>{fmtCurrency(viewSale.tax_amount)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Discount</span><span>-{fmtCurrency(viewSale.discount_amount)}</span></div>
                <div className="flex justify-between font-bold text-base border-t pt-1 dark:border-gray-600">
                  <span className="dark:text-white">Total</span>
                  <span className="text-blue-600">{fmtCurrency(viewSale.grand_total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

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
