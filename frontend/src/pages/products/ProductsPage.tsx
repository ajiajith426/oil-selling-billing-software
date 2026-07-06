import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { Plus, Pencil, Trash2, Search, Download, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Combobox } from '@/components/ui/Combobox'
import { productService } from '@/services/product.service'
import { categoryService } from '@/services/category.service'
import { Product } from '@/types'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Pagination from '@/components/ui/Pagination'
import { TableSkeleton } from '@/components/ui/LoadingSkeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { fmtCurrency, fmtDate } from '@/utils/format'

const PAGE_SIZE = 15

export default function ProductsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editing, setEditing] = useState<Product | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, debouncedSearch],
    queryFn: () => productService.list({ skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE, search: debouncedSearch || undefined }),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories-all'],
    queryFn: () => categoryService.list({ limit: 200, is_active: true }),
  })
  const categories = categoriesData?.items ?? []

  const { control, register, handleSubmit, reset, watch, formState: { errors } } = useForm<Partial<Product>>()
  const selectedCat = watch('category_id')

  const { data: subCatData } = useQuery({
    queryKey: ['subcategories-by-cat', selectedCat],
    queryFn: () => categoryService.listSub({ category_id: selectedCat, limit: 200 }),
    enabled: !!selectedCat,
  })
  const subcategories = subCatData?.items ?? []

  const upsert = useMutation({
    mutationFn: (d: Partial<Product>) =>
      editing ? productService.update(editing.id, d) : productService.create(d),
    onSuccess: () => {
      toast.success(editing ? 'Product updated' : 'Product created')
      qc.invalidateQueries({ queryKey: ['products'] })
      closeModal()
    },
  })

  const destroy = useMutation({
    mutationFn: (id: number) => productService.delete(id),
    onSuccess: () => {
      toast.success('Deleted')
      qc.invalidateQueries({ queryKey: ['products'] })
      setDeleteId(null)
    },
  })

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', unit: 'Pcs', gst_percent: 0, purchase_price: 0, selling_price: 0, minimum_stock: 0, current_stock: 0, is_active: true })
    setModalOpen(true)
  }
  const openEdit = (p: Product) => { setEditing(p); reset(p); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null); reset() }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold dark:text-white">Products</h1>
          <p className="text-sm text-gray-500">Manage your inventory</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline" onClick={() => productService.exportCsv()}>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Add Product</button>
        </div>
      </div>

      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search by name, SKU, barcode…" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </div>
      </div>

      <div className="card">
        <div className="table-container border-0 rounded-none">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Name</th><th>SKU</th><th>Category</th>
                <th>Purchase Price</th><th>Selling Price</th><th>Stock</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <TableSkeleton cols={9} /> : data?.items.map((p, i) => (
                <tr key={p.id}>
                  <td className="text-gray-400">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td>
                    <div className="font-medium dark:text-white">{p.name}</div>
                    {p.brand && <div className="text-xs text-gray-400">{p.brand}</div>}
                  </td>
                  <td className="font-mono text-xs text-gray-500">{p.sku || '—'}</td>
                  <td><span className="badge-blue">{p.category_name || '—'}</span></td>
                  <td>{fmtCurrency(p.purchase_price)}</td>
                  <td className="font-semibold">{fmtCurrency(p.selling_price)}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      {p.current_stock <= p.minimum_stock && (
                        <AlertTriangle size={14} className="text-orange-500" />
                      )}
                      <span className={p.current_stock <= 0 ? 'text-red-500 font-semibold' : ''}>
                        {p.current_stock} {p.unit}
                      </span>
                    </div>
                  </td>
                  <td><span className={p.is_active ? 'badge-green' : 'badge-red'}>{p.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn-outline py-1 px-2" onClick={() => openEdit(p)}><Pencil size={14} /></button>
                      <button className="btn-danger py-1 px-2" onClick={() => setDeleteId(p.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !data?.items.length && (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={data?.total ?? 0} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit((d) => upsert.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Product Name *</label>
              <input className="input" placeholder="Product name" {...register('name', { required: 'Name is required' })} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Category</label>
              <Controller
                control={control}
                name="category_id"
                render={({ field }) => (
                  <Combobox
                    placeholder="Select category"
                    searchPlaceholder="Search category..."
                    emptyMessage="No category found."
                    options={[
                      { value: 'none', label: 'Select category' },
                      ...categories.map((c) => ({ value: c.id, label: c.name }))
                    ]}
                    value={field.value ?? 'none'}
                    onChange={(val) => field.onChange(val === 'none' ? undefined : Number(val))}
                  />
                )}
              />
            </div>
            <div>
              <label className="label">Sub Category</label>
              <Controller
                control={control}
                name="subcategory_id"
                render={({ field }) => (
                  <Combobox
                    placeholder="Select sub category"
                    searchPlaceholder="Search subcategory..."
                    emptyMessage="No subcategory found."
                    options={[
                      { value: 'none', label: 'Select sub category' },
                      ...subcategories.map((s) => ({ value: s.id, label: s.name }))
                    ]}
                    value={field.value ?? 'none'}
                    onChange={(val) => field.onChange(val === 'none' ? undefined : Number(val))}
                    disabled={!selectedCat}
                  />
                )}
              />
            </div>
            <div>
              <label className="label">SKU</label>
              <input className="input" placeholder="Stock Keeping Unit" {...register('sku')} />
            </div>
            <div>
              <label className="label">Barcode</label>
              <input className="input" placeholder="Barcode" {...register('barcode')} />
            </div>
            <div>
              <label className="label">Purchase Price (₹)</label>
              <input type="number" step="0.01" className="input" {...register('purchase_price', { valueAsNumber: true })} />
            </div>
            <div>
              <label className="label">Selling Price (₹)</label>
              <input type="number" step="0.01" className="input" {...register('selling_price', { valueAsNumber: true })} />
            </div>
            <div>
              <label className="label">GST (%)</label>
              <input type="number" step="0.01" className="input" {...register('gst_percent', { valueAsNumber: true })} />
            </div>
            <div>
              <label className="label">Unit</label>
              <Controller
                control={control}
                name="unit"
                render={({ field }) => (
                  <Combobox
                    placeholder="Select unit"
                    searchPlaceholder="Search unit..."
                    options={['Kg', 'Pcs', 'Litre', 'Box', 'Bag', 'Dozen', 'Gram', 'Bundle', 'Packet'].map((u) => ({
                      value: u,
                      label: u
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div>
              <label className="label">Minimum Stock</label>
              <input type="number" step="0.01" className="input" {...register('minimum_stock', { valueAsNumber: true })} />
            </div>
            <div>
              <label className="label">Brand</label>
              <input className="input" placeholder="Brand name" {...register('brand')} />
            </div>
            <div className="col-span-2">
              <label className="label">Description</label>
              <textarea className="input" rows={2} {...register('description')} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="prod-active" {...register('is_active')} className="rounded" />
              <label htmlFor="prod-active" className="text-sm dark:text-gray-300">Active</label>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={upsert.isPending}>
              {upsert.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && destroy.mutate(deleteId)}
        message="Delete this product? This cannot be undone."
        loading={destroy.isPending}
      />
    </div>
  )
}
