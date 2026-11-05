import { useState, useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import CustomerForm from '../components/customers/CustomerForm'
import Modal from '../components/common/Modal'
import { useToast } from '../context/ToastContext'
import { useApp } from '../context/AppContext'
import { calculateTotalPaid, calculatePaymentStatus, formatInvoiceId } from '../utils/paymentUtils'
import { Plus, BookOpen, Edit2, Trash2, ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react'
import './CustomerDetailsPage.css'

function formatINR(amount) {
  const num = Number(amount) || 0
  return '₹' + num.toLocaleString('en-IN')
}

function CustomerDetailsPage({ customers = [], onUpdate, onDelete }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { invoices = [], payments = [] } = useApp()
  const [editing, setEditing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const customer = customers.find((c) => String(c.id) === String(id))

  // Find all invoices associated with this customer
  const customerInvoices = useMemo(() => {
    if (!customer) return []
    return invoices.filter(
      (inv) => String(inv.customerId) === String(customer.id) || inv.customerId === customer.name
    )
  }, [customer, invoices])

  // Financial calculations
  const financials = useMemo(() => {
    let totalBilled = 0
    let totalPaid = 0
    let overdueCount = 0

    const now = new Date()
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

    customerInvoices.forEach((inv) => {
      const invTotal = Number(inv.total) || 0
      const invPaid = calculateTotalPaid(payments, inv.id)
      const balance = Math.max(0, invTotal - invPaid)

      totalBilled += invTotal
      totalPaid += invPaid

      if (balance > 0 && inv.dueDate) {
        const dueDate = new Date(inv.dueDate)
        if (!isNaN(dueDate.getTime()) && dueDate.getTime() < todayMidnight) {
          overdueCount++
        }
      }
    })

    const outstanding = Math.max(0, totalBilled - totalPaid)
    return {
      totalBilled,
      totalPaid,
      outstanding,
      overdueCount,
    }
  }, [customerInvoices, payments])

  if (!customer) {
    return (
      <div className="page customer-details-page">
        <div className="card placeholder-card">
          <h2>Customer Not Found</h2>
          <p>The customer you are looking for does not exist or may have been deleted.</p>
          <Link to="/customers" className="btn btn-secondary" style={{ marginTop: 16 }}>
            ← Back to Customers
          </Link>
        </div>
      </div>
    )
  }

  const initials = (customer.name || 'C')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  function handleSave(formData) {
    onUpdate(customer.id, formData)
    toast.success(`Customer "${formData.name}" updated successfully!`)
    setEditing(false)
  }

  function handleConfirmDelete() {
    onDelete(customer.id)
    toast.success(`Customer "${customer.name}" deleted successfully!`)
    setShowDeleteModal(false)
    navigate('/customers')
  }

  return (
    <div className="page customer-details-page">
      {/* Navigation & Header */}
      <div className="customer-details-header">
        <Link to="/customers" className="customer-details-back">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Customers</span>
        </Link>

        <div className="customer-header-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/invoices/new', { state: { customerId: customer.id, customerName: customer.name } })}
          >
            <Plus size={16} aria-hidden="true" />
            <span>Create Invoice</span>
          </button>
          <Link to={`/customers/${customer.id}/ledger`} className="btn btn-secondary">
            <BookOpen size={16} aria-hidden="true" />
            <span>View Ledger</span>
          </Link>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setEditing((prev) => !prev)}
          >
            <Edit2 size={15} aria-hidden="true" />
            <span>{editing ? 'Close Edit' : 'Edit Profile'}</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-danger-action"
            onClick={() => setShowDeleteModal(true)}
            aria-label="Delete customer"
          >
            <Trash2 size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      {editing ? (
        <CustomerForm initialData={customer} onSave={handleSave} onCancel={() => setEditing(false)} />
      ) : (
        <>
          {/* Customer Profile Hero Card */}
          <div className="card customer-profile-hero">
            <div className="customer-hero-left">
              <div className="customer-hero-avatar" aria-hidden="true">{initials}</div>
              <div className="customer-hero-info">
                <h1>{customer.name}</h1>
                <div className="customer-hero-contact-chips">
                  {customer.phone && <span className="contact-chip">Phone: <strong>{customer.phone}</strong></span>}
                  {customer.email && <span className="contact-chip">Email: <strong>{customer.email}</strong></span>}
                  {customer.gstin && (
                    <span className="contact-chip gstin-chip">
                      <ShieldCheck size={14} aria-hidden="true" />
                      <span>GSTIN: <strong>{customer.gstin}</strong></span>
                    </span>
                  )}
                </div>
                {customer.address && (
                  <p className="customer-hero-address">
                    Address: {customer.address}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Customer Financial Summary Cards (Requested in Section D) */}
          <div className="customer-financial-summary-grid">
            <div className="card financial-stat-card">
              <span className="stat-label">Total Billed</span>
              <div className="stat-value">{formatINR(financials.totalBilled)}</div>
              <span className="stat-sub">{customerInvoices.length} invoices issued</span>
            </div>

            <div className="card financial-stat-card">
              <span className="stat-label">Total Paid</span>
              <div className="stat-value text-success">{formatINR(financials.totalPaid)}</div>
              <span className="stat-sub">Verified payments recorded</span>
            </div>

            <div className="card financial-stat-card">
              <span className="stat-label">Outstanding Balance</span>
              <div className={`stat-value ${financials.outstanding > 0 ? 'text-danger' : 'text-neutral'}`}>
                {formatINR(financials.outstanding)}
              </div>
              <span className="stat-sub">Pending settlement</span>
            </div>

            <div className="card financial-stat-card">
              <span className="stat-label">Overdue Invoices</span>
              <div className={`stat-value ${financials.overdueCount > 0 ? 'text-danger' : 'text-neutral'}`}>
                {financials.overdueCount}
              </div>
              <span className="stat-sub">{financials.overdueCount > 0 ? 'Action required' : 'All up to date'}</span>
            </div>
          </div>

          {/* Customer Invoices Section */}
          <div className="card customer-recent-invoices-card">
            <div className="card-section-header">
              <div>
                <h2>Invoices for {customer.name}</h2>
                <p>Recent billing history and real-time payment status.</p>
              </div>
              <Link to={`/customers/${customer.id}/ledger`} className="link-view-all">
                View Full Ledger →
              </Link>
            </div>

            {customerInvoices.length === 0 ? (
              <div className="empty-state">
                <p>No invoices have been issued for this customer yet.</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ marginTop: 12 }}
                  onClick={() => navigate('/invoices/new', { state: { customerId: customer.id, customerName: customer.name } })}
                >
                  <Plus size={16} aria-hidden="true" />
                  <span>Create First Invoice</span>
                </button>
              </div>
            ) : (
              <div className="customer-invoices-table-wrap">
                <table className="customer-invoices-table">
                  <thead>
                    <tr>
                      <th scope="col">Invoice #</th>
                      <th scope="col">Date</th>
                      <th scope="col">Due Date</th>
                      <th scope="col">Total</th>
                      <th scope="col">Paid</th>
                      <th scope="col">Balance</th>
                      <th scope="col">Status</th>
                      <th scope="col" style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerInvoices.map((inv) => {
                      const total = Number(inv.total) || 0
                      const paid = calculateTotalPaid(payments, inv.id)
                      const balance = Math.max(0, total - paid)
                      const status = calculatePaymentStatus(inv, paid)

                      let badgeClass = 'badge-pending'
                      if (status === 'PAID') badgeClass = 'badge-success'
                      else if (status === 'PARTIALLY PAID') badgeClass = 'badge-warning'
                      else if (status === 'OVERDUE') badgeClass = 'badge-danger'

                      return (
                        <tr key={inv.id}>
                          <td data-label="Invoice #">
                            <span className="invoice-num-text">{formatInvoiceId(inv.id)}</span>
                          </td>
                          <td data-label="Date">{inv.date || '—'}</td>
                          <td data-label="Due Date">{inv.dueDate || '—'}</td>
                          <td data-label="Total">{formatINR(total)}</td>
                          <td data-label="Paid" className="text-success">{formatINR(paid)}</td>
                          <td data-label="Balance" className={balance > 0 ? 'text-danger' : ''}>
                            {formatINR(balance)}
                          </td>
                          <td data-label="Status">
                            <span className={`badge ${badgeClass}`}>{status}</span>
                          </td>
                          <td data-label="Action" style={{ textAlign: 'right' }}>
                            <Link
                              to="/invoice-preview"
                              state={{ invoiceId: inv.id }}
                              className="btn-icon-view"
                              title="Preview Invoice"
                            >
                              <ExternalLink size={14} aria-hidden="true" />
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
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Customer Profile"
        onConfirm={handleConfirmDelete}
        confirmText="Confirm Delete"
        cancelText="Cancel"
        danger={true}
      >
        <p style={{ margin: 0, lineHeight: 1.6, color: 'rgb(209, 213, 219)', fontSize: '14px' }}>
          Are you sure you want to delete customer <strong style={{ color: 'rgb(233, 234, 238)' }}>{customer.name}</strong>?
        </p>
        <div style={{
          marginTop: '12px',
          padding: '10px 14px',
          background: 'rgba(217, 164, 65, 0.08)',
          border: '1px solid rgba(217, 164, 65, 0.25)',
          borderRadius: '6px',
          fontSize: '13px',
          color: 'rgb(217, 164, 65)'
        }}>
          <strong>Note:</strong> Deleting this customer will remove them from your active accounts. Historical invoices issued to them will remain preserved in your financial records.
        </div>
      </Modal>
    </div>
  )
}

export default CustomerDetailsPage
