import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import CustomerForm from '../components/customers/CustomerForm'
import { getInvoices, getPayments } from '../services/storage'
import './CustomerDetailsPage.css'

function CustomerDetailsPage({ customers, onUpdate, onDelete }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [invoices] = useState(() => getInvoices())
  const [payments] = useState(() => getPayments())

  const customer = customers.find((c) => String(c.id) === id)

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

  function handleDelete() {
    const confirmed = window.confirm(`Delete customer "${customer.name}"?`)
    if (confirmed) {
      onDelete(customer.id)
      navigate('/customers')
    }
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
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button type="button" className="btn btn-danger" onClick={handleDelete}>
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
              const customerInvoices = invoices.filter(inv => String(inv.customerId) === String(customer.id));
              const customerPayments = payments.filter(pay => customerInvoices.some(inv => inv.id === pay.invoiceId));
              const totalBilled = customerInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
              const totalPaid = customerPayments.reduce((sum, pay) => sum + Number(pay.amount), 0);
              const outstandingBalance = totalBilled - totalPaid;
              
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '16px' }}>
                  <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Total Billed</p>
                    <h2 style={{ margin: '8px 0 0 0', fontSize: '1.5rem', color: '#000' }}>₹{totalBilled.toFixed(2)}</h2>
                  </div>
                  <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Amount Paid</p>
                    <h2 style={{ margin: '8px 0 0 0', fontSize: '1.5rem', color: 'green' }}>₹{totalPaid.toFixed(2)}</h2>
                  </div>
                  <div style={{ padding: '16px', background: outstandingBalance > 0 ? '#fff0f0' : '#f5f5f5', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Outstanding Balance</p>
                    <h2 style={{ margin: '8px 0 0 0', fontSize: '1.5rem', color: outstandingBalance > 0 ? 'red' : '#000' }}>₹{outstandingBalance.toFixed(2)}</h2>
                  </div>
                </div>
              );
            })()}
            

          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerDetailsPage
