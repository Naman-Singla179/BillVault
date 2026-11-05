import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import InvoicePreview from '../components/invoices/InvoicePreview'
import { useApp } from '../context/AppContext'
import { CONSTRUCTION_DEMO_BUSINESS } from '../services/demoData'
import { formatInvoiceId } from '../utils/paymentUtils'

const FALLBACK_CONSTRUCTION_INVOICE = {
  id: 'INV-0001',
  number: 'INV-0001',
  date: '2026-09-05',
  dueDate: '2026-09-20',
  subtotal: 200000,
  tax: 18,
  discount: 5000,
  total: 231000,
  status: 'PAID',
}

const FALLBACK_CONSTRUCTION_ITEMS = [
  { id: 1, name: 'Fe-550D TMT Steel Rebars (12mm, Metric Ton)', quantity: 2, price: 62000, amount: '₹1,24,000' },
  { id: 2, name: 'UltraTech Super PPC Cement (50kg Bag)', quantity: 200, price: 380, amount: '₹76,000' },
]

const FALLBACK_CONSTRUCTION_CUSTOMER = {
  name: 'Skyline Heights Developers',
  email: 'projects@skylineheights.in',
  phone: '9814123456',
  address: 'Tower A, Skyline Enclave, VIP Road, Zirakpur, Punjab 140603',
}

function InvoicePreviewPage() {
  const location = useLocation()
  const { invoices = [], customers = [], businessProfile } = useApp()

  const requestedId = location.state?.invoiceId
  const [selectedId, setSelectedId] = useState(requestedId || (invoices[0]?.id ?? ''))

  useEffect(() => {
    if (requestedId) {
      setSelectedId(requestedId)
    } else if (invoices.length > 0 && !selectedId) {
      setSelectedId(invoices[0].id)
    }
  }, [requestedId, invoices])

  const activeInvoice = invoices.find((inv) => String(inv.id) === String(selectedId)) || invoices[0] || FALLBACK_CONSTRUCTION_INVOICE
  const activeCustomer = activeInvoice?.customerId
    ? (customers.find((c) => String(c.id) === String(activeInvoice.customerId) || c.name === activeInvoice.customerId) || {
        name: activeInvoice.customerName || 'Customer',
        phone: activeInvoice.customerPhone || '—',
        email: activeInvoice.customerEmail || '—',
        address: activeInvoice.customerAddress || '—',
      })
    : FALLBACK_CONSTRUCTION_CUSTOMER

  const activeBusiness = (businessProfile && businessProfile.name) ? businessProfile : CONSTRUCTION_DEMO_BUSINESS
  const activeItems = activeInvoice?.items && activeInvoice.items.length > 0
    ? activeInvoice.items
    : FALLBACK_CONSTRUCTION_ITEMS

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Link to="/invoices" style={{ color: 'rgb(217, 164, 65)', textDecoration: 'none', fontSize: '14px', display: 'inline-block', marginBottom: '8px' }}>
            ← Back to Invoices
          </Link>
          <h1 style={{ margin: 0 }}>Invoice Preview</h1>
          <p style={{ margin: '4px 0 0', color: 'rgb(154, 161, 175)' }}>
            Viewing invoice: <strong style={{ color: '#e9eaee' }}>{formatInvoiceId(activeInvoice.id || activeInvoice.number)}</strong>
          </p>
        </div>

        {invoices.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label htmlFor="preview-select" style={{ fontSize: '13px', color: 'rgb(154, 161, 175)' }}>Switch Invoice:</label>
            <select
              id="preview-select"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              style={{
                background: '#1a1f2c',
                color: '#e9eaee',
                border: '1px solid #333947',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '13px',
              }}
            >
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {formatInvoiceId(inv.id)} — {inv.customerName || inv.customerId || 'Customer'} (₹{Number(inv.total || 0).toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <InvoicePreview
        business={activeBusiness}
        customer={activeCustomer}
        invoice={activeInvoice}
        items={activeItems}
      />
    </div>
  )
}

export default InvoicePreviewPage
