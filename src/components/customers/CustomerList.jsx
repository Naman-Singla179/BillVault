import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getInvoices, getPayments } from '../../services/storage'
import { calculateTotalPaid, calculatePaymentStatus } from '../../utils/paymentUtils'
import Modal from '../common/Modal'
import { useToast } from '../../context/ToastContext'
import { Search, X, Eye, BookOpen, Edit2, Trash2 } from 'lucide-react'
import './CustomerList.css'

const ITEMS_PER_PAGE = 10

/**
 * Calculates Damerau-Levenshtein edit distance between two strings.
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
 * Determines acceptable edit distance threshold based on token length:
 * - <= 2 chars: exact substring required (no typos)
 * - 3 to 5 chars: 1 typo allowed (e.g. "Rahu" -> "Rahul")
 * - 6+ chars: up to 2 typos allowed (e.g. "Rahuul" -> "Rahul")
 */
function getMaxAllowedDistance(length) {
  if (length >= 6) return 2
  if (length >= 3) return 1
  return 0
}

/**
 * Checks whether a customer name matches a search term:
 * 1. Direct partial substring
 * 2. Full-phrase fuzzy match with typo tolerance
 * 3. Token-by-token matching across words in the name
 */
function matchesCustomerFuzzy(customer, rawTerm) {
  const term = rawTerm.toLowerCase().trim()
  if (!term) return true

  // 1. Check exact/substring matches on phone, email, gstin, address
  if (customer.phone && customer.phone.replace(/\D/g, '').includes(term.replace(/\D/g, ''))) return true
  if (customer.email && customer.email.toLowerCase().includes(term)) return true
  if (customer.gstin && customer.gstin.toLowerCase().includes(term)) return true
  if (customer.address && customer.address.toLowerCase().includes(term)) return true

  // 2. Fuzzy name matching
  const normName = (customer.name || '').toLowerCase().trim()
  if (!normName) return false

  // Substring in name
  if (normName.includes(term)) return true

  // Full-name Levenshtein
  const fullMaxDist = getMaxAllowedDistance(term.length)
  if (fullMaxDist > 0 && getLevenshteinDistance(normName, term) <= fullMaxDist) {
    return true
  }

  // Token-by-token comparison
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

function formatINR(amount) {
  const num = Number(amount) || 0
  return '₹' + num.toLocaleString('en-IN')
}

function CustomerList({ customers = [], onEdit, onDelete }) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [customerToDelete, setCustomerToDelete] = useState(null)
  const navigate = useNavigate()
  const toast = useToast()

  const invoices = getInvoices()
  const payments = getPayments()

  // Calculate customer financial metrics
  const customerFinancials = useMemo(() => {
    const map = new Map()

    customers.forEach((c) => {
      const custInvoices = invoices.filter(
        (i) => String(i.customerId) === String(c.id) || i.customerId === c.name
      )

      let totalBilled = 0
      let totalPaid = 0
      let hasOverdue = false
      let hasPending = false

      custInvoices.forEach((inv) => {
        const invTotal = Number(inv.total) || 0
        const invPaid = calculateTotalPaid(payments, inv.id)
        totalBilled += invTotal
        totalPaid += invPaid

        const status = calculatePaymentStatus(inv, invPaid)
        if (status === 'OVERDUE') hasOverdue = true
        if (status === 'PENDING' || status === 'PARTIALLY PAID') hasPending = true
      })

      const outstanding = Math.max(0, totalBilled - totalPaid)

      let statusBadge = { label: 'NO INVOICES', class: 'badge-muted' }
      if (custInvoices.length > 0) {
        if (hasOverdue) statusBadge = { label: 'OVERDUE', class: 'badge-danger' }
        else if (hasPending) statusBadge = { label: 'PENDING', class: 'badge-warning' }
        else statusBadge = { label: 'PAID', class: 'badge-success' }
      }

      map.set(String(c.id), {
        totalBilled,
        totalPaid,
        outstanding,
        invoiceCount: custInvoices.length,
        statusBadge,
      })
    })

    return map
  }, [customers, invoices, payments])

  // Filter customers by query and status
  const filtered = useMemo(() => {
    return customers.filter((c) => {
      // 1. Fuzzy search
      if (!matchesCustomerFuzzy(c, query)) {
        return false
      }

      // 2. Status filter
      if (statusFilter !== 'All') {
        const stats = customerFinancials.get(String(c.id))
        const badgeLabel = stats?.statusBadge?.label || 'NO INVOICES'
        if (statusFilter === 'overdue' && badgeLabel !== 'OVERDUE') return false
        if (statusFilter === 'pending' && badgeLabel !== 'PENDING') return false
        if (statusFilter === 'paid' && badgeLabel !== 'PAID') return false
      }

      return true
    })
  }, [customers, query, statusFilter, customerFinancials])

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE
  const paginatedCustomers = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  function handleSearchChange(e) {
    setQuery(e.target.value)
    setCurrentPage(1)
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

  return (
    <div className="card customer-list">
      {/* Search and Filters Toolbar */}
      <div className="customer-list-toolbar" role="search" aria-label="Customer search and filters">
        <div className="customer-search-input-wrap">
          <Search size={16} className="customer-search-icon" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={handleSearchChange}
            placeholder="Fuzzy search by name, phone, email, or GSTIN (e.g. Rahuul, Skyline, 98141)..."
            aria-label="Search customers"
          />
          {query && (
            <button
              type="button"
              className="customer-search-clear"
              onClick={() => {
                setQuery('')
                setCurrentPage(1)
              }}
              aria-label="Clear search"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="customer-filter-group">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            aria-label="Filter customers by payment status"
          >
            <option value="All">All Statuses</option>
            <option value="overdue">Overdue Invoices</option>
            <option value="pending">Pending Payments</option>
            <option value="paid">Fully Settled</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No customers found</h3>
          <p>
            {customers.length === 0
              ? 'Add your first customer to get started.'
              : `No customers matched "${query.trim()}". Try checking spelling or resetting your filter.`}
          </p>
          {query && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginTop: 12 }}
              onClick={() => {
                setQuery('')
                setStatusFilter('All')
                setCurrentPage(1)
              }}
            >
              Reset Search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="customer-table-wrap">
            <table className="customer-table" aria-label="Customers directory">
              <thead>
                <tr>
                  <th scope="col">Customer Name</th>
                  <th scope="col">Phone & Email</th>
                  <th scope="col">GSTIN</th>
                  <th scope="col">Outstanding</th>
                  <th scope="col">Payment Status</th>
                  <th scope="col" className="customer-table-actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map((customer) => {
                  const fin = customerFinancials.get(String(customer.id)) || {
                    outstanding: 0,
                    statusBadge: { label: 'NO INVOICES', class: 'badge-muted' },
                  }
                  const initials = (customer.name || 'C')
                    .split(' ')
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()

                  return (
                    <tr key={customer.id} className="customer-table-row">
                      {/* Name & Avatar */}
                      <td data-label="Name" className="customer-name-cell">
                        <div className="customer-identity">
                          <div className="customer-avatar" aria-hidden="true">{initials}</div>
                          <div>
                            <span className="customer-name-text">{customer.name}</span>
                            {customer.address && (
                              <span className="customer-sub-address">{customer.address}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td data-label="Contact" className="customer-contact-cell">
                        <div className="customer-contact-info">
                          <span className="customer-phone">{customer.phone || '—'}</span>
                          <span className="customer-email">{customer.email || '—'}</span>
                        </div>
                      </td>

                      {/* GSTIN */}
                      <td data-label="GSTIN" className="customer-gstin-cell">
                        {customer.gstin ? (
                          <span className="customer-gstin-badge">{customer.gstin}</span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>

                      {/* Outstanding Balance */}
                      <td data-label="Outstanding" className="customer-balance-cell">
                        <span
                          className={`customer-balance-text ${
                            fin.outstanding > 0 ? 'balance-due' : 'balance-settled'
                          }`}
                        >
                          {formatINR(fin.outstanding)}
                        </span>
                      </td>

                      {/* Status */}
                      <td data-label="Status">
                        <span className={`badge ${fin.statusBadge.class}`}>
                          {fin.statusBadge.label}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td data-label="Actions">
                        <div className="customer-table-actions">
                          <button
                            type="button"
                            className="cust-btn-action"
                            aria-label={`View details for ${customer.name}`}
                            onClick={() => navigate(`/customers/${customer.id}`)}
                            title="View Customer Profile"
                          >
                            <Eye size={13} aria-hidden="true" />
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            className="cust-btn-action"
                            aria-label={`View ledger for ${customer.name}`}
                            onClick={() => navigate(`/customers/${customer.id}/ledger`)}
                            title="View Financial Ledger"
                          >
                            <BookOpen size={13} aria-hidden="true" />
                            <span>Ledger</span>
                          </button>
                          <button
                            type="button"
                            className="cust-btn-icon"
                            aria-label={`Edit ${customer.name}`}
                            onClick={() => onEdit(customer)}
                            title="Edit Customer"
                          >
                            <Edit2 size={13} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="cust-btn-icon cust-btn-delete"
                            aria-label={`Delete ${customer.name}`}
                            onClick={() => setCustomerToDelete(customer)}
                            title="Delete Customer"
                          >
                            <Trash2 size={13} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="customer-pagination" aria-label="Customer list pagination">
            <div className="pagination-info">
              Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} of {filtered.length}{' '}
              {filtered.length === 1 ? 'customer' : 'customers'}
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
        confirmText="Confirm Delete"
        cancelText="Cancel"
        danger={true}
      >
        <p style={{ margin: 0, lineHeight: 1.6, color: 'rgb(209, 213, 219)', fontSize: '14px' }}>
          Are you sure you want to delete customer <strong style={{ color: 'rgb(233, 234, 238)' }}>{customerToDelete?.name}</strong>?
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
          <strong>Note:</strong> Deleting this customer removes their profile from your active directory. Any existing historical invoices already issued to them will retain their recorded billing transactions.
        </div>
      </Modal>
    </div>
  )
}

export default CustomerList
