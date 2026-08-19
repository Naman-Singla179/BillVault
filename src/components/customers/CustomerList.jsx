import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getInvoices, getPayments } from '../../services/storage'
import { calculateTotalPaid, calculatePaymentStatus } from '../../utils/paymentUtils'
import './CustomerList.css'

function CustomerList({ customers, onEdit, onDelete }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const invoices = getInvoices()
  const payments = getPayments()

  const filtered = customers.filter((c) => {
    const term = query.trim().toLowerCase()
    if (!term) return true
    return (
      c.name.toLowerCase().includes(term) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.phone && c.phone.toLowerCase().includes(term))
    )
  })

  function handleDelete(customer) {
    const confirmed = window.confirm(`Delete customer "${customer.name}"?`)
    if (confirmed) onDelete(customer.id)
  }

  function getCustomerStatus(customer) {
    const custInvoices = invoices.filter(i => String(i.customerId) === String(customer.id) || i.customerId === customer.name);
    if (custInvoices.length === 0) return { label: 'NO INVOICES', class: 'badge-muted' };

    let hasOverdue = false;
    let hasPending = false;

    custInvoices.forEach(inv => {
      const totalPaid = calculateTotalPaid(payments, inv.id);
      const status = calculatePaymentStatus(inv, totalPaid);
      if (status === 'OVERDUE') hasOverdue = true;
      if (status === 'PENDING' || status === 'PARTIALLY PAID') hasPending = true;
    });

    if (hasOverdue) return { label: 'OVERDUE', class: 'badge-danger' };
    if (hasPending) return { label: 'PENDING', class: 'badge-warning' };
    return { label: 'PAID', class: 'badge-success' };
  }

  return (
    <div className="card customer-list">
      <div className="customer-list-search">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search customers by name, email or phone"
          aria-label="Search customers"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No customers found</h3>
          <p>
            {customers.length === 0
              ? 'Add your first customer to get started.'
              : 'Try a different search term.'}
          </p>
        </div>
      ) : (
        <div className="customer-table-wrap">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Status</th>
                <th className="customer-table-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <tr key={customer.id}>
                  <td data-label="Name">{customer.name}</td>
                  <td data-label="Email">{customer.email || '—'}</td>
                  <td data-label="Phone">{customer.phone || '—'}</td>
                  <td data-label="Address">{customer.address || '—'}</td>
                  <td data-label="Status">
                    <span className={`badge ${getCustomerStatus(customer).class}`}>
                      {getCustomerStatus(customer).label}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div className="customer-table-actions">
                      <button
                        type="button"
                        className="btn-icon"
                        aria-label={`View ${customer.name}`}
                        onClick={() => navigate(`/customers/${customer.id}`)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        aria-label={`Edit ${customer.name}`}
                        onClick={() => onEdit(customer)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        aria-label={`Delete ${customer.name}`}
                        onClick={() => handleDelete(customer)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default CustomerList
