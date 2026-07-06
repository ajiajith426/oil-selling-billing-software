import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { Plus, Pencil, Trash2, Search, Truck, Fuel } from 'lucide-react'
import toast from 'react-hot-toast'
import { Combobox } from '@/components/ui/Combobox'
import { DatePicker } from '@/components/ui/DatePicker'
import { vehicleService } from '@/services/vehicle.service'
import { Vehicle, VehicleExpense } from '@/types'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Pagination from '@/components/ui/Pagination'
import { TableSkeleton } from '@/components/ui/LoadingSkeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { fmtCurrency, fmtDate } from '@/utils/format'

const PAGE_SIZE = 15

// ── Vehicle Form Component ───────────────────────────────────────────────
function VehicleForm({ onSubmit, loading, initial }: {
  onSubmit: (d: Partial<Vehicle>) => void
  loading: boolean
  initial?: Vehicle | null
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<Partial<Vehicle>>({
    defaultValues: initial ?? { is_active: true }
  })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Vehicle Registration Number *</label>
          <input className="input" placeholder="e.g. TN-59-AB-1234" {...register('vehicle_no', { required: 'Registration number is required' })} />
          {errors.vehicle_no && <p className="text-xs text-red-500 mt-1">{errors.vehicle_no.message}</p>}
        </div>
        <div>
          <label className="label">Model *</label>
          <input className="input" placeholder="e.g. Tata Ace" {...register('model', { required: 'Model is required' })} />
          {errors.model && <p className="text-xs text-red-500 mt-1">{errors.model.message}</p>}
        </div>
        <div>
          <label className="label">Type *</label>
          <input className="input" placeholder="e.g. Mini Truck" {...register('type', { required: 'Type is required' })} />
          {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type.message}</p>}
        </div>
        <div className="col-span-2 flex items-center gap-2 pt-2">
          <input type="checkbox" id="is_active_vehicle" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" {...register('is_active')} />
          <label htmlFor="is_active_vehicle" className="text-sm font-semibold text-gray-700 dark:text-gray-300 select-none cursor-pointer">Active</label>
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

// ── Vehicle Expense Form Component ───────────────────────────────────────
function VehicleExpenseForm({ onSubmit, loading, initial, vehicles }: {
  onSubmit: (d: Partial<VehicleExpense>) => void
  loading: boolean
  initial?: VehicleExpense | null
  vehicles: Vehicle[]
}) {
  const { control, register, handleSubmit, watch, formState: { errors } } = useForm<Partial<VehicleExpense>>({
    defaultValues: initial ?? {
      expense_date: new Date().toISOString().split('T')[0],
      expense_type: 'fuel'
    }
  })

  const selectedType = watch('expense_type')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Select Vehicle *</label>
          <Controller
            control={control}
            name="vehicle_id"
            rules={{ required: 'Vehicle is required' }}
            render={({ field }) => (
              <Combobox
                placeholder="Choose Vehicle"
                searchPlaceholder="Search vehicle..."
                emptyMessage="No vehicle found."
                options={vehicles.map(v => ({ value: v.id, label: `${v.vehicle_no} — ${v.model}` }))}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {errors.vehicle_id && <p className="text-xs text-red-500 mt-1">{errors.vehicle_id.message}</p>}
        </div>
        <div>
          <label className="label">Expense Date *</label>
          <Controller
            control={control}
            name="expense_date"
            rules={{ required: 'Date is required' }}
            render={({ field }) => (
              <DatePicker
                placeholder="Pick a date"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {errors.expense_date && <p className="text-xs text-red-500 mt-1">{errors.expense_date.message}</p>}
        </div>
        <div>
          <label className="label">Expense Category *</label>
          <Controller
            control={control}
            name="expense_type"
            rules={{ required: 'Category is required' }}
            render={({ field }) => (
              <Combobox
                placeholder="Choose category"
                options={[
                  { value: 'fuel', label: 'Fuel (Diesel/Petrol)' },
                  { value: 'maintenance', label: 'Maintenance & Repairs' },
                  { value: 'insurance', label: 'Insurance' },
                  { value: 'permit', label: 'Permit / Taxes' },
                  { value: 'other', label: 'Other Expenses' },
                ]}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <div>
          <label className="label">Expense Amount (₹) *</label>
          <input className="input" type="number" step="0.01" {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be greater than 0' } })} />
          {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
        </div>

        {selectedType === 'fuel' && (
          <div>
            <label className="label">Fuel Liters</label>
            <input className="input" type="number" step="0.01" {...register('liters')} />
          </div>
        )}

        <div>
          <label className="label">Bill / Invoice Number</label>
          <input className="input" placeholder="e.g. B-9011" {...register('bill_no')} />
        </div>

        <div className="col-span-2">
          <label className="label">Notes / Remarks</label>
          <textarea className="input" rows={2} placeholder="Enter details..." {...register('notes')} />
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

// ── Main Page Component ──────────────────────────────────────────────────
export default function VehicleManagementPage() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<'vehicles' | 'expenses'>('vehicles')

  // ── State for Vehicles CRUD ──
  const [vPage, setVPage] = useState(1)
  const [vSearch, setVSearch] = useState('')
  const debouncedVSearch = useDebounce(vSearch)
  const [vModalOpen, setVModalOpen] = useState(false)
  const [vEditing, setVEditing] = useState<Vehicle | null>(null)
  const [vDeleteId, setVDeleteId] = useState<number | null>(null)

  // ── State for Expenses CRUD ──
  const [ePage, setEPage] = useState(1)
  const [eSearch, setESearch] = useState('')
  const debouncedESearch = useDebounce(eSearch)
  const [eModalOpen, setEModalOpen] = useState(false)
  const [eEditing, setEEditing] = useState<VehicleExpense | null>(null)
  const [eDeleteId, setEDeleteId] = useState<number | null>(null)

  // ── Queries ──
  const vehiclesQuery = useQuery({
    queryKey: ['vehicles', vPage, debouncedVSearch],
    queryFn: () => vehicleService.list({ skip: (vPage - 1) * PAGE_SIZE, limit: PAGE_SIZE, search: debouncedVSearch || undefined }),
  })

  // Fetch all vehicles for dropdown selection (no pagination)
  const allVehiclesQuery = useQuery({
    queryKey: ['vehicles-all'],
    queryFn: () => vehicleService.list({ limit: 100 }),
    enabled: activeTab === 'expenses'
  })

  const expensesQuery = useQuery({
    queryKey: ['vehicle-expenses', ePage, debouncedESearch],
    queryFn: () => vehicleService.listExpenses({ skip: (ePage - 1) * PAGE_SIZE, limit: PAGE_SIZE, search: debouncedESearch || undefined }),
    enabled: activeTab === 'expenses'
  })

  // ── Vehicle Mutations ──
  const upsertVehicle = useMutation({
    mutationFn: (d: Partial<Vehicle>) =>
      vEditing ? vehicleService.update(vEditing.id, d) : vehicleService.create(d),
    onSuccess: () => {
      toast.success(vEditing ? 'Vehicle updated' : 'Vehicle registered')
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      setVModalOpen(false)
      setVEditing(null)
    },
  })

  const destroyVehicle = useMutation({
    mutationFn: (id: number) => vehicleService.delete(id),
    onSuccess: () => {
      toast.success('Vehicle deleted')
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      setVDeleteId(null)
    },
  })

  // ── Expense Mutations ──
  const upsertExpense = useMutation({
    mutationFn: (d: Partial<VehicleExpense>) =>
      eEditing ? vehicleService.updateExpense(eEditing.id, d) : vehicleService.createExpense(d),
    onSuccess: () => {
      toast.success(eEditing ? 'Expense updated' : 'Expense recorded')
      qc.invalidateQueries({ queryKey: ['vehicle-expenses'] })
      setEModalOpen(false)
      setEEditing(null)
    },
  })

  const destroyExpense = useMutation({
    mutationFn: (id: number) => vehicleService.deleteExpense(id),
    onSuccess: () => {
      toast.success('Expense record deleted')
      qc.invalidateQueries({ queryKey: ['vehicle-expenses'] })
      setEDeleteId(null)
    },
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold dark:text-white">Vehicle Management</h1>
          <p className="text-sm text-gray-500">Track company vehicles, logs, and maintenance logs</p>
        </div>
        <div>
          {activeTab === 'vehicles' ? (
            <button className="btn-primary" onClick={() => { setVEditing(null); setVModalOpen(true) }}>
              <Plus size={16} /> Add Vehicle
            </button>
          ) : (
            <button className="btn-primary" onClick={() => { setEEditing(null); setEModalOpen(true) }}>
              <Plus size={16} /> Log Expense
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit flex-wrap">
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'vehicles'
              ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <Truck size={15} />
          Vehicles List
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'expenses'
              ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <Fuel size={15} />
          Vehicle Expenses
        </button>
      </div>

      {/* Vehicles Tab Panel */}
      {activeTab === 'vehicles' && (
        <div className="space-y-4">
          <div className="card p-4">
            <div className="relative max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input pl-9"
                placeholder="Search vehicle number or model…"
                value={vSearch}
                onChange={(e) => { setVSearch(e.target.value); setVPage(1) }}
              />
            </div>
          </div>

          <div className="card">
            <div className="table-container border-0 rounded-none">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Vehicle No</th>
                    <th>Model</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehiclesQuery.isLoading ? <TableSkeleton cols={6} /> : vehiclesQuery.data?.items.map((v, i) => (
                    <tr key={v.id}>
                      <td className="text-gray-400">{(vPage - 1) * PAGE_SIZE + i + 1}</td>
                      <td className="font-semibold dark:text-white font-mono">{v.vehicle_no}</td>
                      <td>{v.model}</td>
                      <td>{v.type}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${v.is_active ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                          {v.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn-outline py-1 px-2" onClick={() => { setVEditing(v); setVModalOpen(true) }}><Pencil size={14} /></button>
                          <button className="btn-danger py-1 px-2" onClick={() => setVDeleteId(v.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!vehiclesQuery.isLoading && !vehiclesQuery.data?.items.length && (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400">No vehicles registered</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={vPage} total={vehiclesQuery.data?.total ?? 0} pageSize={PAGE_SIZE} onChange={setVPage} />
          </div>
        </div>
      )}

      {/* Expenses Tab Panel */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="card p-4">
            <div className="relative max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input pl-9"
                placeholder="Search notes, bills, or vehicle no…"
                value={eSearch}
                onChange={(e) => { setESearch(e.target.value); setEPage(1) }}
              />
            </div>
          </div>

          <div className="card">
            <div className="table-container border-0 rounded-none">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Vehicle No</th>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Liters</th>
                    <th>Bill No</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expensesQuery.isLoading ? <TableSkeleton cols={8} /> : expensesQuery.data?.items.map((e, i) => (
                    <tr key={e.id}>
                      <td className="text-gray-400">{(ePage - 1) * PAGE_SIZE + i + 1}</td>
                      <td className="font-semibold dark:text-white font-mono">{e.vehicle_no}</td>
                      <td>{fmtDate(e.expense_date)}</td>
                      <td className="capitalize">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          e.expense_type === 'fuel' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400' :
                          e.expense_type === 'maintenance' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400' :
                          e.expense_type === 'insurance' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {e.expense_type}
                        </span>
                      </td>
                      <td>{e.expense_type === 'fuel' ? `${e.liters || '—'} L` : '—'}</td>
                      <td>{e.bill_no || '—'}</td>
                      <td className="font-semibold">{fmtCurrency(e.amount)}</td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn-outline py-1 px-2" onClick={() => { setEEditing(e); setEModalOpen(true) }}><Pencil size={14} /></button>
                          <button className="btn-danger py-1 px-2" onClick={() => setEDeleteId(e.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!expensesQuery.isLoading && !expensesQuery.data?.items.length && (
                    <tr><td colSpan={8} className="text-center py-12 text-gray-400">No expenses logged</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={ePage} total={expensesQuery.data?.total ?? 0} pageSize={PAGE_SIZE} onChange={setEPage} />
          </div>
        </div>
      )}

      {/* ── Modals & Dialogs ── */}

      {/* Vehicle Form Modal */}
      <Modal open={vModalOpen} onClose={() => { setVModalOpen(false); setVEditing(null) }}
        title={vEditing ? 'Edit Vehicle details' : 'Register Vehicle'} size="md">
        <VehicleForm onSubmit={(d) => upsertVehicle.mutate(d)} loading={upsertVehicle.isPending} initial={vEditing} />
      </Modal>

      {/* Expense Form Modal */}
      <Modal open={eModalOpen} onClose={() => { setEModalOpen(false); setEEditing(null) }}
        title={eEditing ? 'Edit Expense details' : 'Log Vehicle Expense'} size="md">
        <VehicleExpenseForm
          onSubmit={(d) => upsertExpense.mutate(d)}
          loading={upsertExpense.isPending}
          initial={eEditing}
          vehicles={allVehiclesQuery.data?.items || []}
        />
      </Modal>

      {/* Delete Vehicle Dialog */}
      <ConfirmDialog open={vDeleteId !== null} onClose={() => setVDeleteId(null)}
        onConfirm={() => vDeleteId && destroyVehicle.mutate(vDeleteId)}
        message="Delete this vehicle? This action cannot be undone." loading={destroyVehicle.isPending} />

      {/* Delete Expense Dialog */}
      <ConfirmDialog open={eDeleteId !== null} onClose={() => setEDeleteId(null)}
        onConfirm={() => eDeleteId && destroyExpense.mutate(eDeleteId)}
        message="Delete this vehicle expense record?" loading={destroyExpense.isPending} />
    </div>
  )
}
