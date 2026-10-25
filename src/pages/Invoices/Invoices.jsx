import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoices, saveInvoices, getCustomers, getPayments } from '../../services/storage';
import { 
  formatInvoiceId, 
  calculateTotalPaid, 
  calculatePaymentStatus 
} from '../../utils/paymentUtils';
import './Invoices.css';

export default function Invoices() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);

  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('DATE_DESC');

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
    alert(`Invoice ${invToCopy.id} duplicated successfully as ${newId}!`);
  }

  function handleDelete(idToDelete) {
    const confirmDelete = window.confirm(`Are you sure you want to delete invoice ${idToDelete}?`);
    if (!confirmDelete) return;

    const updated = invoices.filter(inv => String(inv.id) !== String(idToDelete));
    saveInvoices(updated);
    setInvoices(updated);
    alert('Invoice deleted successfully!');
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

  function resetFilters() {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setActiveTab('ALL');
    setSortBy('DATE_DESC');
  }

  const hasActiveFilters = searchTerm !== '' || startDate !== '' || endDate !== '' || activeTab !== 'ALL' || sortBy !== 'DATE_DESC';

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
              onClick={() => setActiveTab('ALL')}
            >
              All <span className="tab-badge">{allCount}</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'PAID' ? 'active' : ''}`}
              onClick={() => setActiveTab('PAID')}
            >
              Paid <span className="tab-badge">{paidCount}</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'PENDING' ? 'active' : ''}`}
              onClick={() => setActiveTab('PENDING')}
            >
              Pending <span className="tab-badge">{pendingCount}</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'OVERDUE' ? 'active' : ''}`}
              onClick={() => setActiveTab('OVERDUE')}
            >
              Overdue <span className="tab-badge">{overdueCount}</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'DRAFT' ? 'active' : ''}`}
              onClick={() => setActiveTab('DRAFT')}
            >
              Draft <span className="tab-badge">{draftCount}</span>
            </button>
          </div>

          <div className="invoices-search">
            <input
              type="text"
              placeholder="Search by customer or invoice #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="toolbar-bottom-row">
          <div className="date-filter-group">
            <span>Filter by Date:</span>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              title="Start Date"
            />
            <span>to</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              title="End Date"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="sort-group">
              <span>Sort By:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
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
              {filteredInvoices.map((inv) => {
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
                          onClick={() => handleDelete(inv.id)}
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
        )}
      </div>
    </div>
  );
}