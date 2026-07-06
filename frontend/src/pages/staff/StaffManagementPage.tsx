import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { Plus, Pencil, Trash2, Search, Users, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'
import { Combobox } from '@/components/ui/Combobox'
import { DatePicker } from '@/components/ui/DatePicker'
import { staffService } from '@/services/staff.service'
import { Staff, SalaryPayment } from '@/types'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Pagination from '@/components/ui/Pagination'
import { TableSkeleton } from '@/components/ui/LoadingSkeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { fmtCurrency, fmtDate } from '@/utils/format'

const PAGE_SIZE = 15

// ── Staff Form Component ─────────────────────────────────────────────────
function StaffForm({ onSubmit, loading, initial }: {
  onSubmit: (d: Partial<Staff>) => void
  loading: boolean
  initial?: Staff | null
}) {
  const { control, register, handleSubmit, formState: { errors } } = useForm<Partial<Staff>>({
    defaultValues: initial ?? { is_active: true, salary_type: 'daily' }
  })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Staff Name *</label>
          <input className="input" placeholder="e.g. Rajesh Kumar" {...register('name', { required: 'Name is required' })} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">Mobile Number *</label>
          <input className="input" type="tel" placeholder="e.g. 9876543210" {...register('mobile', { required: 'Mobile is required' })} />
          {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile.message}</p>}
        </div>
        <div>
          <label className="label">Designation / Role *</label>
          <input className="input" placeholder="e.g. Driver, Helper, Billing Staff" {...register('role', { required: 'Role is required' })} />
          {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>}
        </div>
        <div>
          <label className="label">Payment Basis *</label>
          <Controller
            control={control}
            name="salary_type"
            render={({ field }) => (
              <Combobox
                placeholder="Select basis"
                options={[
                  { value: 'daily', label: 'Daily Wages' },
                  { value: 'monthly', label: 'Monthly Salary' }
                ]}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <div>
          <label className="label">Base Rate / Salary (₹) *</label>
          <input className="input" type="number" step="1" {...register('base_salary', { required: 'Salary is required', min: { value: 1, message: 'Must be greater than 0' } })} />
          {errors.base_salary && <p className="text-xs text-red-500 mt-1">{errors.base_salary.message}</p>}
        </div>
        <div className="col-span-2 flex items-center gap-2 pt-2">
          <input type="checkbox" id="is_active_staff" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" {...register('is_active')} />
          <label htmlFor="is_active_staff" className="text-sm font-semibold text-gray-700 dark:text-gray-300 select-none cursor-pointer">Active</label>
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

// ── Salary Payout Form Component ─────────────────────────────────────────
function SalaryPayoutForm({ onSubmit, loading, initial, staffList }: {
  onSubmit: (d: Partial<SalaryPayment>) => void
  loading: boolean
  initial?: SalaryPayment | null
  staffList: Staff[]
}) {
  const { control, register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Partial<SalaryPayment>>({
    defaultValues: initial ?? {
      payment_date: new Date().toISOString().split('T')[0],
      payment_period: new Date().toISOString().split('T')[0]
    }
  })

  const selectedStaffId = watch('staff_id')

  const handleStaffChange = (sId: number) => {
    const emp = staffList.find(s => s.id === sId)
    if (emp) {
      setValue('amount', emp.base_salary)
      setValue('payment_type', emp.salary_type)
      if (emp.salary_type === 'daily') {
        setValue('payment_period', new Date().toISOString().split('T')[0])
      } else {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        setValue('payment_period', `${months[new Date().getMonth()]} ${new Date().getFullYear()}`)
      }
    }
  }

  const payoutType = watch('payment_type')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Select Staff *</label>
          <Controller
            control={control}
            name="staff_id"
            rules={{ required: 'Staff member is required' }}
            render={({ field }) => (
              <Combobox
                placeholder="Choose Employee"
                searchPlaceholder="Search staff member..."
                emptyMessage="No staff member found."
                options={staffList.filter(s => s.is_active).map(s => ({
                  value: s.id,
                  label: `${s.name} — ${s.role} (${s.salary_type})`
                }))}
                value={field.value}
                onChange={(val) => {
                  field.onChange(val)
                  handleStaffChange(Number(val))
                }}
              />
            )}
          />
          {errors.staff_id && <p className="text-xs text-red-500 mt-1">{errors.staff_id.message}</p>}
        </div>
        <div>
          <label className="label">Payment Date *</label>
          <Controller
            control={control}
            name="payment_date"
            rules={{ required: 'Payment date is required' }}
            render={({ field }) => (
              <DatePicker
                placeholder="Pick payout date"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {errors.payment_date && <p className="text-xs text-red-500 mt-1">{errors.payment_date.message}</p>}
        </div>
        <div>
          <label className="label">Payout Category</label>
          <input className="input bg-gray-50 dark:bg-gray-800 cursor-not-allowed capitalize" {...register('payment_type')} readOnly />
        </div>
        <div>
          <label className="label">Payout Period *</label>
          <input className="input" placeholder={payoutType === 'daily' ? 'e.g. 2026-07-06' : 'e.g. July 2026'} {...register('payment_period', { required: 'Period is required' })} />
          {errors.payment_period && <p className="text-xs text-red-500 mt-1">{errors.payment_period.message}</p>}
        </div>
        <div>
          <label className="label">Amount Paid (₹) *</label>
          <input className="input" type="number" {...register('amount', { required: 'Amount is required', min: { value: 1, message: 'Must be greater than 0' } })} />
          {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
        </div>
        <div className="col-span-2">
          <label className="label">Notes / Remarks</label>
          <textarea className="input" rows={2} placeholder="Add payment notes..." {...register('notes')} />
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : initial ? 'Update' : 'Post Payout'}
        </button>
      </div>
    </form>
  )
}

// ── Main Page Component ──────────────────────────────────────────────────
export default function StaffManagementPage() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<'staff' | 'payroll'>('staff')

  // ── State for Staff CRUD ──
  const [sPage, setSPage] = useState(1)
  const [sSearch, setSSearch] = useState('')
  const debouncedSSearch = useDebounce(sSearch)
  const [sModalOpen, setSModalOpen] = useState(false)
  const [sEditing, setSEditing] = useState<Staff | null>(null)
  const [sDeleteId, setSDeleteId] = useState<number | null>(null)

  // ── State for Payroll CRUD ──
  const [pPage, setPPage] = useState(1)
  const [pSearch, setPSearch] = useState('')
  const debouncedPSearch = useDebounce(pSearch)
  const [pModalOpen, setPModalOpen] = useState(false)
  const [pEditing, setPEditing] = useState<SalaryPayment | null>(null)
  const [pDeleteId, setPDeleteId] = useState<number | null>(null)

  // ── Queries ──
  const staffQuery = useQuery({
    queryKey: ['staff', sPage, debouncedSSearch],
    queryFn: () => staffService.list({ skip: (sPage - 1) * PAGE_SIZE, limit: PAGE_SIZE, search: debouncedSSearch || undefined }),
  })

  const allStaffQuery = useQuery({
    queryKey: ['staff-all'],
    queryFn: () => staffService.list({ limit: 100 }),
    enabled: activeTab === 'payroll'
  })

  const payrollQuery = useQuery({
    queryKey: ['salaries', pPage, debouncedPSearch],
    queryFn: () => staffService.listSalaries({ skip: (pPage - 1) * PAGE_SIZE, limit: PAGE_SIZE, search: debouncedPSearch || undefined }),
    enabled: activeTab === 'payroll'
  })

  // ── Staff Mutations ──
  const upsertStaff = useMutation({
    mutationFn: (d: Partial<Staff>) =>
      sEditing ? staffService.update(sEditing.id, d) : staffService.create(d),
    onSuccess: () => {
      toast.success(sEditing ? 'Employee profile updated' : 'Employee registered successfully')
      qc.invalidateQueries({ queryKey: ['staff'] })
      setSModalOpen(false)
      setSEditing(null)
    },
  })

  const destroyStaff = useMutation({
    mutationFn: (id: number) => staffService.delete(id),
    onSuccess: () => {
      toast.success('Employee deleted')
      qc.invalidateQueries({ queryKey: ['staff'] })
      setSDeleteId(null)
    },
  })

  // ── Payroll Mutations ──
  const upsertPayroll = useMutation({
    mutationFn: (d: Partial<SalaryPayment>) =>
      pEditing ? staffService.updateSalary(pEditing.id, d) : staffService.createSalary(d),
    onSuccess: () => {
      toast.success(pEditing ? 'Salary payout details updated' : 'Salary/Wage payout recorded')
      qc.invalidateQueries({ queryKey: ['salaries'] })
      setPModalOpen(false)
      setPEditing(null)
    },
  })

  const destroyPayroll = useMutation({
    mutationFn: (id: number) => staffService.deleteSalary(id),
    onSuccess: () => {
      toast.success('Salary payment record deleted')
      qc.invalidateQueries({ queryKey: ['salaries'] })
      setPDeleteId(null)
    },
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold dark:text-white">Staff Management</h1>
          <p className="text-sm text-gray-500">Manage employee directories, base salary configurations, and salary payout histories</p>
        </div>
        <div>
          {activeTab === 'staff' ? (
            <button className="btn-primary" onClick={() => { setSEditing(null); setSModalOpen(true) }}>
              <Plus size={16} /> Add Staff Member
            </button>
          ) : (
            <button className="btn-primary" onClick={() => { setPEditing(null); setPModalOpen(true) }}>
              <Plus size={16} /> Log Salary Payout
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit flex-wrap">
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'staff'
              ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <Users size={15} />
          Staff Directory
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'payroll'
              ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <DollarSign size={15} />
          Salary & Wage Payments
        </button>
      </div>

      {/* Staff Directory Panel */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="card p-4">
            <div className="relative max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input pl-9"
                placeholder="Search staff name or designation…"
                value={sSearch}
                onChange={(e) => { setSSearch(e.target.value); setSPage(1) }}
              />
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
                    <th>Designation</th>
                    <th>Salary Basis</th>
                    <th>Base Salary Rate</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffQuery.isLoading ? <TableSkeleton cols={8} /> : staffQuery.data?.items.map((s, i) => (
                    <tr key={s.id}>
                      <td className="text-gray-400">{(sPage - 1) * PAGE_SIZE + i + 1}</td>
                      <td className="font-semibold dark:text-white">{s.name}</td>
                      <td>{s.mobile}</td>
                      <td>{s.role}</td>
                      <td className="capitalize">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.salary_type === 'daily' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400'}`}>
                          {s.salary_type}
                        </span>
                      </td>
                      <td className="font-medium">
                        {fmtCurrency(s.base_salary)}
                        <span className="text-xs text-gray-500 font-normal"> / {s.salary_type === 'daily' ? 'day' : 'month'}</span>
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.is_active ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                          {s.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn-outline py-1 px-2" onClick={() => { setSEditing(s); setSModalOpen(true) }}><Pencil size={14} /></button>
                          <button className="btn-danger py-1 px-2" onClick={() => setSDeleteId(s.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!staffQuery.isLoading && !staffQuery.data?.items.length && (
                    <tr><td colSpan={8} className="text-center py-12 text-gray-400">No staff members registered</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={sPage} total={staffQuery.data?.total ?? 0} pageSize={PAGE_SIZE} onChange={setSPage} />
          </div>
        </div>
      )}

      {/* Salary Payments Panel */}
      {activeTab === 'payroll' && (
        <div className="space-y-4">
          <div className="card p-4">
            <div className="relative max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input pl-9"
                placeholder="Search payments by staff name…"
                value={pSearch}
                onChange={(e) => { setPSearch(e.target.value); setPPage(1) }}
              />
            </div>
          </div>

          <div className="card">
            <div className="table-container border-0 rounded-none">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Employee Name</th>
                    <th>Payment Date</th>
                    <th>Payout Category</th>
                    <th>Payout Period</th>
                    <th>Notes</th>
                    <th>Amount Paid</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollQuery.isLoading ? <TableSkeleton cols={8} /> : payrollQuery.data?.items.map((p, i) => (
                    <tr key={p.id}>
                      <td className="text-gray-400">{(pPage - 1) * PAGE_SIZE + i + 1}</td>
                      <td className="font-semibold dark:text-white">{p.staff_name}</td>
                      <td>{fmtDate(p.payment_date)}</td>
                      <td className="capitalize">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.payment_type === 'daily' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400'}`}>
                          {p.payment_type}
                        </span>
                      </td>
                      <td className="font-medium text-gray-600 dark:text-gray-400">{p.payment_period}</td>
                      <td>{p.notes || '—'}</td>
                      <td className="font-bold text-green-600 dark:text-green-400">{fmtCurrency(p.amount)}</td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn-outline py-1 px-2" onClick={() => { setPEditing(p); setPModalOpen(true) }}><Pencil size={14} /></button>
                          <button className="btn-danger py-1 px-2" onClick={() => setPDeleteId(p.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!payrollQuery.isLoading && !payrollQuery.data?.items.length && (
                    <tr><td colSpan={8} className="text-center py-12 text-gray-400">No payouts logged</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={pPage} total={payrollQuery.data?.total ?? 0} pageSize={PAGE_SIZE} onChange={setPPage} />
          </div>
        </div>
      )}

      {/* ── Modals & Dialogs ── */}

      {/* Staff Form Modal */}
      <Modal open={sModalOpen} onClose={() => { setSModalOpen(false); setSEditing(null) }}
        title={sEditing ? 'Edit Staff details' : 'Register Staff Member'} size="md">
        <StaffForm onSubmit={(d) => upsertStaff.mutate(d)} loading={upsertStaff.isPending} initial={sEditing} />
      </Modal>

      {/* Salary Form Modal */}
      <Modal open={pModalOpen} onClose={() => { setPModalOpen(false); setPEditing(null) }}
        title={pEditing ? 'Edit Payment Record' : 'Record Salary Payout'} size="md">
        <SalaryPayoutForm
          onSubmit={(d) => upsertPayroll.mutate(d)}
          loading={upsertPayroll.isPending}
          initial={pEditing}
          staffList={allStaffQuery.data?.items || []}
        />
      </Modal>

      {/* Delete Staff Dialog */}
      <ConfirmDialog open={sDeleteId !== null} onClose={() => setSDeleteId(null)}
        onConfirm={() => sDeleteId && destroyStaff.mutate(sDeleteId)}
        message="Delete this staff member profile?" loading={destroyStaff.isPending} />

      {/* Delete Salary Payment Dialog */}
      <ConfirmDialog open={pDeleteId !== null} onClose={() => setPDeleteId(null)}
        onConfirm={() => pDeleteId && destroyPayroll.mutate(pDeleteId)}
        message="Delete this payment record?" loading={destroyPayroll.isPending} />
    </div>
  )
}
