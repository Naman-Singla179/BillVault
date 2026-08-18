import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './CustomerList.css'

function CustomerList({ customers, onEdit, onDelete }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const filtered = customers.filter((c) => {
    const term = query.trim().toLowerCase()
    if (!term) return true
    return (
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.phone.toLowerCase().includes(term)
    )
  })

  function handleDelete(customer) {
    const confirmed = window.confirm(`Delete customer "${customer.name}"?`)
    if (confirmed) onDelete(customer.id)
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
                <th className="customer-table-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <tr key={customer.id}>
                  <td data-label="Name">{customer.name}</td>
                  <td data-label="Email">{customer.email || '—'}</td>
                  <td data-label="Phone">{customer.phone}</td>
                  <td data-label="Address">{customer.address || '—'}</td>
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
