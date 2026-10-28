import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoices, saveInvoices, getCustomers, getPayments } from '../../services/storage';
import { 
  formatInvoiceId, 
  calculateTotalPaid, 
  calculatePaymentStatus 
} from '../../utils/paymentUtils';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import './Invoices.css';

/**
 * Generates an array of page numbers and ellipsis indicators for pagination controls.
 * e.g. [1, 2, 3, 4, 5, '...', 20] or [1, '...', 5, 6, 7, '...', 20]
 */
function getPaginationItems(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
}

const ITEMS_PER_PAGE = 10;

export default function Invoices() {
  const navigate = useNavigate();
  const toast = useToast();

  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('DATE_DESC');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setInvoices(getInvoices());
    setCustomers(getCustomers());
    setPayments(getPayments());
  }, []);

  function getCustomerName(customerId) {
    const found = customers.find(c => String(c.id) === String(customerId) || c.name === customerId);
    return found ? found.name : (customerId || 'Unknown Customer');
  }

  function getInvoiceStatus(inv) {
    if (inv.status === 'DRAFT') return 'DRAFT';
    const totalPaid = calculateTotalPaid(payments, inv.id);
    return calculatePaymentStatus(inv, totalPaid);
  }

  function handleDuplicate(invToCopy) {
    let maxNum = 0;
    invoices.forEach(inv => {
      const match = String(inv.id).match(/^INV-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });

    const newId = `INV-${String(maxNum + 1).padStart(4, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const duplicatedInvoice = {
      ...invToCopy,
      id: newId,
      date: today,
      status: 'PENDING'
    };

    const updated = [duplicatedInvoice, ...invoices];
    saveInvoices(updated);
    setInvoices(updated);
    setCurrentPage(1);
    toast.success(`Invoice ${invToCopy.id} duplicated successfully as ${newId}!`);
  }

  function handleConfirmDelete() {
    if (!invoiceToDelete) return;

    const idToDelete = invoiceToDelete.id;
    const updated = invoices.filter(inv => String(inv.id) !== String(idToDelete));
    saveInvoices(updated);
    setInvoices(updated);

    const remainingFilteredCount = filteredInvoices.filter(inv => String(inv.id) !== String(idToDelete)).length;
    const newTotalPages = Math.max(1, Math.ceil(remainingFilteredCount / ITEMS_PER_PAGE));
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }

    toast.success(`Invoice ${formatInvoiceId(idToDelete)} deleted successfully!`);
    setInvoiceToDelete(null);
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    setCurrentPage(1);
  }

  function handleSearchChange(e) {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }

  function handleStartDateChange(e) {
    setStartDate(e.target.value);
    setCurrentPage(1);
  }

  function handleEndDateChange(e) {
    setEndDate(e.target.value);
    setCurrentPage(1);
  }

  function handleSortChange(e) {
    setSortBy(e.target.value);
    setCurrentPage(1);
  }

  function resetFilters() {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setActiveTab('ALL');
    setSortBy('DATE_DESC');
    setCurrentPage(1);
  }

  const allCount = invoices.length;
  const paidCount = invoices.filter(inv => getInvoiceStatus(inv) === 'PAID').length;
  const pendingCount = invoices.filter(inv => {
    const s = getInvoiceStatus(inv);
    return s === 'PENDING' || s === 'PARTIALLY PAID';
  }).length;
  const overdueCount = invoices.filter(inv => getInvoiceStatus(inv) === 'OVERDUE').length;
  const draftCount = invoices.filter(inv => getInvoiceStatus(inv) === 'DRAFT').length;

  let filteredInvoices = invoices.filter(inv => {
    const status = getInvoiceStatus(inv);
    const customerName = getCustomerName(inv.customerId).toLowerCase();
    const invoiceId = String(inv.id).toLowerCase();
    const search = searchTerm.toLowerCase();

    if (!customerName.includes(search) && !invoiceId.includes(search)) return false;

    if (activeTab === 'PAID' && status !== 'PAID') return false;
    if (activeTab === 'PENDING' && status !== 'PENDING' && status !== 'PARTIALLY PAID') return false;
    if (activeTab === 'OVERDUE' && status !== 'OVERDUE') return false;
    if (activeTab === 'DRAFT' && status !== 'DRAFT') return false;

    if (startDate && inv.date && inv.date < startDate) return false;
    if (endDate && inv.date && inv.date > endDate) return false;

    return true;
  });

  filteredInvoices.sort((a, b) => {
    if (sortBy === 'DATE_DESC') return new Date(b.date || 0) - new Date(a.date || 0);
    if (sortBy === 'DATE_ASC') return new Date(a.date || 0) - new Date(b.date || 0);
    if (sortBy === 'AMOUNT_DESC') return Number(b.total || 0) - Number(a.total || 0);
    if (sortBy === 'AMOUNT_ASC') return Number(a.total || 0) - Number(b.total || 0);
    if (sortBy === 'CUSTOMER_ASC') return getCustomerName(a.customerId).localeCompare(getCustomerName(b.customerId));
    if (sortBy === 'CUSTOMER_DESC') return getCustomerName(b.customerId).localeCompare(getCustomerName(a.customerId));
    return 0;
  });

  const hasActiveFilters = searchTerm !== '' || startDate !== '' || endDate !== '' || activeTab !== 'ALL' || sortBy !== 'DATE_DESC';

  // Pagination computations
  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredInvoices.length);
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

  return (
    <div className="invoices-page page">
      <div className="page-header">
        <div>
          <h1>Invoices</h1>
          <p>Manage, track and view your client bills</p>
        </div>
        <div className="invoices-header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/invoices/new')}
          >
            + Create Invoice
          </button>
        </div>
      </div>

      <div className="card invoices-toolbar">
        <div className="toolbar-top-row">
          <div className="invoices-tabs">
            <button 
              className={`tab-button ${activeTab === 'ALL' ? 'active' : ''}`}
              onClick={() => handleTabChange('ALL')}
            >
              All <span className="tab-badge">{allCount}</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'PAID' ? 'active' : ''}`}
              onClick={() => handleTabChange('PAID')}
            >
              Paid <span className="tab-badge">{paidCount}</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'PENDING' ? 'active' : ''}`}
              onClick={() => handleTabChange('PENDING')}
            >
              Pending <span className="tab-badge">{pendingCount}</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'OVERDUE' ? 'active' : ''}`}
              onClick={() => handleTabChange('OVERDUE')}
            >
              Overdue <span className="tab-badge">{overdueCount}</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'DRAFT' ? 'active' : ''}`}
              onClick={() => handleTabChange('DRAFT')}
            >
              Draft <span className="tab-badge">{draftCount}</span>
            </button>
          </div>

          <div className="invoices-search">
            <input
              type="text"
              placeholder="Search by customer or invoice #..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="toolbar-bottom-row">
          <div className="date-filter-group">
            <span>Filter by Date:</span>
            <input 
              type="date" 
              value={startDate} 
              onChange={handleStartDateChange}
              title="Start Date"
            />
            <span>to</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={handleEndDateChange}
              title="End Date"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="sort-group">
              <span>Sort By:</span>
              <select value={sortBy} onChange={handleSortChange}>
                <option value="DATE_DESC">Date (Newest First)</option>
                <option value="DATE_ASC">Date (Oldest First)</option>
                <option value="AMOUNT_DESC">Amount (Highest First)</option>
                <option value="AMOUNT_ASC">Amount (Lowest First)</option>
                <option value="CUSTOMER_ASC">Customer (A → Z)</option>
                <option value="CUSTOMER_DESC">Customer (Z → A)</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button className="btn-reset-filters" onClick={resetFilters}>
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card invoices-table-container">
        {filteredInvoices.length === 0 ? (
          <div className="invoices-empty">
            <h3>No invoices found</h3>
            <p>
              {hasActiveFilters 
                ? 'No invoices match your current filter or search criteria.' 
                : 'You have not created any invoices yet.'}
            </p>
            {hasActiveFilters ? (
              <button className="btn btn-secondary" onClick={resetFilters}>
                Clear All Filters
              </button>
            ) : (
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/invoices/new')}
              >
                + Create First Invoice
              </button>
            )}
          </div>
        ) : (
          <>
            <table className="invoices-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInvoices.map((inv) => {
                  const status = getInvoiceStatus(inv);
                  const isPaid = status === 'PAID';

                  return (
                    <tr key={inv.id}>
                      <td>
                        <span className="invoice-id-badge">
                          {formatInvoiceId(inv.id)}
                        </span>
                      </td>
                      <td>
                        <strong>{getCustomerName(inv.customerId)}</strong>
                      </td>
                      <td>{inv.date || '—'}</td>
                      <td>{inv.dueDate || '—'}</td>
                      <td>
                        <strong>₹{Number(inv.total || 0).toFixed(2)}</strong>
                      </td>
                      <td>
                        <span className={`status-pill status-${status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {status}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="action-btn-sm"
                            title="Edit Invoice"
                            onClick={() => navigate(`/invoices/edit/${inv.id}`)}
                          >
                            Edit
                          </button>

                          <button
                            className="action-btn-sm"
                            title="Duplicate Invoice"
                            onClick={() => handleDuplicate(inv)}
                          >
                            Duplicate
                          </button>

                          {!isPaid && (
                            <button
                              className="action-btn-sm"
                              title="Record Payment"
                              onClick={() => navigate('/payments', { state: { invoiceId: inv.id, amount: inv.total } })}
                            >
                              Pay
                            </button>
                          )}

                          <button
                            className="action-btn-sm"
                            title="View Preview"
                            onClick={() => navigate('/invoice-preview', { state: { invoiceId: inv.id } })}
                          >
                            View
                          </button>

                          <button
                            className="action-btn-sm action-btn-danger"
                            title="Delete Invoice"
                            onClick={() => setInvoiceToDelete(inv)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="invoices-pagination">
              <div className="pagination-info">
                Showing <strong>{startIndex + 1}</strong>–<strong>{endIndex}</strong> of <strong>{filteredInvoices.length}</strong> {filteredInvoices.length === 1 ? 'invoice' : 'invoices'}
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
                  {getPaginationItems(validCurrentPage, totalPages).map((item, idx) => {
                    if (item === '...') {
                      return <span key={`ellipsis-${idx}`} className="pagination-ellipsis">…</span>;
                    }
                    return (
                      <button
                        key={item}
                        type="button"
                        className={`pagination-pill ${validCurrentPage === item ? 'active' : ''}`}
                        onClick={() => setCurrentPage(item)}
                        aria-label={`Go to page ${item}`}
                        aria-current={validCurrentPage === item ? 'page' : undefined}
                      >
                        {item}
                      </button>
                    );
                  })}
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
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(invoiceToDelete)}
        onClose={() => setInvoiceToDelete(null)}
        title="Delete Invoice"
        onConfirm={handleConfirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
        danger={true}
      >
        <p style={{ margin: 0, lineHeight: 1.6, color: 'rgb(209, 213, 219)', fontSize: '14px' }}>
          Are you sure you want to delete invoice{' '}
          <strong style={{ color: 'rgb(233, 234, 238)' }}>
            {invoiceToDelete ? formatInvoiceId(invoiceToDelete.id) : ''}
          </strong>
          {invoiceToDelete?.customerId ? ` for ${getCustomerName(invoiceToDelete.customerId)}` : ''}?
        </p>
        <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'rgb(154, 161, 175)' }}>
          This action cannot be undone. All invoice details will be permanently removed.
        </p>
      </Modal>
    </div>
  );
}