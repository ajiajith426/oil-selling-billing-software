import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { Combobox } from '@/components/ui/Combobox'
import { categoryService } from '@/services/category.service'
import { SubCategory } from '@/types'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Pagination from '@/components/ui/Pagination'
import { TableSkeleton } from '@/components/ui/LoadingSkeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { fmtDate } from '@/utils/format'

const PAGE_SIZE = 10

export default function SubCategoriesPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editing, setEditing] = useState<SubCategory | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['subcategories', page, debouncedSearch],
    queryFn: () => categoryService.listSub({ skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE, search: debouncedSearch || undefined }),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories-all'],
    queryFn: () => categoryService.list({ limit: 200, is_active: true }),
  })
  const categories = categoriesData?.items ?? []

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<Partial<SubCategory>>()

  const upsert = useMutation({
    mutationFn: (d: Partial<SubCategory>) =>
      editing ? categoryService.updateSub(editing.id, d) : categoryService.createSub(d),
    onSuccess: () => {
      toast.success(editing ? 'Updated' : 'Created')
      qc.invalidateQueries({ queryKey: ['subcategories'] })
      closeModal()
    },
  })

  const destroy = useMutation({
    mutationFn: (id: number) => categoryService.deleteSub(id),
    onSuccess: () => {
      toast.success('Deleted')
      qc.invalidateQueries({ queryKey: ['subcategories'] })
      setDeleteId(null)
    },
  })

  const openCreate = () => { setEditing(null); reset({ name: '', description: '', is_active: true }); setModalOpen(true) }
  const openEdit = (s: SubCategory) => { setEditing(s); reset(s); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null); reset() }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold dark:text-white">Sub Categories</h1>
          <p className="text-sm text-gray-500">Manage product sub categories</p>
        </div>
        <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Add Sub Category</button>
      </div>

      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search…" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </div>
      </div>

      <div className="card">
        <div className="table-container border-0 rounded-none">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Name</th><th>Category</th><th>Description</th><th>Status</th><th>Created</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <TableSkeleton cols={7} /> : data?.items.map((s, i) => (
                <tr key={s.id}>
                  <td className="text-gray-400">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="font-medium dark:text-white">{s.name}</td>
                  <td><span className="badge-blue">{s.category_name || '—'}</span></td>
                  <td className="text-gray-500 max-w-xs truncate">{s.description || '—'}</td>
                  <td><span className={s.is_active ? 'badge-green' : 'badge-red'}>{s.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td className="text-gray-500">{fmtDate(s.created_at)}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn-outline py-1 px-2" onClick={() => openEdit(s)}><Pencil size={14} /></button>
                      <button className="btn-danger py-1 px-2" onClick={() => setDeleteId(s.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !data?.items.length && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No sub categories found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={data?.total ?? 0} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Sub Category' : 'Add Sub Category'}>
        <form onSubmit={handleSubmit((d) => upsert.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Category *</label>
            <Controller
              control={control}
              name="category_id"
              rules={{ required: 'Category is required' }}
              render={({ field }) => (
                <Combobox
                  placeholder="Select category"
                  searchPlaceholder="Search category..."
                  emptyMessage="No category found."
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  value={field.value}
                  onChange={(val) => field.onChange(Number(val))}
                />
              )}
            />
            {errors.category_id && <p className="text-xs text-red-500 mt-1">{errors.category_id.message}</p>}
          </div>
          <div>
            <label className="label">Name *</label>
            <input className="input" placeholder="Sub category name" {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={2} {...register('description')} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="sub-active" {...register('is_active')} className="rounded" />
            <label htmlFor="sub-active" className="text-sm dark:text-gray-300">Active</label>
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
        message="Delete this sub category?"
        loading={destroy.isPending}
      />
    </div>
  )
}
