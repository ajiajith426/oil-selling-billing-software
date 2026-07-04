import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { customerService } from '@/services/customer.service'
import { Customer } from '@/types'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Pagination from '@/components/ui/Pagination'
import { TableSkeleton } from '@/components/ui/LoadingSkeleton'
import { useDebounce } from '@/hooks/useDebounce'

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

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, debouncedSearch],
    queryFn: () => customerService.list({ skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE, search: debouncedSearch || undefined }),
  })

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
              <tr><th>#</th><th>Name</th><th>Mobile</th><th>Email</th><th>City</th><th>GST</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {isLoading ? <TableSkeleton cols={7} /> : data?.items.map((c, i) => (
                <tr key={c.id}>
                  <td className="text-gray-400">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="font-medium dark:text-white">{c.name}</td>
                  <td>{c.mobile || '—'}</td>
                  <td>{c.email || '—'}</td>
                  <td>{c.city || '—'}</td>
                  <td className="font-mono text-xs">{c.gst_number || '—'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn-outline py-1 px-2" onClick={() => { setEditing(c); setModalOpen(true) }}><Pencil size={14} /></button>
                      <button className="btn-danger py-1 px-2" onClick={() => setDeleteId(c.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !data?.items.length && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No customers found</td></tr>
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
    </div>
  )
}
