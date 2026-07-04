import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { categoryService } from '@/services/category.service'
import { Category } from '@/types'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Pagination from '@/components/ui/Pagination'
import { TableSkeleton } from '@/components/ui/LoadingSkeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { fmtDate } from '@/utils/format'

const PAGE_SIZE = 10

export default function CategoriesPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editing, setEditing] = useState<Category | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['categories', page, debouncedSearch],
    queryFn: () => categoryService.list({ skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE, search: debouncedSearch || undefined }),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<Category>>()

  const upsert = useMutation({
    mutationFn: (d: Partial<Category>) =>
      editing ? categoryService.update(editing.id, d) : categoryService.create(d),
    onSuccess: () => {
      toast.success(editing ? 'Category updated' : 'Category created')
      qc.invalidateQueries({ queryKey: ['categories'] })
      closeModal()
    },
  })

  const destroy = useMutation({
    mutationFn: (id: number) => categoryService.delete(id),
    onSuccess: () => {
      toast.success('Deleted')
      qc.invalidateQueries({ queryKey: ['categories'] })
      setDeleteId(null)
    },
  })

  const openCreate = () => { setEditing(null); reset({ name: '', description: '', is_active: true }); setModalOpen(true) }
  const openEdit = (c: Category) => { setEditing(c); reset(c); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null); reset() }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold dark:text-white">Categories</h1>
          <p className="text-sm text-gray-500">Manage product categories</p>
        </div>
        <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Add Category</button>
      </div>

      {/* Search */}
      <div className="card p-4 flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Search categories…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container border-0 rounded-none">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <TableSkeleton cols={6} /> : data?.items.map((c, i) => (
                <tr key={c.id}>
                  <td className="text-gray-400">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="font-medium dark:text-white">{c.name}</td>
                  <td className="max-w-xs truncate text-gray-500">{c.description || '—'}</td>
                  <td>
                    <span className={c.is_active ? 'badge-green' : 'badge-red'}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-gray-500">{fmtDate(c.created_at)}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn-outline py-1 px-2" onClick={() => openEdit(c)}><Pencil size={14} /></button>
                      <button className="btn-danger py-1 px-2" onClick={() => setDeleteId(c.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !data?.items.length && (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No categories found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={data?.total ?? 0} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit((d) => upsert.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input className="input" placeholder="e.g. Lubricants" {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} placeholder="Optional description" {...register('description')} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="cat-active" {...register('is_active')} className="rounded" />
            <label htmlFor="cat-active" className="text-sm dark:text-gray-300">Active</label>
          </div>
          <div className="flex gap-3 justify-end pt-2">
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
        message="Are you sure you want to delete this category? This may affect linked products."
        loading={destroy.isPending}
      />
    </div>
  )
}
