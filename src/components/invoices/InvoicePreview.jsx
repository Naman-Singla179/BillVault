import './InvoicePreview.css'
import UpiQrCode from '../payment/UpiQrCode'
import { useApp } from '../../context/AppContext'
import { calculateTotalPaid, formatInvoiceId } from '../../utils/paymentUtils'

function InvoicePreview({ business, customer, invoice, items }) {
  const { payments } = useApp()

  function handlePrint() {
    window.print()
  }

  const rawTotal = typeof invoice?.total === 'number'
    ? invoice.total
    : parseFloat(String(invoice?.total || '0').replace(/[^0-9.-]+/g, '')) || 0
  const invoiceId = invoice?.id || invoice?.number || ''
  const remaining = Math.max(0, rawTotal - calculateTotalPaid(payments, invoiceId))

  const statusUpper = (invoice?.status || invoice?.paymentStatus || 'PENDING').toUpperCase()
  let badgeClass = 'badge-warning'
  if (statusUpper === 'PAID') badgeClass = 'badge-success'
  else if (statusUpper === 'OVERDUE') badgeClass = 'badge-danger'
  else if (statusUpper === 'DRAFT') badgeClass = 'badge-muted'

  const subtotalFormatted = typeof invoice?.subtotal === 'number'
    ? `₹${invoice.subtotal.toLocaleString('en-IN')}`
    : (invoice?.subtotal ?? '—')

  const taxFormatted = typeof invoice?.tax === 'number'
    ? `${invoice.tax}% (₹${Math.round((Number(invoice.subtotal || 0) * invoice.tax) / 100).toLocaleString('en-IN')})`
    : (invoice?.tax ?? '—')

  const discountFormatted = typeof invoice?.discount === 'number'
    ? `−₹${invoice.discount.toLocaleString('en-IN')}`
    : (invoice?.discount ?? '—')

  const totalFormatted = typeof invoice?.total === 'number'
    ? `₹${invoice.total.toLocaleString('en-IN')}`
    : (invoice?.total ?? '—')

  return (
    <div className="invoice-preview-wrap">
      <div className="invoice-preview-toolbar">
        <button type="button" className="btn btn-primary" onClick={handlePrint}>
          Print / Save as PDF
        </button>
      </div>

      <div className="card invoice-preview">
        <header className="invoice-preview-header">
          <div className="invoice-preview-brand">
            <span className="invoice-preview-brand-mark">BV</span>
            <span>BillVault</span>
          </div>
          <div className="invoice-preview-meta">
            <h2>INVOICE</h2>
            <p>Invoice #{formatInvoiceId(invoice?.number || invoice?.id || '—')}</p>
            <p>Date: {invoice?.date ?? '—'}</p>
            {invoice?.dueDate && <p>Due Date: {invoice.dueDate}</p>}
          </div>
        </header>

        <section className="invoice-preview-parties">
          <div>
            <span className="invoice-preview-label">From</span>
            <p className="invoice-preview-party-name">{business?.name || 'Your Business Name'}</p>
            <p>{business?.address || 'Business address'}</p>
            <p>{business?.phone || '—'}</p>
            <p>{business?.email || '—'}</p>
            {business?.gstin && <p>GSTIN: {business.gstin}</p>}
          </div>
          <div>
            <span className="invoice-preview-label">Bill To</span>
            <p className="invoice-preview-party-name">{customer?.name || invoice?.customerName || 'Customer Name'}</p>
            <p>{customer?.address || invoice?.customerAddress || 'Customer address'}</p>
            <p>{customer?.phone || invoice?.customerPhone || '—'}</p>
            <p>{customer?.email || invoice?.customerEmail || '—'}</p>
          </div>
        </section>

        <section className="invoice-preview-items">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th className="invoice-preview-num">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items && items.length > 0 ? (
                items.map((item, index) => {
                  const qty = Number(item.quantity) || 1
                  const priceNum = Number(item.price) || 0
                  const lineTotal = item.amount
                    ? (typeof item.amount === 'number' ? `₹${item.amount.toLocaleString('en-IN')}` : item.amount)
                    : `₹${(qty * priceNum).toLocaleString('en-IN')}`
                  const priceStr = typeof item.price === 'number'
                    ? `₹${item.price.toLocaleString('en-IN')}`
                    : (item.price || `₹${priceNum}`)

                  return (
                    <tr key={item.id ?? index}>
                      <td>{item.name || item.description || 'Line Item'}</td>
                      <td>{qty}</td>
                      <td>{priceStr}</td>
                      <td className="invoice-preview-num">{lineTotal}</td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="4" className="invoice-preview-empty">
                    No items added yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="invoice-preview-summary">
          <div className="invoice-preview-summary-row">
            <span>Subtotal</span>
            <span>{subtotalFormatted}</span>
          </div>
          <div className="invoice-preview-summary-row">
            <span>GST Tax</span>
            <span>{taxFormatted}</span>
          </div>
          <div className="invoice-preview-summary-row">
            <span>Discount</span>
            <span>{discountFormatted}</span>
          </div>
          <div className="invoice-preview-summary-row invoice-preview-summary-total">
            <span>Total</span>
            <span>{totalFormatted}</span>
          </div>
        </section>

        <footer className="invoice-preview-footer">
          <span className={`badge ${badgeClass}`}>
            {statusUpper}
          </span>
          {remaining > 0 && <UpiQrCode amount={remaining} invoiceId={invoiceId} />}
          {business?.upiId && <p className="invoice-preview-upi">Pay via UPI: {business.upiId}</p>}
        </footer>
      </div>
    </div>
  )
}

export default InvoicePreview
