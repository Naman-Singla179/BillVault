import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import CustomerForm from '../../components/member2/customers/CustomerForm'
import './CustomerDetailsPage.css'

function CustomerDetailsPage({ customers, onUpdate, onDelete }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)

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

          <div className="customer-details-future card">
            <h3>Coming soon</h3>
            <p>
              Outstanding balance, payment history and customer notes will appear here once
              Invoice Core and Payment Core are connected.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerDetailsPage
