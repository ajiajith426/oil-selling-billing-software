import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { Plus, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { Combobox } from '@/components/ui/Combobox'
import { stockService } from '@/services/stock.service'
import { productService } from '@/services/product.service'
import { StockMovement } from '@/types'
import Modal from '@/components/ui/Modal'
import Pagination from '@/components/ui/Pagination'
import { TableSkeleton } from '@/components/ui/LoadingSkeleton'
import { fmtDateTime } from '@/utils/format'

const PAGE_SIZE = 15

const movementColors: Record<string, string> = {
  stock_in: 'badge-green',
  purchase: 'badge-green',
  return_in: 'badge-green',
  stock_out: 'badge-red',
  sale: 'badge-red',
  return_out: 'badge-red',
  adjustment: 'badge-yellow',
}

export default function StockPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState<'movements' | 'lowstock'>('movements')
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['stock-movements', page],
    queryFn: () => stockService.movements({ skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE }),
  })

  const { data: lowStock, isLoading: isLowStockLoading } = useQuery({
    queryKey: ['low-stock-page'],
    queryFn: productService.lowStock,
  })
  const lowStockCount = lowStock?.length ?? 0

  const { data: productsData } = useQuery({
    queryKey: ['products-all'],
    queryFn: () => productService.list({ limit: 500, is_active: true }),
  })
  const products = productsData?.items ?? []

  const { control, register, handleSubmit, reset, setValue, formState: { errors } } = useForm<{
    product_id: number; movement_type: string; quantity: number; notes: string
  }>()

  const openAdjustmentForProduct = (prodId: number) => {
    reset()
    setValue('product_id', prodId)
    setModalOpen(true)
  }

  const adjust = useMutation({
    mutationFn: stockService.adjust,
    onSuccess: () => {
      toast.success('Stock adjusted')
      qc.invalidateQueries({ queryKey: ['stock-movements'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      setModalOpen(false)
      reset()
    },
  })

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold dark:text-white">Stock Management</h1>
          <p className="text-sm text-gray-500">Track stock movements and adjustments</p>
        </div>
        <button className="btn-primary" onClick={() => { reset(); setModalOpen(true) }}><Plus size={16} /> Adjust Stock</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit flex-wrap">
        <button
          onClick={() => setActiveTab('movements')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'movements'
              ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Stock Movements
        </button>
        <button
          onClick={() => setActiveTab('lowstock')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'lowstock'
              ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Low Stock Alerts
          {lowStockCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 animate-pulse">
              {lowStockCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'movements' && (
        <div className="space-y-4 animate-fadeIn">
          <LowStockAlert />

          <div className="card">
            <div className="table-container border-0 rounded-none">
              <table>
                <thead>
                  <tr>
                    <th>Product</th><th>Type</th><th>Qty</th>
                    <th>Before</th><th>After</th><th>Ref</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? <TableSkeleton cols={7} /> : data?.items.map((m: StockMovement) => (
                    <tr key={m.id}>
                      <td className="font-medium dark:text-white">{m.product_name}</td>
                      <td><span className={movementColors[m.movement_type] ?? 'badge-gray'}>{m.movement_type.replace('_', ' ')}</span></td>
                      <td className={['sale', 'stock_out', 'return_out'].includes(m.movement_type) ? 'text-red-500 font-semibold' : 'text-green-600 font-semibold'}>
                        {['sale', 'stock_out', 'return_out'].includes(m.movement_type) ? '-' : '+'}{m.quantity}
                      </td>
                      <td className="text-gray-500">{m.stock_before}</td>
                      <td className="font-medium dark:text-white">{m.stock_after}</td>
                      <td className="text-xs text-gray-400">{m.reference_type && `${m.reference_type} #${m.reference_id}`}</td>
                      <td className="text-gray-500 text-xs">{fmtDateTime(m.created_at)}</td>
                    </tr>
                  ))}
                  {!isLoading && !data?.items.length && (
                    <tr><td colSpan={7} className="text-center py-12 text-gray-400">No stock movements found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={page} total={data?.total ?? 0} pageSize={PAGE_SIZE} onChange={setPage} />
          </div>
        </div>
      )}

      {activeTab === 'lowstock' && (
        <div className="card animate-fadeIn">
          <div className="table-container border-0 rounded-none">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Min Stock Limit</th>
                  <th>Current Stock</th>
                  <th>Unit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLowStockLoading ? <TableSkeleton cols={7} /> : lowStock?.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium dark:text-white">{p.name}</td>
                    <td className="font-mono text-xs">{p.sku || '—'}</td>
                    <td>{p.minimum_stock}</td>
                    <td className="font-bold text-red-500">{p.current_stock}</td>
                    <td>{p.unit}</td>
                    <td>
                      <span className="badge-red text-[11px] px-2 py-0.5 rounded-full font-semibold">
                        Low Stock
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => openAdjustmentForProduct(p.id)}
                        className="btn-primary text-xs py-1 px-2.5 flex items-center gap-1.5"
                      >
                        <RefreshCw size={12} /> Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))}
                {!isLowStockLoading && !lowStock?.length && (
                  <tr><td colSpan={7} className="text-center py-12 text-green-600 font-semibold dark:text-green-400">✅ All products stock levels are healthy!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); reset() }} title="Stock Adjustment">
        <form onSubmit={handleSubmit((d) => adjust.mutate({ ...d, product_id: Number(d.product_id), quantity: Number(d.quantity) }))} className="space-y-4">
          <div>
            <label className="label">Product *</label>
            <Controller
              control={control}
              name="product_id"
              rules={{ required: 'Product is required' }}
              render={({ field }) => (
                <Combobox
                  placeholder="Select product"
                  searchPlaceholder="Search product..."
                  emptyMessage="No product found."
                  options={products.map((p) => ({
                    value: p.id,
                    label: `${p.name} (Stock: ${p.current_stock} ${p.unit})`
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.product_id && <p className="text-xs text-red-500 mt-1">{errors.product_id.message}</p>}
          </div>
          <div>
            <label className="label">Movement Type *</label>
            <Controller
              control={control}
              name="movement_type"
              rules={{ required: 'Movement type is required' }}
              render={({ field }) => (
                <Combobox
                  placeholder="Select type"
                  options={[
                    { value: 'stock_in', label: 'Stock In' },
                    { value: 'stock_out', label: 'Stock Out' },
                    { value: 'adjustment', label: 'Adjustment (Add)' }
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <div>
            <label className="label">Quantity *</label>
            <input type="number" step="0.01" min="0.01" className="input"
              {...register('quantity', { required: 'Quantity is required', valueAsNumber: true, min: 0.01 })} />
            {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity.message}</p>}
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={2} {...register('notes')} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn-secondary" onClick={() => { setModalOpen(false); reset() }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={adjust.isPending}>
              {adjust.isPending ? 'Saving…' : 'Adjust Stock'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function LowStockAlert() {
  const { data: lowStock } = useQuery({
    queryKey: ['low-stock'],
    queryFn: productService.lowStock,
  })

  if (!lowStock?.length) return null

  return (
    <div className="card p-4 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/10">
      <p className="font-semibold text-orange-700 dark:text-orange-400 mb-2">
        ⚠️ {lowStock.length} product(s) are low on stock
      </p>
      <div className="flex flex-wrap gap-2">
        {lowStock.slice(0, 8).map((p) => (
          <span key={p.id} className="badge-yellow">
            {p.name}: {p.current_stock} {p.unit}
          </span>
        ))}
        {lowStock.length > 8 && <span className="badge-gray">+{lowStock.length - 8} more</span>}
      </div>
    </div>
  )
}
