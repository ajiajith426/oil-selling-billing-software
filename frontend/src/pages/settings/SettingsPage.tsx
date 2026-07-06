import { useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { Upload, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { Combobox } from '@/components/ui/Combobox'
import { settingsService } from '@/services/settings.service'
import { Settings } from '@/types'

export default function SettingsPage() {
  const qc = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.get,
  })

  const { control, register, handleSubmit, reset, formState: { isDirty } } = useForm<Partial<Settings>>()

  useEffect(() => {
    if (settings) {
      reset(settings)
      // cache for invoice printing
      localStorage.setItem('company_settings', JSON.stringify(settings))
    }
  }, [settings, reset])

  const update = useMutation({
    mutationFn: (d: Partial<Settings>) => settingsService.update(d),
    onSuccess: (data) => {
      toast.success('Settings saved')
      qc.invalidateQueries({ queryKey: ['settings'] })
      localStorage.setItem('company_settings', JSON.stringify(data))
    },
  })

  const uploadLogo = useMutation({
    mutationFn: (file: File) => settingsService.uploadLogo(file),
    onSuccess: (data) => {
      toast.success('Logo uploaded')
      qc.invalidateQueries({ queryKey: ['settings'] })
    },
  })

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadLogo.mutate(file)
  }

  if (isLoading) return <div className="p-8 text-gray-400">Loading settings…</div>

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500">Configure your company and billing preferences</p>
      </div>

      <form onSubmit={handleSubmit((d) => update.mutate(d))} className="space-y-6">
        {/* Logo */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold dark:text-white">Company Logo</h2>
          <div className="flex items-center gap-4">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-16 w-auto rounded-lg border border-gray-200 dark:border-gray-700 p-1" />
            ) : (
              <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">Logo</div>
            )}
            <button
              type="button"
              className="btn-outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadLogo.isPending}
            >
              <Upload size={16} />
              {uploadLogo.isPending ? 'Uploading…' : 'Upload Logo'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>
        </div>

        {/* Company Info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold dark:text-white">Company Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Company Name *</label>
              <input className="input" {...register('company_name')} />
            </div>
            <div>
              <label className="label">GST Number</label>
              <input className="input" placeholder="22AAAAA0000A1Z5" {...register('gst_number')} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" type="tel" {...register('phone')} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" {...register('email')} />
            </div>
            <div>
              <label className="label">Website</label>
              <input className="input" placeholder="https://example.com" {...register('website')} />
            </div>
            <div className="col-span-2">
              <label className="label">Address</label>
              <textarea className="input" rows={2} {...register('address')} />
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
          </div>
        </div>

        {/* Invoice Settings */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold dark:text-white">Invoice Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Invoice Prefix</label>
              <input className="input" placeholder="INV" {...register('invoice_prefix')} />
              <p className="text-xs text-gray-400 mt-1">Example: INV-000001</p>
            </div>
            <div>
              <label className="label">Purchase Prefix</label>
              <input className="input" placeholder="PUR" {...register('purchase_prefix')} />
            </div>
            <div>
              <label className="label">Currency Code</label>
              <input className="input" placeholder="INR" {...register('currency')} />
            </div>
            <div>
              <label className="label">Currency Symbol</label>
              <input className="input" placeholder="₹" {...register('currency_symbol')} />
            </div>
            <div>
              <label className="label">Tax Mode</label>
              <Controller
                control={control}
                name="tax_inclusive"
                render={({ field }) => (
                  <Combobox
                    placeholder="Select Tax Mode"
                    options={[
                      { value: 'exclusive', label: 'Exclusive (Tax added on top)' },
                      { value: 'inclusive', label: 'Inclusive (Tax included in price)' }
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary px-8" disabled={update.isPending || !isDirty}>
            <Save size={16} />
            {update.isPending ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
