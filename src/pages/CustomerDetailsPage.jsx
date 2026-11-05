import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import CustomerForm from '../components/customers/CustomerForm'
import Modal from '../components/common/Modal'
import { useToast } from '../context/ToastContext'
import { useApp } from '../context/AppContext'
import './CustomerDetailsPage.css'

function CustomerDetailsPage({ customers = [], onUpdate, onDelete }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { invoices = [], payments = [] } = useApp()
  const [editing, setEditing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const customer = customers.find((c) => String(c.id) === String(id))

  if (!customer) {
    return (
      <div className="page">
        <div className="card placeholder-card">
          <p>Customer not found.</p>
          <Link to="/customers" className="btn btn-secondary" style={{ marginTop: 16 }}>
            Back to Customers
          </Link>
        </div>
      </div>
    )
  }

  function handleSave(formData) {
    onUpdate(customer.id, formData)
    setEditing(false)
  }

  function handleConfirmDelete() {
    onDelete(customer.id)
    toast.success(`Customer "${customer.name}" deleted successfully!`)
    setShowDeleteModal(false)
    navigate('/customers')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/customers" className="customer-details-back">
            ← Back to Customers
          </Link>
          <h1>{customer.name}</h1>
        </div>
        {!editing && (
          <div className="form-actions" style={{ display: 'flex', gap: '8px' }}>
            <Link to={`/customers/${customer.id}/ledger`} className="btn btn-secondary">
              View Ledger
            </Link>
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button type="button" className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
              Delete
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <CustomerForm initialData={customer} onSave={handleSave} onCancel={() => setEditing(false)} />
      ) : (
        <div className="card customer-details-card">
          <dl className="customer-details-list">
            <div>
              <dt>Email</dt>
              <dd>{customer.email || '—'}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{customer.phone}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>{customer.address || '—'}</dd>
            </div>
          </dl>

          <div className="customer-details-future card" style={{ marginTop: '20px' }}>
            <h3>Customer Summary</h3>
            {(() => {
              const customerInvoices = invoices.filter(
                (inv) => String(inv.customerId) === String(customer.id) || inv.customerId === customer.name
              );
              const customerPayments = payments.filter((pay) =>
                customerInvoices.some((inv) => String(inv.id) === String(pay.invoiceId))
              );
              const totalBilled = customerInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
              const totalPaid = customerPayments.reduce((sum, pay) => sum + Number(pay.amount || 0), 0);
              const outstandingBalance = Math.max(0, totalBilled - totalPaid);

              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '16px' }}>
                  <div style={{ padding: '16px', background: '#1e2430', borderRadius: '8px', border: '1px solid #333947' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#9aa1af' }}>Total Billed</p>
                    <h2 style={{ margin: '8px 0 0 0', fontSize: '1.5rem', color: '#e9eaee' }}>₹{totalBilled.toFixed(2)}</h2>
                  </div>
                  <div style={{ padding: '16px', background: '#1e2430', borderRadius: '8px', border: '1px solid #333947' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#9aa1af' }}>Amount Paid</p>
                    <h2 style={{ margin: '8px 0 0 0', fontSize: '1.5rem', color: 'rgb(63, 182, 127)' }}>₹{totalPaid.toFixed(2)}</h2>
                  </div>
                  <div style={{ padding: '16px', background: outstandingBalance > 0 ? 'rgba(229, 72, 77, 0.1)' : '#1e2430', borderRadius: '8px', border: '1px solid #333947' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#9aa1af' }}>Outstanding Balance</p>
                    <h2 style={{ margin: '8px 0 0 0', fontSize: '1.5rem', color: outstandingBalance > 0 ? 'rgb(229, 72, 77)' : '#e9eaee' }}>
                      ₹{outstandingBalance.toFixed(2)}
                    </h2>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Customer"
        onConfirm={handleConfirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
        danger={true}
      >
        <p style={{ margin: 0, lineHeight: 1.6, color: 'rgb(209, 213, 219)', fontSize: '14px' }}>
          Are you sure you want to delete customer <strong style={{ color: 'rgb(233, 234, 238)' }}>{customer.name}</strong>?
        </p>
        <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'rgb(154, 161, 175)' }}>
          This will permanently delete the customer record and remove them from your active accounts.
        </p>
      </Modal>
    </div>
  )
}

export default CustomerDetailsPage
