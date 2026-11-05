import { useParams, Link } from 'react-router-dom'
import { getInvoices, getPayments, getCustomers } from '../services/storage'
import { formatInvoiceId } from '../utils/paymentUtils'
import { ArrowLeft, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react'
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
 * Returns positive integer for overdue, 0 for today, negative for future due date, null if invalid.
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
 * Categorized into 5 buckets: Current, 1-30 days, 31-60 days, 61-90 days, 90+ days.
 */
function calculateInvoiceAging(customerInvoices, payments) {
  const aging = {
    current: 0,
    days1to30: 0,
    days31to60: 0,
    days61to90: 0,
    over90: 0,
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
    } else if (daysOverdue <= 90) {
      aging.days61to90 += unpaid
    } else {
      aging.over90 += unpaid
    }
  })

  return aging
}

/**
 * Computes payment status for an invoice.
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
      <div className="page customer-ledger-page">
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

  // Filter invoices belonging to this customer
  const customerInvoices = invoices.filter((inv) => {
    const matchesCustomer =
      String(inv.customerId) === String(customer.id) ||
      inv.customerId === customer.name
    const isNotDraft = inv.status !== 'DRAFT' && inv.status !== 'CANCELLED'
    return matchesCustomer && isNotDraft
  })

  // Lifetime Financial Metrics (Section E.2, E.3, E.4, E.5)
  const lifetimeBilled = customerInvoices.reduce(
    (sum, inv) => sum + (Number(inv.total) || 0),
    0
  )

  const paidToDate = customerInvoices.reduce(
    (sum, inv) => sum + getInvoicePaid(payments, inv.id),
    0
  )

  const outstandingBalance = Math.max(0, lifetimeBilled - paidToDate)
  const invoiceCount = customerInvoices.length

  // Invoice Aging Breakdown (Section F)
  const aging = calculateInvoiceAging(customerInvoices, payments)

  return (
    <div className="page customer-ledger-page">
      {/* Header */}
      <div className="customer-ledger-header">
        <Link to={`/customers/${customer.id}`} className="customer-ledger-back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to {customer.name} Profile</span>
        </Link>
        <div className="customer-ledger-title-group">
          <h1>Financial Ledger & Account Statement</h1>
          <p className="customer-ledger-subtitle">
            Customer: <strong>{customer.name}</strong>
            {customer.phone ? ` • ${customer.phone}` : ''}
            {customer.email ? ` • ${customer.email}` : ''}
            {customer.gstin ? (
              <span className="ledger-gstin-tag">
                <ShieldCheck size={12} aria-hidden="true" /> GSTIN: {customer.gstin}
              </span>
            ) : null}
          </p>
        </div>
      </div>

      {/* 4 Summary Cards (Section E) */}
      <div className="customer-ledger-metrics-grid">
        <div className="card customer-ledger-metric-card">
          <span className="metric-label">Lifetime Billed</span>
          <div className="metric-value">{formatINR(lifetimeBilled)}</div>
          <span className="metric-hint">{invoiceCount} total invoice{invoiceCount === 1 ? '' : 's'}</span>
        </div>

        <div className="card customer-ledger-metric-card">
          <span className="metric-label">Paid to Date</span>
          <div className="metric-value metric-value-success">{formatINR(paidToDate)}</div>
          <span className="metric-hint">Verified recorded settlements</span>
        </div>

        <div className="card customer-ledger-metric-card">
          <span className="metric-label">Outstanding Balance</span>
          <div
            className={`metric-value ${
              outstandingBalance > 0 ? 'metric-value-danger' : 'metric-value-neutral'
            }`}
          >
            {formatINR(outstandingBalance)}
          </div>
          <span className="metric-hint">
            {outstandingBalance > 0 ? 'Remaining balance due' : 'All accounts settled'}
          </span>
        </div>

        <div className="card customer-ledger-metric-card">
          <span className="metric-label">Total Invoices</span>
          <div className="metric-value">{invoiceCount}</div>
          <span className="metric-hint">Cumulative transactions</span>
        </div>
      </div>

      {/* Overdue Aging Section (Section F: 1-30, 31-60, 61-90, 90+ days) */}
      <div className="card customer-ledger-section">
        <div className="section-header">
          <div>
            <h3>Overdue Aging Breakdown</h3>
            <p className="section-description">
              Analysis of unpaid balances classified by days past due date (Formula: Today − Due Date).
            </p>
          </div>
          {outstandingBalance === 0 && customerInvoices.length > 0 && (
            <span className="aging-status-pill status-pill-success">
              All settled — No overdue receivables
            </span>
          )}
        </div>

        <div className="customer-ledger-aging-list">
          {/* Current */}
          <div className="aging-row">
            <div className="aging-row-info">
              <span className="aging-category">Current / Not Overdue</span>
              <span className="aging-criteria">Due today or in the future</span>
            </div>
            <div className="aging-row-amount">{formatINR(aging.current)}</div>
          </div>

          {/* 1–30 Days */}
          <div className="aging-row">
            <div className="aging-row-info">
              <span className="aging-category">1–30 Days Overdue</span>
              <span className="aging-criteria">1 to 30 calendar days past due date</span>
            </div>
            <div className={`aging-row-amount ${aging.days1to30 > 0 ? 'amount-alert' : ''}`}>
              {formatINR(aging.days1to30)}
            </div>
          </div>

          {/* 31–60 Days */}
          <div className="aging-row">
            <div className="aging-row-info">
              <span className="aging-category">31–60 Days Overdue</span>
              <span className="aging-criteria">31 to 60 calendar days past due date</span>
            </div>
            <div className={`aging-row-amount ${aging.days31to60 > 0 ? 'amount-alert' : ''}`}>
              {formatINR(aging.days31to60)}
            </div>
          </div>

          {/* 61–90 Days */}
          <div className="aging-row">
            <div className="aging-row-info">
              <span className="aging-category">61–90 Days Overdue</span>
              <span className="aging-criteria">61 to 90 calendar days past due date</span>
            </div>
            <div className={`aging-row-amount ${aging.days61to90 > 0 ? 'amount-alert' : ''}`}>
              {formatINR(aging.days61to90)}
            </div>
          </div>

          {/* More than 90 Days */}
          <div className="aging-row">
            <div className="aging-row-info">
              <span className="aging-category">More Than 90 Days Overdue</span>
              <span className="aging-criteria">&gt; 90 calendar days past due (High priority collection)</span>
            </div>
            <div className={`aging-row-amount ${aging.over90 > 0 ? 'amount-alert amount-critical' : ''}`}>
              {formatINR(aging.over90)}
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

      {/* Invoice History Table (Section E.1) */}
      <div className="card customer-ledger-section">
        <div className="section-header">
          <div>
            <h3>Invoice History & Statement of Account</h3>
            <p className="section-description">
              Itemized record of all invoices generated for {customer.name} and their payment status.
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
            <table className="customer-ledger-table" aria-label="Customer invoice history">
              <thead>
                <tr>
                  <th scope="col">Invoice ID</th>
                  <th scope="col">Invoice Date</th>
                  <th scope="col">Due Date</th>
                  <th scope="col">Overdue Aging</th>
                  <th scope="col">Total Amount</th>
                  <th scope="col">Amount Paid</th>
                  <th scope="col">Outstanding</th>
                  <th scope="col">Status</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {customerInvoices.map((inv) => {
                  const total = Number(inv.total) || 0
                  const paid = getInvoicePaid(payments, inv.id)
                  const remaining = Math.max(0, total - paid)
                  const status = resolveInvoiceStatus(inv, paid)
                  const daysOverdue = getDaysOverdue(inv.dueDate)

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
                      
                      {/* Overdue column as requested in prompt Section F */}
                      <td data-label="Overdue Aging">
                        {remaining === 0 ? (
                          <span className="aging-tag aging-tag-settled">Paid</span>
                        ) : daysOverdue === null ? (
                          <span className="aging-tag">—</span>
                        ) : daysOverdue > 0 ? (
                          <span className="aging-tag aging-tag-overdue">
                            <AlertCircle size={12} aria-hidden="true" />
                            <span>{daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue</span>
                          </span>
                        ) : daysOverdue === 0 ? (
                          <span className="aging-tag aging-tag-warning">Due today</span>
                        ) : (
                          <span className="aging-tag aging-tag-ok">
                            Due in {Math.abs(daysOverdue)} days
                          </span>
                        )}
                      </td>

                      <td data-label="Total">{formatINR(total)}</td>
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
                      <td data-label="Action" style={{ textAlign: 'right' }}>
                        <Link
                          to="/invoice-preview"
                          state={{ invoiceId: inv.id }}
                          className="btn-icon-view"
                          title="View Invoice Document"
                        >
                          <ExternalLink size={13} aria-hidden="true" />
                          <span>View</span>
                        </Link>
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
