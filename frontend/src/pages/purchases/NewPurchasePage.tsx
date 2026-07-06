import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { Combobox } from '@/components/ui/Combobox'
import { supplierService } from '@/services/supplier.service'
import { productService } from '@/services/product.service'
import { purchaseService } from '@/services/purchase.service'
import { Product } from '@/types'
import { fmtCurrency } from '@/utils/format'

interface CartItem {
  product: Product
  quantity: number
  unit_price: number
  gst_percent: number
  discount_percent: number
}

export default function NewPurchasePage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState<CartItem[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [discountAmount, setDiscountAmount] = useState(0)
  const [paidAmount, setPaidAmount] = useState(0)

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers-all'],
    queryFn: () => supplierService.list({ limit: 200 }),
  })

  const { data: productsData } = useQuery({
    queryKey: ['products-search', productSearch],
    queryFn: () => productService.list({ search: productSearch, limit: 20 }),
    enabled: productSearch.length >= 1,
  })

  const { control, register, handleSubmit, watch } = useForm<{ supplier_id: number; notes: string }>()

  const create = useMutation({
    mutationFn: purchaseService.create,
    onSuccess: () => {
      toast.success('Purchase created successfully')
      navigate('/purchases')
    },
  })

  const addToCart = (product: Product) => {
    const existing = cart.find((c) => c.product.id === product.id)
    if (existing) {
      setCart(cart.map((c) => c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c))
    } else {
      setCart([...cart, {
        product,
        quantity: 1,
        unit_price: Number(product.purchase_price),
        gst_percent: Number(product.gst_percent),
        discount_percent: 0,
      }])
    }
    setProductSearch('')
  }

  const updateCart = (idx: number, field: keyof CartItem, value: number) => {
    setCart(cart.map((c, i) => i === idx ? { ...c, [field]: value } : c))
  }

  const removeFromCart = (idx: number) => setCart(cart.filter((_, i) => i !== idx))

  const subtotal = cart.reduce((sum, item) => {
    const base = item.unit_price * item.quantity
    const disc = base * item.discount_percent / 100
    return sum + (base - disc)
  }, 0)

  const taxAmount = cart.reduce((sum, item) => {
    const base = item.unit_price * item.quantity
    const disc = base * item.discount_percent / 100
    return sum + ((base - disc) * item.gst_percent / 100)
  }, 0)

  const grandTotal = subtotal + taxAmount - discountAmount

  const onSubmit = (formData: { supplier_id: number; notes: string }) => {
    if (!cart.length) { toast.error('Add at least one product'); return }
    create.mutate({
      supplier_id: formData.supplier_id || null,
      discount_amount: discountAmount,
      paid_amount: paidAmount,
      notes: formData.notes,
      items: cart.map((c) => ({
        product_id: c.product.id,
        quantity: c.quantity,
        unit_price: c.unit_price,
        gst_percent: c.gst_percent,
        discount_percent: c.discount_percent,
      })),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/purchases')} className="btn-secondary py-2 px-3"><ArrowLeft size={16} /></button>
        <div>
          <h1 className="text-xl font-bold dark:text-white">New Purchase</h1>
          <p className="text-sm text-gray-500">Create a purchase invoice</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left: cart */}
          <div className="lg:col-span-3 space-y-4">
            {/* Product search */}
            <div className="card p-4">
              <label className="label">Search & Add Products</label>
              <div className="relative">
                <input
                  className="input"
                  placeholder="Type product name or SKU…"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
                {productsData?.items.length ? (
                  <div className="absolute top-full left-0 right-0 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                    {productsData.items.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => addToCart(p)}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium dark:text-white">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.sku} · Stock: {p.current_stock} {p.unit}</p>
                        </div>
                        <span className="text-sm font-semibold text-blue-600">{fmtCurrency(p.purchase_price)}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Cart table */}
            <div className="card">
              <div className="table-container border-0 rounded-none">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th><th>Qty</th><th>Unit Price</th><th>GST%</th><th>Disc%</th><th>Total</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, idx) => {
                      const base = item.unit_price * item.quantity
                      const disc = base * item.discount_percent / 100
                      const gst = (base - disc) * item.gst_percent / 100
                      const total = base - disc + gst
                      return (
                        <tr key={idx}>
                          <td>
                            <p className="font-medium dark:text-white">{item.product.name}</p>
                            <p className="text-xs text-gray-400">{item.product.unit}</p>
                          </td>
                          <td>
                            <input type="number" min="0.01" step="0.01" className="input w-20"
                              value={item.quantity}
                              onChange={(e) => updateCart(idx, 'quantity', parseFloat(e.target.value) || 1)} />
                          </td>
                          <td>
                            <input type="number" step="0.01" className="input w-28"
                              value={item.unit_price}
                              onChange={(e) => updateCart(idx, 'unit_price', parseFloat(e.target.value) || 0)} />
                          </td>
                          <td>
                            <input type="number" step="0.01" className="input w-16"
                              value={item.gst_percent}
                              onChange={(e) => updateCart(idx, 'gst_percent', parseFloat(e.target.value) || 0)} />
                          </td>
                          <td>
                            <input type="number" step="0.01" className="input w-16"
                              value={item.discount_percent}
                              onChange={(e) => updateCart(idx, 'discount_percent', parseFloat(e.target.value) || 0)} />
                          </td>
                          <td className="font-semibold">{fmtCurrency(total)}</td>
                          <td>
                            <button type="button" className="btn-danger py-1 px-2" onClick={() => removeFromCart(idx)}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                    {!cart.length && (
                      <tr><td colSpan={7} className="text-center py-12 text-gray-400">No products added</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: summary */}
          <div className="space-y-4">
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold dark:text-white">Purchase Details</h3>

              <div>
                <label className="label">Supplier</label>
                <Controller
                  control={control}
                  name="supplier_id"
                  render={({ field }) => (
                    <Combobox
                      placeholder="Walk-in / No supplier"
                      searchPlaceholder="Search supplier..."
                      emptyMessage="No supplier found."
                      options={[
                        { value: 'walk-in', label: 'Walk-in / No supplier' },
                        ...(suppliers?.items || []).map((s) => ({ value: s.id, label: s.name }))
                      ]}
                      value={field.value ?? 'walk-in'}
                      onChange={(val) => field.onChange(val === 'walk-in' ? undefined : Number(val))}
                    />
                  )}
                />
              </div>

              <div>
                <label className="label">Notes</label>
                <textarea className="input" rows={2} {...register('notes')} />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium dark:text-white">{fmtCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax (GST)</span>
                  <span className="font-medium dark:text-white">{fmtCurrency(taxAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <input type="number" step="0.01" className="input w-28 text-right"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="flex justify-between font-bold text-base border-t border-gray-200 dark:border-gray-700 pt-2">
                  <span className="dark:text-white">Grand Total</span>
                  <span className="text-blue-600">{fmtCurrency(grandTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Paid Amount</span>
                  <input type="number" step="0.01" className="input w-28 text-right"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-gray-500">Due Amount</span>
                  <span className="text-red-500">{fmtCurrency(Math.max(0, grandTotal - paidAmount))}</span>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full" disabled={create.isPending}>
                {create.isPending ? 'Creating…' : 'Create Purchase'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
