import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { supplierService } from '@/services/supplier.service'
import { Supplier } from '@/types'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Pagination from '@/components/ui/Pagination'
import { TableSkeleton } from '@/components/ui/LoadingSkeleton'
import { useDebounce } from '@/hooks/useDebounce'

const PAGE_SIZE = 15

export default function SuppliersPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editing, setEditing] = useState<Supplier | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', page, debouncedSearch],
    queryFn: () => supplierService.list({ skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE, search: debouncedSearch || undefined }),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<Supplier>>()

  const upsert = useMutation({
    mutationFn: (d: Partial<Supplier>) =>
      editing ? supplierService.update(editing.id, d) : supplierService.create(d),
    onSuccess: () => {
      toast.success(editing ? 'Supplier updated' : 'Supplier created')
      qc.invalidateQueries({ queryKey: ['suppliers'] })
      setModalOpen(false); setEditing(null); reset()
    },
  })

  const destroy = useMutation({
    mutationFn: (id: number) => supplierService.delete(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['suppliers'] }); setDeleteId(null) },
  })

  const openEdit = (s: Supplier) => { setEditing(s); reset(s); setModalOpen(true) }
  const openCreate = () => { setEditing(null); reset({}); setModalOpen(true) }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold dark:text-white">Suppliers</h1>
          <p className="text-sm text-gray-500">Manage your suppliers</p>
        </div>
        <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Add Supplier</button>
      </div>

      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search name, mobile…" value={search}
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
              {isLoading ? <TableSkeleton cols={7} /> : data?.items.map((s, i) => (
                <tr key={s.id}>
                  <td className="text-gray-400">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="font-medium dark:text-white">{s.name}</td>
                  <td>{s.mobile || '—'}</td>
                  <td>{s.email || '—'}</td>
                  <td>{s.city || '—'}</td>
                  <td className="font-mono text-xs">{s.gst_number || '—'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn-outline py-1 px-2" onClick={() => openEdit(s)}><Pencil size={14} /></button>
                      <button className="btn-danger py-1 px-2" onClick={() => setDeleteId(s.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !data?.items.length && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No suppliers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={data?.total ?? 0} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); reset() }}
        title={editing ? 'Edit Supplier' : 'Add Supplier'} size="lg">
        <form onSubmit={handleSubmit((d) => upsert.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Name *</label>
              <input className="input" {...register('name', { required: 'Name is required' })} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div><label className="label">Mobile</label><input className="input" type="tel" {...register('mobile')} /></div>
            <div><label className="label">Email</label><input className="input" type="email" {...register('email')} /></div>
            <div><label className="label">GST Number</label><input className="input" {...register('gst_number')} /></div>
            <div><label className="label">City</label><input className="input" {...register('city')} /></div>
            <div><label className="label">State</label><input className="input" {...register('state')} /></div>
            <div><label className="label">Pincode</label><input className="input" {...register('pincode')} /></div>
            <div className="col-span-2"><label className="label">Address</label><textarea className="input" rows={2} {...register('address')} /></div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn-secondary" onClick={() => { setModalOpen(false); reset() }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={upsert.isPending}>
              {upsert.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={deleteId !== null} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && destroy.mutate(deleteId)}
        message="Delete this supplier?" loading={destroy.isPending} />
    </div>
  )
}
