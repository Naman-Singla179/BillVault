import { useParams, Link } from 'react-router-dom'
import { getInvoices, getPayments, getCustomers } from '../services/storage'
import { formatInvoiceId } from '../utils/paymentUtils'
import './CustomerLedgerPage.css'

/**
 * Formats a numeric amount to Indian Rupee (INR) currency representation.
 */
function formatINR(amount) {
  const num = Number(amount) || 0
  return '₹' + num.toLocaleString('en-IN')
}

/**
 * Calculates the total payments recorded for a specific invoice.
 */
function getInvoicePaid(payments, invoiceId) {
  if (!Array.isArray(payments)) return 0
  return payments.reduce((sum, p) => {
    if (String(p.invoiceId) === String(invoiceId)) {
      const amt = Number(p.amount)
      return sum + (isNaN(amt) ? 0 : amt)
    }
    return sum
  }, 0)
}

/**
 * Determines days overdue relative to current calendar date (normalized to midnight).
 * Returns null if the due date is missing or invalid.
 */
function getDaysOverdue(dueDateString) {
  if (!dueDateString) return null
  const due = new Date(dueDateString)
  if (isNaN(due.getTime())) return null

  const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate())
  const now = new Date()
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const diffMs = todayMidnight.getTime() - dueMidnight.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Calculates invoice aging categories based on calendar days overdue.
 * Fully paid invoices contribute zero. Partially paid contribute their unpaid balance.
 */
function calculateInvoiceAging(customerInvoices, payments) {
  const aging = {
    current: 0,
    days1to30: 0,
    days31to60: 0,
    over60: 0,
    unavailable: 0,
  }

  customerInvoices.forEach((inv) => {
    const total = Number(inv.total) || 0
    const paid = getInvoicePaid(payments, inv.id)
    const unpaid = Math.max(0, total - paid)

    if (unpaid <= 0) return // Fully paid invoices do not contribute to overdue aging

    const daysOverdue = getDaysOverdue(inv.dueDate)

    if (daysOverdue === null) {
      aging.unavailable += unpaid
    } else if (daysOverdue <= 0) {
      // Due today or in the future
      aging.current += unpaid
    } else if (daysOverdue <= 30) {
      aging.days1to30 += unpaid
    } else if (daysOverdue <= 60) {
      aging.days31to60 += unpaid
    } else {
      aging.over60 += unpaid
    }
  })

  return aging
}

/**
 * Computes the authoritative payment status for an invoice.
 */
function resolveInvoiceStatus(invoice, totalPaid) {
  const total = Number(invoice.total) || 0
  if (totalPaid >= total && total > 0) return 'PAID'
  if (totalPaid > 0) return 'PARTIALLY PAID'

  if (invoice.dueDate) {
    const days = getDaysOverdue(invoice.dueDate)
    if (days !== null && days > 0) return 'OVERDUE'
  }

  return invoice.status || 'PENDING'
}

