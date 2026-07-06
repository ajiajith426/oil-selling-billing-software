import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Printer, Download, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { saleService } from '@/services/sale.service'
import { fmtCurrency, fmtDateTime } from '@/utils/format'
import { TableSkeleton } from '@/components/ui/LoadingSkeleton'
import InvoicePrint from './InvoicePrint'
import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'

const statusColors: Record<string, string> = {
  completed: 'badge-green',
  cancelled: 'badge-red',
  refunded: 'badge-yellow',
}

export default function SaleDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const printRef = useRef<HTMLDivElement>(null)

  const { data: sale, isLoading, error } = useQuery({
    queryKey: ['sale-detail', id],
    queryFn: () => saleService.get(Number(id)),
    enabled: !!id,
  })

  const cancel = useMutation({
    mutationFn: (saleId: number) => saleService.cancel(saleId),
    onSuccess: () => {
      toast.success('Sale cancelled — stock restored')
      qc.invalidateQueries({ queryKey: ['sale-detail', id] })
      qc.invalidateQueries({ queryKey: ['sales'] })
    },
  })

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  })

  const handleDownloadPDF = () => {
    if (!sale) return
    const doc = new jsPDF()

    // Title
    doc.setFontSize(22)
    doc.setTextColor(30, 41, 59)
    doc.text('MJ AGENCY', 14, 20)
    doc.setFontSize(12)
    doc.text('INVOICE / BILL OF SUPPLY', 14, 27)

    // Meta details
    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139)
    doc.text(`Invoice Number: ${sale.invoice_number}`, 14, 38)
    doc.text(`Date & Time: ${new Date(sale.sale_date).toLocaleString('en-IN')}`, 14, 44)
    doc.text(`Customer Name: ${sale.customer_name || 'Walk-in Customer'}`, 14, 50)
    doc.text(`Payment Type: ${sale.payment_method.toUpperCase()}`, 14, 56)
    doc.text(`Status: ${sale.status.toUpperCase()}`, 14, 62)

    // Items table
    const tableHeaders = ['#', 'Product', 'Qty', 'Unit Price', 'GST Amount', 'Total']
    const tableBody = sale.items.map((item, index) => [
      (index + 1).toString(),
      item.product_name || '',
      item.quantity.toString(),
      `Rs. ${item.unit_price.toFixed(2)}`,
      `Rs. ${item.gst_amount.toFixed(2)}`,
      `Rs. ${item.total_amount.toFixed(2)}`
    ])

    autoTable(doc, {
      startY: 70,
      head: [tableHeaders],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
    })

    // Summary calculation list
    const finalY = (doc as any).lastAutoTable.finalY || 80
    doc.setFontSize(10)
    doc.text(`Subtotal: Rs. ${sale.subtotal.toFixed(2)}`, 140, finalY + 12)
    doc.text(`Tax / GST: Rs. ${sale.tax_amount.toFixed(2)}`, 140, finalY + 18)
    doc.text(`Discount: Rs. ${sale.discount_amount.toFixed(2)}`, 140, finalY + 24)
    doc.setFont('helvetica', 'bold')
    doc.text(`Grand Total: Rs. ${sale.grand_total.toFixed(2)}`, 140, finalY + 32)

    doc.save(`invoice_${sale.invoice_number}.pdf`)
  }

  if (isLoading) {
    return (
      <div className="card p-6 space-y-4">
        <TableSkeleton cols={5} />
      </div>
    )
  }

  if (error || !sale) {
    return (
      <div className="card p-6 text-center text-red-500">
        Sale transaction not found or loading failed.
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top action header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/sales')} className="btn-secondary py-2 px-3">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold dark:text-white">Sale Detail</h1>
            <p className="text-sm text-gray-500">Invoice: {sale.invoice_number}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDownloadPDF} className="btn-outline flex items-center gap-1.5 py-2">
            <Download size={15} /> Download PDF
          </button>
          <button onClick={handlePrint} className="btn-outline flex items-center gap-1.5 py-2">
            <Printer size={15} /> Print
          </button>
          {sale.status === 'completed' && (
            <button
              onClick={() => {
                if (window.confirm('Cancel this sale? Stock will be restored.')) {
                  cancel.mutate(sale.id)
                }
              }}
              className="btn-danger flex items-center gap-1.5 py-2"
            >
              <XCircle size={15} /> Cancel Sale
            </button>
          )}
        </div>
      </div>

      {/* Invoice Card Detail */}
      <div className="card p-6 space-y-6 max-w-4xl">
        <div className="flex justify-between border-b pb-4 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-bold dark:text-white">MJ Agency</h2>
            <p className="text-sm text-gray-500">Oil Selling & Billing System</p>
          </div>
          <div className="text-right">
            <span className={`inline-block font-mono text-sm font-semibold mb-1 ${statusColors[sale.status]}`}>
              {sale.status.toUpperCase()}
            </span>
            <p className="text-xs text-gray-400">Date: {fmtDateTime(sale.sale_date)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <p className="text-gray-400 font-medium">Customer</p>
            <p className="font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{sale.customer_name || 'Walk-in Customer'}</p>
          </div>
          <div>
            <p className="text-gray-400 font-medium">Invoice Number</p>
            <p className="font-semibold text-gray-700 dark:text-gray-200 mt-0.5 font-mono">{sale.invoice_number}</p>
          </div>
          <div>
            <p className="text-gray-400 font-medium">Payment Mode</p>
            <p className="font-semibold text-gray-700 dark:text-gray-200 mt-0.5 capitalize">{sale.payment_method === 'credit' ? 'Credit / Kadan' : sale.payment_method}</p>
          </div>
          <div>
            <p className="text-gray-400 font-medium">Grand Total</p>
            <p className="font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{fmtCurrency(sale.grand_total)}</p>
          </div>
        </div>

        {/* Invoice items table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>GST Amount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, i) => (
                <tr key={item.id}>
                  <td className="text-gray-400">{i + 1}</td>
                  <td className="font-medium dark:text-white">{item.product_name}</td>
                  <td>{item.quantity}</td>
                  <td>{fmtCurrency(item.unit_price)}</td>
                  <td>{fmtCurrency(item.gst_amount)}</td>
                  <td className="font-semibold text-gray-700 dark:text-gray-200">{fmtCurrency(item.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invoice Summary Totals */}
        <div className="flex justify-end pt-4">
          <div className="w-80 space-y-2 border-t pt-4 dark:border-gray-800 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium dark:text-white">{fmtCurrency(sale.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">GST Tax</span>
              <span className="font-medium dark:text-white">{fmtCurrency(sale.tax_amount)}</span>
            </div>
            <div className="flex justify-between text-red-500">
              <span>Discount</span>
              <span className="font-medium">-{fmtCurrency(sale.discount_amount)}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t pt-2 dark:border-gray-800">
              <span className="dark:text-white">Total Amount</span>
              <span className="text-blue-600 dark:text-blue-400">{fmtCurrency(sale.grand_total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden print element */}
      <div className="hidden">
        <InvoicePrint ref={printRef} sale={sale} />
      </div>
    </div>
  )
}
