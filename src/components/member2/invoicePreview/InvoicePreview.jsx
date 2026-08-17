import './InvoicePreview.css'


function InvoicePreview({ business, customer, invoice, items }) {
  function handlePrint() {
    window.print()
  }

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
            <p>Invoice #{invoice?.number ?? '—'}</p>
            <p>Date: {invoice?.date ?? '—'}</p>
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
            <p className="invoice-preview-party-name">{customer?.name || 'Customer Name'}</p>
            <p>{customer?.address || 'Customer address'}</p>
            <p>{customer?.phone || '—'}</p>
            <p>{customer?.email || '—'}</p>
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
                items.map((item, index) => (
                  <tr key={item.id ?? index}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price}</td>
                    <td className="invoice-preview-num">{item.amount}</td>
                  </tr>
                ))
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
            <span>{invoice?.subtotal ?? '—'}</span>
          </div>
          <div className="invoice-preview-summary-row">
            <span>Tax</span>
            <span>{invoice?.tax ?? '—'}</span>
          </div>
          <div className="invoice-preview-summary-row">
            <span>Discount</span>
            <span>{invoice?.discount ?? '—'}</span>
          </div>
          <div className="invoice-preview-summary-row invoice-preview-summary-total">
            <span>Total</span>
            <span>{invoice?.total ?? '—'}</span>
          </div>
        </section>

        <footer className="invoice-preview-footer">
          <span
            className={`badge ${
              invoice?.paymentStatus === 'paid'
                ? 'badge-success'
                : invoice?.paymentStatus === 'overdue'
                ? 'badge-danger'
                : 'badge-warning'
            }`}
          >
            {invoice?.paymentStatus
              ? invoice.paymentStatus.charAt(0).toUpperCase() + invoice.paymentStatus.slice(1)
              : 'Payment status pending'}
          </span>
          {business?.upiId && <p className="invoice-preview-upi">Pay via UPI: {business.upiId}</p>}
        </footer>
      </div>
    </div>
  )
}

export default InvoicePreview
