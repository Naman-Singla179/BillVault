import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getInvoices, getPayments } from '../../services/storage'
import { calculateTotalPaid, calculatePaymentStatus } from '../../utils/paymentUtils'
import Modal from '../common/Modal'
import { useToast } from '../../context/ToastContext'
import './CustomerList.css'

// Number of customer records to display per page
const ITEMS_PER_PAGE = 10

/**
 * Calculates Damerau-Levenshtein distance between two strings.
 * Accounts for insertions, deletions, substitutions, and adjacent transpositions.
 */
function getLevenshteinDistance(a, b) {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,       // deletion
        dp[i][j - 1] + 1,       // insertion
        dp[i - 1][j - 1] + cost // substitution
      )
      // Adjacent character transposition
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1)
      }
    }
  }

  return dp[m][n]
}

/**
 * Determines acceptable edit distance threshold based on term length:
 * - <= 2 characters: exact substring required (no typos allowed)
 * - 3 to 5 characters: 1 typo allowed
 * - 6+ characters: up to 2 typos allowed
 */
function getMaxAllowedDistance(length) {
  if (length >= 6) return 2
  if (length >= 3) return 1
  return 0
}

/**
 * Checks whether a customer name matches a search term:
 * 1. Case-insensitive substring match
 * 2. Full-phrase fuzzy match with typo tolerance
 * 3. Token-by-token matching across words in the name
 */
function matchesCustomerName(customerName, term) {
  if (!customerName) return false
  const normName = customerName.toLowerCase().trim()
  if (!normName) return false

  // 1. Direct partial substring match
  if (normName.includes(term)) return true

  // 2. Full-phrase fuzzy match
  const fullMaxDist = getMaxAllowedDistance(term.length)
  if (fullMaxDist > 0 && getLevenshteinDistance(normName, term) <= fullMaxDist) {
    return true
  }

  // 3. Token/word-level matching
  const queryWords = term.split(/\s+/).filter(Boolean)
  const nameWords = normName.split(/\s+/).filter(Boolean)

  if (queryWords.length > 0) {
    const allWordsMatch = queryWords.every((qWord) => {
      const qDist = getMaxAllowedDistance(qWord.length)
      return nameWords.some((nWord) => {
        if (nWord.includes(qWord)) return true
        return qDist > 0 && getLevenshteinDistance(nWord, qWord) <= qDist
      })
    })
    if (allWordsMatch) return true
  }

  return false
}

function CustomerList({ customers, onEdit, onDelete }) {
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [customerToDelete, setCustomerToDelete] = useState(null)
  const navigate = useNavigate()
  const toast = useToast()

  const invoices = getInvoices()
  const payments = getPayments()

  // 1. Filter customers by query (name with fuzzy matching, email & phone with substring matching)
  const filtered = customers.filter((c) => {
    const term = query.trim().toLowerCase()
    if (!term) return true

    const matchesName = matchesCustomerName(c.name, term)
    const matchesEmail = c.email && c.email.toLowerCase().includes(term)
    const matchesPhone = c.phone && c.phone.toLowerCase().includes(term)

    return matchesName || matchesEmail || matchesPhone
  })

  // 2. Calculate pagination metrics from filtered results
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE
  const paginatedCustomers = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  function handleSearchChange(e) {
    setQuery(e.target.value)
    setCurrentPage(1) // Reset pagination to page 1 whenever search query changes
  }

  function handleConfirmDelete() {
    if (!customerToDelete) return
    onDelete(customerToDelete.id)
    toast.success(`Customer "${customerToDelete.name}" deleted successfully!`)
    const remainingCount = filtered.length - 1
    const newTotalPages = Math.max(1, Math.ceil(remainingCount / ITEMS_PER_PAGE))
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages)
    }
    setCustomerToDelete(null)
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
          onChange={handleSearchChange}
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
              : `No customers matched "${query.trim()}". Try a different search term or check spelling.`}
          </p>
        </div>
      ) : (
        <>
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
                {paginatedCustomers.map((customer) => (
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
                          aria-label={`View Ledger for ${customer.name}`}
                          onClick={() => navigate(`/customers/${customer.id}/ledger`)}
                        >
                          Ledger
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
                          onClick={() => setCustomerToDelete(customer)}
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

          <div className="customer-pagination">
            <div className="pagination-info">
              Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} of {filtered.length} {filtered.length === 1 ? 'customer' : 'customers'}
            </div>
            <div className="pagination-controls">
              <button
                type="button"
                className="pagination-btn"
                onClick={() => setCurrentPage(validCurrentPage - 1)}
                disabled={validCurrentPage <= 1}
                aria-label="Previous page"
              >
                Previous
              </button>
              <div className="pagination-pills">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`pagination-pill ${validCurrentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                    aria-label={`Go to page ${pageNum}`}
                    aria-current={validCurrentPage === pageNum ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="pagination-btn"
                onClick={() => setCurrentPage(validCurrentPage + 1)}
                disabled={validCurrentPage >= totalPages}
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(customerToDelete)}
        onClose={() => setCustomerToDelete(null)}
        title="Delete Customer"
        onConfirm={handleConfirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
        danger={true}
      >
        <p style={{ margin: 0, lineHeight: 1.6, color: 'rgb(209, 213, 219)', fontSize: '14px' }}>
          Are you sure you want to delete customer <strong style={{ color: 'rgb(233, 234, 238)' }}>{customerToDelete?.name}</strong>?
        </p>
        <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'rgb(154, 161, 175)' }}>
          This action cannot be undone. Customer data will be removed.
        </p>
      </Modal>
    </div>
  )
}

export default CustomerList
