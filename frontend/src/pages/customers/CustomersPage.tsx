import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, Search, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { customerService } from '@/services/customer.service'
import { saleService } from '@/services/sale.service'
import { Customer, Sale } from '@/types'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Pagination from '@/components/ui/Pagination'
import { TableSkeleton } from '@/components/ui/LoadingSkeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { fmtCurrency, fmtDateTime } from '@/utils/format'

const PAGE_SIZE = 15

function CustomerForm({ onSubmit, loading, initial }: {
  onSubmit: (d: Partial<Customer>) => void
  loading: boolean
  initial?: Customer | null
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<Partial<Customer>>({ defaultValues: initial ?? {} })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Full Name *</label>
          <input className="input" {...register('name', { required: 'Name is required' })} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">Mobile</label>
          <input className="input" type="tel" {...register('mobile')} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" {...register('email')} />
        </div>
        <div>
          <label className="label">GST Number</label>
          <input className="input" placeholder="22AAAAA0000A1Z5" {...register('gst_number')} />
        </div>
        <div>
          <label className="label">City</label>
          <input className="input" {...register('city')} />
        </div>
        <div>
          <label className="label">State</label>
          <input className="input" {...register('state')} />
        </div>
        <div>
          <label className="label">Pincode</label>
          <input className="input" {...register('pincode')} />
        </div>
        <div className="col-span-2">
          <label className="label">Address</label>
          <textarea className="input" rows={2} {...register('address')} />
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : initial ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}

export default function CustomersPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [selectedCustDetail, setSelectedCustDetail] = useState<Customer | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, debouncedSearch],
    queryFn: () => customerService.list({ skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE, search: debouncedSearch || undefined }),
  })

  const { data: salesData } = useQuery({
    queryKey: ['customers-sales-history'],
    queryFn: () => saleService.list({ limit: 1000 }),
  })
  const salesHistory = salesData?.items || []

  const upsert = useMutation({
    mutationFn: (d: Partial<Customer>) =>
      editing ? customerService.update(editing.id, d) : customerService.create(d),
    onSuccess: () => {
      toast.success(editing ? 'Customer updated' : 'Customer created')
      qc.invalidateQueries({ queryKey: ['customers'] })
      setModalOpen(false); setEditing(null)
    },
  })

  const destroy = useMutation({
    mutationFn: (id: number) => customerService.delete(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['customers'] }); setDeleteId(null) },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold dark:text-white">Customers</h1>
          <p className="text-sm text-gray-500">Manage your customers</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true) }}><Plus size={16} /> Add Customer</button>
      </div>

      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search name, mobile, email…" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </div>
      </div>

      <div className="card">
        <div className="table-container border-0 rounded-none">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Total Purchases</th>
                <th>Paid Amount</th>
                <th>Outstanding Credit</th>
                <th>Credit Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <TableSkeleton cols={8} /> : data?.items.map((c, i) => (
                <tr key={c.id}>
                  <td className="text-gray-400">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="font-medium dark:text-white">
                    <p className="font-semibold">{c.name}</p>
                    {c.city && <span className="text-[10px] text-gray-400">{c.city}</span>}
                  </td>
                  <td>{c.mobile || '—'}</td>
                  <td className="font-medium dark:text-gray-200">{fmtCurrency(c.total_sales ?? 0)}</td>
                  <td className="text-emerald-600 dark:text-emerald-400 font-semibold">{fmtCurrency(c.total_paid ?? 0)}</td>
                  <td className="font-semibold text-gray-700 dark:text-gray-300">{fmtCurrency(c.total_due ?? 0)}</td>
                  <td>
                    {(c.total_due ?? 0) > 0 ? (
                      <span className="badge-red text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                        Due: {fmtCurrency(c.total_due ?? 0)}
                      </span>
                    ) : (
                      <span className="badge-green text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                        Clear
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn-outline py-1 px-2" title="View Sales History" onClick={() => setSelectedCustDetail(c)}><Eye size={14} /></button>
                      <button className="btn-outline py-1 px-2" onClick={() => { setEditing(c); setModalOpen(true) }}><Pencil size={14} /></button>
                      <button className="btn-danger py-1 px-2" onClick={() => setDeleteId(c.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !data?.items.length && (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No customers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={data?.total ?? 0} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }}
        title={editing ? 'Edit Customer' : 'Add Customer'} size="lg">
        <CustomerForm onSubmit={(d) => upsert.mutate(d)} loading={upsert.isPending} initial={editing} />
      </Modal>

      <ConfirmDialog open={deleteId !== null} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && destroy.mutate(deleteId)}
        message="Delete this customer?" loading={destroy.isPending} />

      {/* Customer Sales History & Balance Modal */}
      <Modal
        open={!!selectedCustDetail}
        onClose={() => setSelectedCustDetail(null)}
        title={`Customer Ledger: ${selectedCustDetail?.name}`}
        size="lg"
      >
        {selectedCustDetail && (
          <div className="space-y-6">
            {/* Balance Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
              <div className="card p-4 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/50">
                <p className="text-xs text-gray-500 font-medium dark:text-gray-400">Total Purchase Value</p>
                <p className="text-xl font-bold mt-1 text-blue-600 dark:text-blue-400 font-mono">
                  {fmtCurrency(selectedCustDetail.total_sales ?? 0)}
                </p>
              </div>
              <div className="card p-4 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/50">
                <p className="text-xs text-gray-500 font-medium dark:text-gray-400">Total Paid Amount</p>
                <p className="text-xl font-bold mt-1 text-emerald-600 dark:text-emerald-400 font-mono">
                  {fmtCurrency(selectedCustDetail.total_paid ?? 0)}
                </p>
              </div>
              <div className="card p-4 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/50">
                <p className="text-xs text-gray-500 font-medium dark:text-gray-400">Outstanding Balance Due</p>
                <p className="text-xl font-bold mt-1 text-red-600 dark:text-red-400 font-mono font-bold animate-pulse">
                  {fmtCurrency(selectedCustDetail.total_due ?? 0)}
                </p>
              </div>
            </div>

            {/* Profile Info Row */}
            <div className="card p-4 bg-gray-50 dark:bg-gray-800 text-xs grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
              <div>
                <p className="text-gray-400 font-medium">Mobile</p>
                <p className="font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{selectedCustDetail.mobile || '—'}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">GST Number</p>
                <p className="font-semibold text-gray-700 dark:text-gray-200 mt-0.5 font-mono">{selectedCustDetail.gst_number || '—'}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">City</p>
                <p className="font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{selectedCustDetail.city || '—'}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Address</p>
                <p className="font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{selectedCustDetail.address || '—'}</p>
              </div>
            </div>

            {/* Sales List */}
            <div className="space-y-2 animate-fadeIn">
              <h3 className="text-sm font-bold dark:text-white">Purchase & Invoice History</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Invoice No</th>
                      <th>Date</th>
                      <th>Total Amt</th>
                      <th>Paid Amt</th>
                      <th>Owed Due</th>
                      <th>Payment Mode</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesHistory
                      .filter((s: Sale) => s.customer_id === selectedCustDetail.id)
                      .map((s: Sale) => {
                        const due = s.grand_total - s.paid_amount;
                        return (
                          <tr key={s.id}>
                            <td className="font-mono text-xs font-semibold">{s.invoice_number}</td>
                            <td className="text-gray-500 text-xs">{fmtDateTime(s.sale_date)}</td>
                            <td className="font-medium">{fmtCurrency(s.grand_total)}</td>
                            <td className="text-emerald-600 dark:text-emerald-400 font-semibold">{fmtCurrency(s.paid_amount)}</td>
                            <td className={`font-semibold ${due > 0 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                              {fmtCurrency(due > 0 ? due : 0)}
                            </td>
                            <td className="capitalize text-xs">{s.payment_method}</td>
                            <td>
                              <span className={`badge-${s.status === 'completed' ? 'green' : 'red'} text-[10px] font-bold`}>
                                {s.status}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    {!salesHistory.filter((s: Sale) => s.customer_id === selectedCustDetail.id).length && (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-400">
                          No purchases registered yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
