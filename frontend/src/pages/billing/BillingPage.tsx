import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Trash2, Printer, Plus, Minus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useReactToPrint } from 'react-to-print'
import { productService } from '@/services/product.service'
import { customerService } from '@/services/customer.service'
import { saleService } from '@/services/sale.service'
import { Product, Sale } from '@/types'
import { fmtCurrency } from '@/utils/format'
import InvoicePrint from './InvoicePrint'
import { Combobox } from '@/components/ui/Combobox'

interface CartItem {
  product: Product
  quantity: number
  unit_price: number
  gst_percent: number
  discount_percent: number
}

type PaymentMethod = 'cash' | 'card' | 'upi' | 'split'

export default function BillingPage() {
  const qc = useQueryClient()
  const printRef = useRef<HTMLDivElement>(null)

  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [barcodeInput, setBarcodeInput] = useState('')
  const [customerId, setCustomerId] = useState<number | undefined>()
  const [discountAmount, setDiscountAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [cashAmount, setCashAmount] = useState(0)
  const [cardAmount, setCardAmount] = useState(0)
  const [upiAmount, setUpiAmount] = useState(0)
  const [notes, setNotes] = useState('')
  const [completedSale, setCompletedSale] = useState<Sale | null>(null)
  const [gstEnabled, setGstEnabled] = useState(true)

  const { data: productsData } = useQuery({
    queryKey: ['pos-products', search],
    queryFn: () => productService.list({ search, limit: 20, is_active: true }),
    enabled: search.length >= 1,
  })

  const { data: customers } = useQuery({
    queryKey: ['customers-all'],
    queryFn: () => customerService.list({ limit: 200 }),
  })

  const handlePrint = useReactToPrint({ content: () => printRef.current })

  const createSale = useMutation({
    mutationFn: saleService.create,
    onSuccess: (sale) => {
      toast.success(`Invoice ${sale.invoice_number} created`)
      setCompletedSale(sale)
      qc.invalidateQueries({ queryKey: ['sales'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
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
        unit_price: Number(product.selling_price),
        gst_percent: Number(product.gst_percent),
        discount_percent: 0,
      }])
    }
    setSearch('')
  }

  const handleBarcodeSearch = async () => {
    if (!barcodeInput) return
    try {
      const product = await productService.getByBarcode(barcodeInput)
      addToCart(product)
      setBarcodeInput('')
    } catch {
      toast.error('Product not found')
    }
  }

  const updateQty = (idx: number, delta: number) => {
    const item = cart[idx]
    const newQty = item.quantity + delta
    if (newQty <= 0) { setCart(cart.filter((_, i) => i !== idx)); return }
    setCart(cart.map((c, i) => i === idx ? { ...c, quantity: newQty } : c))
  }

  const removeItem = (idx: number) => setCart(cart.filter((_, i) => i !== idx))

  const subtotal = cart.reduce((sum, item) => {
    const base = item.unit_price * item.quantity
    return sum + base - (base * item.discount_percent / 100)
  }, 0)
  const taxAmount = gstEnabled
    ? cart.reduce((sum, item) => {
        const base = item.unit_price * item.quantity
        const disc = base * item.discount_percent / 100
        return sum + ((base - disc) * item.gst_percent / 100)
      }, 0)
    : 0
  const grandTotal = subtotal + taxAmount - discountAmount
  const paidAmount = paymentMethod === 'split' ? cashAmount + cardAmount + upiAmount : cashAmount || cardAmount || upiAmount
  const changeAmount = Math.max(0, (paymentMethod === 'cash' ? cashAmount : paidAmount) - grandTotal)

  const clearBill = () => {
    setCart([])
    setCompletedSale(null)
    setDiscountAmount(0)
    setCashAmount(0)
    setCardAmount(0)
    setUpiAmount(0)
    setCustomerId(undefined)
    setNotes('')
    setPaymentMethod('cash')
  }

  const handleCheckout = () => {
    if (!cart.length) { toast.error('Cart is empty'); return }
    const payMap = {
      cash: { cash_amount: grandTotal, card_amount: 0, upi_amount: 0 },
      card: { cash_amount: 0, card_amount: grandTotal, upi_amount: 0 },
      upi: { cash_amount: 0, card_amount: 0, upi_amount: grandTotal },
      split: { cash_amount: cashAmount, card_amount: cardAmount, upi_amount: upiAmount },
    }
    createSale.mutate({
      customer_id: customerId,
      discount_amount: discountAmount,
      paid_amount: paymentMethod === 'cash' ? cashAmount : paidAmount,
      payment_method: paymentMethod,
      notes,
      items: cart.map((c) => ({
        product_id: c.product.id,
        quantity: c.quantity,
        unit_price: c.unit_price,
        gst_percent: gstEnabled ? c.gst_percent : 0,
        discount_percent: c.discount_percent,
      })),
      ...payMap[paymentMethod],
    })
  }

  return (
    <div className="h-full">
      <div className="grid lg:grid-cols-5 gap-4 h-full">
        {/* Left: product search + cart */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-xl font-bold dark:text-white">POS / Billing</h1>
              
              {/* GST Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={gstEnabled}
                  onChange={(e) => setGstEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ml-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  GST Billing: 
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-wider ${gstEnabled ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                    {gstEnabled ? 'ON' : 'OFF'}
                  </span>
                </span>
              </label>
            </div>
            {completedSale && (
              <div className="flex gap-2">
                <button className="btn-outline" onClick={handlePrint}><Printer size={16} /> Print Invoice</button>
                <button className="btn-primary" onClick={clearBill}>New Bill</button>
              </div>
            )}
          </div>

          {/* Barcode + Search */}
          <div className="card p-4 flex gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input pl-9"
                placeholder="Search product…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {productsData?.items.length && search ? (
                <div className="absolute top-full left-0 right-0 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl mt-1 max-h-52 overflow-y-auto">
                  {productsData.items.map((p) => (
                    <button key={p.id} type="button" onClick={() => addToCart(p)}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium dark:text-white">{p.name}</p>
                        <p className="text-xs text-gray-400">Stock: {p.current_stock} {p.unit}</p>
                      </div>
                      <span className="font-semibold text-sm text-green-600">{fmtCurrency(p.selling_price)}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex gap-2">
              <input
                className="input w-36"
                placeholder="Scan barcode…"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBarcodeSearch()}
              />
            </div>
          </div>

          {/* Cart */}
          <div className="card flex-1">
            <div className="table-container border-0 rounded-none">
              <table>
                <thead>
                  <tr><th>Product</th><th>Qty</th><th>Price</th><th>GST%</th><th>Disc%</th><th>Total</th><th></th></tr>
                </thead>
                <tbody>
                  {cart.map((item, idx) => {
                    const base = item.unit_price * item.quantity
                    const disc = base * item.discount_percent / 100
                    const gst = gstEnabled ? ((base - disc) * item.gst_percent / 100) : 0
                    return (
                      <tr key={idx}>
                        <td>
                          <p className="font-medium dark:text-white text-sm">{item.product.name}</p>
                          <p className="text-xs text-gray-400">{item.product.unit}</p>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => updateQty(idx, -1)}
                              className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200">
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                            <button type="button" onClick={() => updateQty(idx, 1)}
                              className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200">
                              <Plus size={12} />
                            </button>
                          </div>
                        </td>
                        <td>
                          <input type="number" step="0.01" className="input w-24"
                            value={item.unit_price}
                            onChange={(e) => setCart(cart.map((c, i) => i === idx ? { ...c, unit_price: parseFloat(e.target.value) || 0 } : c))} />
                        </td>
                        <td className="text-gray-500 text-sm">{gstEnabled ? `${item.gst_percent}%` : '0%'}</td>
                        <td>
                          <input type="number" step="0.01" className="input w-16"
                            value={item.discount_percent}
                            onChange={(e) => setCart(cart.map((c, i) => i === idx ? { ...c, discount_percent: parseFloat(e.target.value) || 0 } : c))} />
                        </td>
                        <td className="font-semibold">{fmtCurrency(base - disc + gst)}</td>
                        <td>
                          <button type="button" onClick={() => removeItem(idx)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  {!cart.length && (
                    <tr><td colSpan={7} className="text-center py-16 text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Search size={32} className="opacity-30" />
                        <p>Search and add products to cart</p>
                      </div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: checkout panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold dark:text-white">Customer & Payment</h2>

            <div>
              <label className="label">Customer</label>
              <Combobox
                placeholder="Walk-in Customer"
                searchPlaceholder="Search customer..."
                emptyMessage="No customer found."
                options={[
                  { value: 'walk-in', label: 'Walk-in Customer' },
                  ...(customers?.items || []).map((c) => ({
                    value: c.id,
                    label: `${c.name} — ${c.mobile || ''}`
                  }))
                ]}
                value={customerId ?? 'walk-in'}
                onChange={(val) => setCustomerId(val === 'walk-in' ? undefined : val)}
              />
            </div>

            {/* Totals */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium dark:text-white">{fmtCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">GST</span>
                <span className="font-medium dark:text-white">{fmtCurrency(taxAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Discount (₹)</span>
                <input type="number" step="0.01" className="input w-24 text-right"
                  value={discountAmount} onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-200 dark:border-gray-600 pt-2">
                <span className="dark:text-white">Total</span>
                <span className="text-blue-600">{fmtCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Payment method */}
            <div>
              <label className="label">Payment Method</label>
              <div className="grid grid-cols-4 gap-2">
                {(['cash', 'card', 'upi', 'split'] as PaymentMethod[]).map((m) => (
                  <button key={m} type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2 rounded-lg text-xs font-semibold capitalize border transition-colors ${paymentMethod === m
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment inputs */}
            {paymentMethod === 'cash' && (
              <div>
                <label className="label">Cash Received (₹)</label>
                <input type="number" step="0.01" className="input text-lg font-semibold"
                  value={cashAmount} onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)} />
                {cashAmount > 0 && (
                  <p className="text-sm mt-1 text-green-600 font-semibold">Change: {fmtCurrency(changeAmount)}</p>
                )}
              </div>
            )}
            {paymentMethod === 'card' && (
              <div>
                <label className="label">Card Amount (₹)</label>
                <input type="number" step="0.01" className="input" value={cardAmount} onChange={(e) => setCardAmount(parseFloat(e.target.value) || 0)} />
              </div>
            )}
            {paymentMethod === 'upi' && (
              <div>
                <label className="label">UPI Amount (₹)</label>
                <input type="number" step="0.01" className="input" value={upiAmount} onChange={(e) => setUpiAmount(parseFloat(e.target.value) || 0)} />
              </div>
            )}
            {paymentMethod === 'split' && (
              <div className="space-y-2">
                <div><label className="label">Cash</label><input type="number" step="0.01" className="input" value={cashAmount} onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)} /></div>
                <div><label className="label">Card</label><input type="number" step="0.01" className="input" value={cardAmount} onChange={(e) => setCardAmount(parseFloat(e.target.value) || 0)} /></div>
                <div><label className="label">UPI</label><input type="number" step="0.01" className="input" value={upiAmount} onChange={(e) => setUpiAmount(parseFloat(e.target.value) || 0)} /></div>
              </div>
            )}

            <div>
              <label className="label">Notes</label>
              <textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <button className="btn-success w-full text-base py-3" onClick={handleCheckout} disabled={createSale.isPending || !cart.length}>
              {createSale.isPending ? 'Processing…' : `Checkout — ${fmtCurrency(grandTotal)}`}
            </button>

            {completedSale && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                <p className="text-green-700 dark:text-green-400 font-semibold">Sale Completed!</p>
                <p className="text-sm text-gray-500 mt-1">Invoice: {completedSale.invoice_number}</p>
                <button className="btn-outline mt-3 w-full" onClick={handlePrint}><Printer size={14} /> Print Invoice</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden print target */}
      <div className="hidden">
        <InvoicePrint ref={printRef} sale={completedSale} />
      </div>
    </div>
  )
}