function CustomerLedgerPage({ customers = [] }) {
  const { id } = useParams()

  const allCustomers = customers.length > 0 ? customers : getCustomers()
  const customer = allCustomers.find((c) => String(c.id) === String(id))

  const invoices = getInvoices()
  const payments = getPayments()

  if (!customer) {
    return (
      <div className="page">
        <div className="card customer-ledger-not-found">
          <h2>Customer Not Found</h2>
          <p>The requested customer does not exist or may have been deleted.</p>
          <Link to="/customers" className="customer-ledger-back-btn">
            ← Back to Customers
          </Link>
        </div>
      </div>
    )
  }

  // Filter invoices belonging to this customer (by ID or name fallback), excluding cancelled/drafts
  const customerInvoices = invoices.filter((inv) => {
    const matchesCustomer =
      String(inv.customerId) === String(customer.id) ||
      inv.customerId === customer.name
    const isNotDraft = inv.status !== 'DRAFT' && inv.status !== 'CANCELLED'
    return matchesCustomer && isNotDraft
  })

  // Feature B: Financial Summary Calculations
  const lifetimeBilled = customerInvoices.reduce(
    (sum, inv) => sum + (Number(inv.total) || 0),
    0
  )

  const paidToDate = customerInvoices.reduce(
    (sum, inv) => sum + getInvoicePaid(payments, inv.id),
    0
  )

  const outstandingBalance = customerInvoices.reduce((sum, inv) => {
    const paid = getInvoicePaid(payments, inv.id)
    return sum + Math.max(0, (Number(inv.total) || 0) - paid)
  }, 0)

  const invoiceCount = customerInvoices.length

  // Feature D: Invoice Aging Breakdown
  const aging = calculateInvoiceAging(customerInvoices, payments)

  return (
    <div className="page customer-ledger-page">
      {/* Header */}
      <div className="customer-ledger-header">
        <Link to="/customers" className="customer-ledger-back-link">
          ← Back to Customers
        </Link>
        <div className="customer-ledger-title-group">
          <h1>Customer Ledger</h1>
          <p className="customer-ledger-subtitle">
            Customer: <strong>{customer.name}</strong>
            {customer.phone ? ` • ${customer.phone}` : ''}
            {customer.email ? ` • ${customer.email}` : ''}
            {customer.address ? ` • ${customer.address}` : ''}
          </p>
        </div>
      </div>

      {/* Feature B: 4 Summary Cards */}
      <div className="customer-ledger-metrics-grid">
        <div className="card customer-ledger-metric-card">
          <span className="metric-label">Lifetime billed</span>
          <div className="metric-value">{formatINR(lifetimeBilled)}</div>
          <span className="metric-hint">{invoiceCount} total invoice{invoiceCount === 1 ? '' : 's'}</span>
        </div>

        <div className="card customer-ledger-metric-card">
          <span className="metric-label">Paid to date</span>
          <div className="metric-value metric-value-success">{formatINR(paidToDate)}</div>
          <span className="metric-hint">Verified recorded payments</span>
        </div>

        <div className="card customer-ledger-metric-card">
          <span className="metric-label">Outstanding</span>
          <div
            className={`metric-value ${
              outstandingBalance > 0 ? 'metric-value-danger' : 'metric-value-neutral'
            }`}
          >
            {formatINR(outstandingBalance)}
          </div>
          <span className="metric-hint">Remaining balance due</span>
        </div>

        <div className="card customer-ledger-metric-card">
          <span className="metric-label">Invoices</span>
          <div className="metric-value">{invoiceCount}</div>
          <span className="metric-hint">Issued to this customer</span>
        </div>
      </div>

      {/* Feature D: Invoice Aging Section */}
      <div className="card customer-ledger-section">
        <div className="section-header">
          <div>
            <h3>Invoice aging</h3>
            <p className="section-description">
              Aging breakdown of outstanding balances based on calendar days overdue.
            </p>
          </div>
          {outstandingBalance === 0 && customerInvoices.length > 0 && (
            <span className="aging-status-pill status-pill-success">
              All settled — No overdue balance
            </span>
          )}
        </div>

        <div className="customer-ledger-aging-list">
          <div className="aging-row">
            <div className="aging-row-info">
              <span className="aging-category">Not overdue / current</span>
              <span className="aging-criteria">Due today or in the future</span>
            </div>
            <div className="aging-row-amount">{formatINR(aging.current)}</div>
          </div>

          <div className="aging-row">
            <div className="aging-row-info">
              <span className="aging-category">1–30 days overdue</span>
              <span className="aging-criteria">1 to 30 calendar days past due date</span>
            </div>
            <div
              className={`aging-row-amount ${
                aging.days1to30 > 0 ? 'amount-alert' : ''
              }`}
            >
              {formatINR(aging.days1to30)}
            </div>
          </div>

          <div className="aging-row">
            <div className="aging-row-info">
              <span className="aging-category">31–60 days overdue</span>
              <span className="aging-criteria">31 to 60 calendar days past due date</span>
            </div>
            <div
              className={`aging-row-amount ${
                aging.days31to60 > 0 ? 'amount-alert' : ''
              }`}
            >
              {formatINR(aging.days31to60)}
            </div>
          </div>

          <div className="aging-row">
            <div className="aging-row-info">
              <span className="aging-category">More than 60 days overdue</span>
              <span className="aging-criteria">&gt; 60 calendar days past due date</span>
            </div>
            <div
              className={`aging-row-amount ${
                aging.over60 > 0 ? 'amount-alert' : ''
              }`}
            >
              {formatINR(aging.over60)}
            </div>
          </div>

          {aging.unavailable > 0 && (
            <div className="aging-row aging-row-unavailable">
              <div className="aging-row-info">
                <span className="aging-category">Due Date Unavailable</span>
                <span className="aging-criteria">Invoice missing valid due date</span>
              </div>
              <div className="aging-row-amount amount-alert">
                {formatINR(aging.unavailable)}
              </div>
            </div>
          )}

          <div className="aging-total-row">
            <span className="aging-total-label">Total Outstanding Balance</span>
            <span className="aging-total-amount">{formatINR(outstandingBalance)}</span>
          </div>
        </div>
      </div>

      {/* Feature C: Invoice History Table */}
      <div className="card customer-ledger-section">
        <div className="section-header">
          <div>
            <h3>Invoice history</h3>
            <p className="section-description">
              All invoices issued to {customer.name} and their payment breakdown.
            </p>
          </div>
        </div>

        {customerInvoices.length === 0 ? (
          <div className="empty-state customer-ledger-empty">
            <h3>No invoices found</h3>
            <p>No invoices have been issued for this customer yet.</p>
          </div>
        ) : (
          <div className="customer-ledger-table-wrap">
            <table className="customer-ledger-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Invoice Total</th>
                  <th>Amount Paid</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {customerInvoices.map((inv) => {
                  const total = Number(inv.total) || 0
                  const paid = getInvoicePaid(payments, inv.id)
                  const remaining = Math.max(0, total - paid)
                  const status = resolveInvoiceStatus(inv, paid)

                  let badgeClass = 'badge-pending'
                  if (status === 'PAID') badgeClass = 'badge-paid'
                  else if (status === 'PARTIALLY PAID') badgeClass = 'badge-partial'
                  else if (status === 'OVERDUE') badgeClass = 'badge-overdue'

                  return (
                    <tr key={inv.id}>
                      <td data-label="Invoice ID" className="table-invoice-id">
                        {formatInvoiceId(inv.id)}
                      </td>
                      <td data-label="Date">{inv.date || '—'}</td>
                      <td data-label="Due Date">{inv.dueDate || '—'}</td>
                      <td data-label="Invoice Total">{formatINR(total)}</td>
                      <td data-label="Amount Paid" className="table-amount-paid">
                        {formatINR(paid)}
                      </td>
                      <td
                        data-label="Outstanding"
                        className={remaining > 0 ? 'table-amount-due' : ''}
                      >
                        {formatINR(remaining)}
                      </td>
                      <td data-label="Status">
                        <span className={`ledger-status-badge ${badgeClass}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerLedgerPage
