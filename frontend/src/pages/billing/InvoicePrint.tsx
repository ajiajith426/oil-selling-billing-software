import { forwardRef } from 'react'
import { Sale } from '@/types'
import { fmtCurrency, fmtDateTime } from '@/utils/format'

interface Props {
  sale: Sale | null
}

const InvoicePrint = forwardRef<HTMLDivElement, Props>(({ sale }, ref) => {
  if (!sale) return null
  const settings = JSON.parse(localStorage.getItem('company_settings') || '{}')

  return (
    <div ref={ref} className="p-8 bg-white text-gray-900 text-sm" style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-gray-300">
        <div>
          {settings.logo_url && (
            <img src={settings.logo_url} alt="Logo" style={{ height: '60px', marginBottom: '8px' }} />
          )}
          <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>{settings.company_name || 'My Company'}</h1>
          {settings.address && <p className="text-gray-600">{settings.address}</p>}
          {settings.phone && <p className="text-gray-600">Ph: {settings.phone}</p>}
          {settings.gst_number && <p className="text-gray-600">GSTIN: {settings.gst_number}</p>}
        </div>
        <div className="text-right">
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>TAX INVOICE</h2>
          <p><strong>Invoice #:</strong> {sale.invoice_number}</p>
          <p><strong>Date:</strong> {fmtDateTime(sale.sale_date)}</p>
          <p><strong>Payment:</strong> {sale.payment_method.toUpperCase()}</p>
        </div>
      </div>

      {/* Customer details */}
      <div className="mb-6">
        <h3 style={{ fontWeight: 'bold', marginBottom: '4px' }}>Bill To:</h3>
        <p style={{ fontWeight: 'bold' }}>{sale.customer_name || 'Walk-in Customer'}</p>
      </div>

      {/* Items table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>#</th>
            <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Product</th>
            <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right' }}>Qty</th>
            <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right' }}>Unit Price</th>
            <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right' }}>GST</th>
            <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right' }}>Disc</th>
            <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item, i) => (
            <tr key={item.id}>
              <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{i + 1}</td>
              <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{item.product_name}</td>
              <td style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right' }}>{item.quantity}</td>
              <td style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right' }}>{fmtCurrency(item.unit_price)}</td>
              <td style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right' }}>{fmtCurrency(item.gst_amount)}</td>
              <td style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right' }}>{fmtCurrency(item.discount_amount)}</td>
              <td style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{fmtCurrency(item.total_amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <table style={{ width: '280px', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '4px 8px', color: '#6b7280' }}>Subtotal</td>
              <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmtCurrency(sale.subtotal)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 8px', color: '#6b7280' }}>Tax (GST)</td>
              <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmtCurrency(sale.tax_amount)}</td>
            </tr>
            {sale.discount_amount > 0 && (
              <tr>
                <td style={{ padding: '4px 8px', color: '#6b7280' }}>Discount</td>
                <td style={{ padding: '4px 8px', textAlign: 'right', color: '#dc2626' }}>-{fmtCurrency(sale.discount_amount)}</td>
              </tr>
            )}
            <tr style={{ borderTop: '2px solid #374151' }}>
              <td style={{ padding: '8px', fontWeight: 'bold', fontSize: '16px' }}>Grand Total</td>
              <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', fontSize: '16px', color: '#2563eb' }}>{fmtCurrency(sale.grand_total)}</td>
            </tr>
            {sale.change_amount > 0 && (
              <tr>
                <td style={{ padding: '4px 8px', color: '#6b7280' }}>Change</td>
                <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmtCurrency(sale.change_amount)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #d1d5db', paddingTop: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
        <p>Thank you for your business!</p>
        {settings.website && <p>{settings.website}</p>}
      </div>
    </div>
  )
})

InvoicePrint.displayName = 'InvoicePrint'
export default InvoicePrint
