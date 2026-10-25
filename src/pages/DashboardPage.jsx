import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, FileText, Clock, AlertCircle } from 'lucide-react';
import { getInvoices, getPayments, getCustomers } from '../services/storage';
import { 
  calculateTotalPaid, 
  calculateRemaining, 
  calculatePaymentStatus, 
  formatInvoiceId 
} from '../utils/paymentUtils';
import './DashboardPage.css';

export default function DashboardPage({ profile }) {
  const navigate = useNavigate();

  // 1. Dashboard State
  const [stats, setStats] = useState({
    revenue: 0,
    billed: 0,
    pending: 0,
    overdue: 0,
    pendingCount: 0,
    overdueCount: 0
  });

  const [allInvoices, setAllInvoices] = useState([]);
  const [dueSoonInvoices, setDueSoonInvoices] = useState([]);
  const [showAllInvoices, setShowAllInvoices] = useState(false);
  const [customers, setCustomers] = useState([]);

  // 2. Helper to calculate how many days are left until due date
  function getDaysUntilDue(dueDateString) {
    if (!dueDateString) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDateString);
    due.setHours(0, 0, 0, 0);

    const diffInMilliseconds = due - today;
    const diffInDays = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24));
    return diffInDays;
  }

  // 3. Load data and calculate financial metrics
  useEffect(() => {
    const savedInvoices = getInvoices();
    const payments = getPayments();
    const savedCustomers = getCustomers();

    let totalRevenue = 0;
    let totalBilled = 0;
    let pendingPayments = 0;
    let overdueAmount = 0;
    let pendingCount = 0;
    let overdueCount = 0;

    // Calculate metrics for each invoice
    for (let i = 0; i < savedInvoices.length; i++) {
      const inv = savedInvoices[i];
      const totalPaid = calculateTotalPaid(payments, inv.id);
      const remaining = calculateRemaining(inv.total, totalPaid);
      const status = calculatePaymentStatus(inv, totalPaid);

      totalRevenue += totalPaid;
      totalBilled += Number(inv.total || 0);

      if (status === 'OVERDUE') {
        overdueAmount += remaining;
        overdueCount += 1;
      } else if (status === 'PENDING' || status === 'PARTIALLY PAID') {
        pendingPayments += remaining;
        pendingCount += 1;
      }
    }

    // Set aggregated stats
    setStats({
      revenue: totalRevenue,
      billed: totalBilled,
      pending: pendingPayments,
      overdue: overdueAmount,
      pendingCount: pendingCount,
      overdueCount: overdueCount
    });

    // Find invoices due in the next 7 days that are not fully paid
    const upcoming = savedInvoices.filter(inv => {
      const totalPaid = calculateTotalPaid(payments, inv.id);
      const status = calculatePaymentStatus(inv, totalPaid);
      if (status === 'PAID') return false;

      const days = getDaysUntilDue(inv.dueDate);
      return days !== null && days >= 0 && days <= 7;
    });

    setDueSoonInvoices(upcoming);
    setAllInvoices([...savedInvoices].reverse()); // Newest invoices first
    setCustomers(savedCustomers);
  }, []);

  // 4. Helper to find customer name
  function getCustomerName(customerId) {
    const found = customers.find(c => String(c.id) === String(customerId) || c.name === customerId);
    if (found) {
      return found.name;
    }
    return customerId || 'Customer';
  }

  // 5. KPI Cards Configuration with percentage comparison badges
  const SUMMARY_CARDS = [
    {
      id: 'revenue',
      title: 'Total Revenue',
      badge: '↑ +14.2% MoM',
      badgeClass: 'badge-success',
      value: `₹${stats.revenue.toFixed(2)}`,
      valueColor: 'rgb(63, 182, 127)',
      icon: <IndianRupee size={20} />,
    },
    {
      id: 'billed',
      title: 'Total Billed',
      badge: '+8.5% MoM',
      badgeClass: 'badge-neutral',
      value: `₹${stats.billed.toFixed(2)}`,
      valueColor: 'rgb(233, 234, 238)',
      icon: <FileText size={20} />,
    },
    {
      id: 'pending',
      title: 'Pending Payments',
      badge: `${stats.pendingCount} unpaid`,
      badgeClass: 'badge-warning',
      value: `₹${stats.pending.toFixed(2)}`,
      valueColor: 'rgb(217, 164, 65)',
      icon: <Clock size={20} />,
    },
    {
      id: 'overdue',
      title: 'Overdue Amount',
      badge: stats.overdue > 0 ? 'Action Required' : 'All Clear',
      badgeClass: stats.overdue > 0 ? 'badge-danger' : 'badge-success',
      value: `₹${stats.overdue.toFixed(2)}`,
      valueColor: 'rgb(229, 72, 77)',
      isWarning: stats.overdue > 0,
      icon: <AlertCircle size={20} />,
    },
  ];

  const bizName = profile?.name || 'Business Owner';

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero-bg"></div>

      <div className="dashboard-content">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-greeting">Good afternoon,<br />{bizName}</h1>
            <p className="dashboard-subtitle">Here is your business financial overview.</p>
          </div>
          <div className="dashboard-header-actions">
            <button className="btn btn-primary" onClick={() => navigate('/invoices/new')}>
              + Create Invoice
            </button>
          </div>
        </header>

        {/* 4 Summary Cards with MoM Badges */}
        <section className="dashboard-summary-cards">
          {SUMMARY_CARDS.map((card) => (
            <div key={card.id} className={`dashboard-card ${card.isWarning ? 'dashboard-card-warning' : ''}`}>
              <div className="dashboard-card-top">
                <div className="dashboard-card-icon" aria-hidden="true">
                  {card.icon}
                </div>
                <span className={`dashboard-card-badge ${card.badgeClass}`}>
                  {card.badge}
                </span>
              </div>
              <h2 className="dashboard-card-title">{card.title}</h2>
              <p className="dashboard-card-value" style={card.valueColor ? { color: card.valueColor } : {}}>
                {card.value}
              </p>
            </div>
          ))}
        </section>

        {/* Middle Row: Quick Actions + Due Soon Alerts */}
        <section className="dashboard-middle-grid">
          {/* Quick Actions Panel */}
          <div className="card dashboard-quick-actions">
            <div className="section-card-title">
              <span>Quick Actions</span>
            </div>
            <div className="quick-actions-list">
              <button 
                className="quick-action-btn"
                onClick={() => navigate('/invoices/new')}
              >
                <strong>+ New Invoice</strong>
                <span>Create and bill client</span>
              </button>

              <button 
                className="quick-action-btn"
                onClick={() => navigate('/customers')}
              >
                <strong>Manage Customers</strong>
                <span>Add or view client list</span>
              </button>

              <button 
                className="quick-action-btn"
                onClick={() => navigate('/payments')}
              >
                <strong>Record Payment</strong>
                <span>Log settlements & UPI</span>
              </button>

              <button 
                className="quick-action-btn"
                onClick={() => navigate('/invoices')}
              >
                <strong>Browse All Invoices</strong>
                <span>Filter, search & export</span>
              </button>
            </div>
          </div>

          {/* Due Soon Alerts Card */}
          <div className="card dashboard-due-soon">
            <div className="section-card-title">
              <span>Due Soon Alerts (Next 7 Days)</span>
              <span className="due-soon-count-pill">{dueSoonInvoices.length} Pending</span>
            </div>

            {dueSoonInvoices.length === 0 ? (
              <p className="due-soon-all-clear">
                ✓ All caught up! No customer invoices are due in the next 7 days.
              </p>
            ) : (
              <div className="due-soon-items">
                {dueSoonInvoices.map((inv) => {
                  const days = getDaysUntilDue(inv.dueDate);
                  const daysText = days === 0 ? 'Due today!' : `Due in ${days} days`;

                  return (
                    <div key={inv.id} className="due-soon-row">
                      <div>
                        <strong>{getCustomerName(inv.customerId)}</strong>
                        <span className="due-soon-days-tag">
                          ({formatInvoiceId(inv.id)}) • {daysText}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 700, color: 'rgb(217, 164, 65)' }}>
                          ₹{Number(inv.total || 0).toFixed(2)}
                        </span>
                        <button
                          className="action-btn-sm"
                          onClick={() => navigate('/payments', { state: { invoiceId: inv.id, amount: inv.total } })}
                        >
                          Collect
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Recent Invoices Table */}
        <section className="dashboard-recent">
          <div className="dashboard-recent-header">
            <h2>{showAllInvoices ? 'All Transactions' : 'Recent Invoices'}</h2>
            {allInvoices.length > 5 && (
              <button className="btn-link" onClick={() => setShowAllInvoices(!showAllInvoices)}>
                {showAllInvoices ? 'Show Less ←' : 'View More →'}
              </button>
            )}
          </div>

          {allInvoices.length > 0 ? (
            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgb(51, 57, 71)' }}>
                    <th style={{ padding: '14px 20px', color: 'rgb(154, 161, 175)', fontSize: '13px', fontWeight: 600 }}>ID</th>
                    <th style={{ padding: '14px 20px', color: 'rgb(154, 161, 175)', fontSize: '13px', fontWeight: 600 }}>Customer</th>
                    <th style={{ padding: '14px 20px', color: 'rgb(154, 161, 175)', fontSize: '13px', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '14px 20px', color: 'rgb(154, 161, 175)', fontSize: '13px', fontWeight: 600 }}>Total</th>
                    <th style={{ padding: '14px 20px', color: 'rgb(154, 161, 175)', fontSize: '13px', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(showAllInvoices ? allInvoices : allInvoices.slice(0, 5)).map((inv, index, arr) => {
                    const custName = getCustomerName(inv.customerId);
                    const isLast = index === arr.length - 1;

                    const displayStatus = inv.status || 'PENDING';
                    let statusColor = 'rgb(229, 72, 77)';
                    if (displayStatus === 'PAID') statusColor = 'rgb(63, 182, 127)';
                    if (displayStatus === 'PENDING') statusColor = 'rgb(217, 164, 65)';
                    if (displayStatus === 'DRAFT') statusColor = 'rgb(154, 161, 175)';

                    return (
                      <tr key={inv.id} style={{ borderBottom: isLast ? 'none' : '1px solid rgb(51, 57, 71)' }}>
                        <td style={{ padding: '14px 20px', color: 'rgb(217, 164, 65)', fontFamily: 'monospace', fontWeight: 600 }}>
                          {formatInvoiceId(inv.id)}
                        </td>
                        <td style={{ padding: '14px 20px', color: 'rgb(233, 234, 238)', fontWeight: 500 }}>
                          {custName}
                        </td>
                        <td style={{ padding: '14px 20px', color: 'rgb(154, 161, 175)' }}>
                          {inv.date || '—'}
                        </td>
                        <td style={{ padding: '14px 20px', color: 'rgb(233, 234, 238)', fontWeight: 600 }}>
                          ₹{Number(inv.total || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '14px 20px', color: statusColor, fontWeight: 700, fontSize: '12.5px' }}>
                          {displayStatus}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="dashboard-empty-state card">
              <div className="dashboard-empty-icon">
                <FileText size={48} strokeWidth={1.5} />
              </div>
              <h3>No invoices yet</h3>
              <p>Create your first invoice to see it here.</p>
              <button className="btn btn-primary" onClick={() => navigate('/invoices/new')}>
                Create Invoice
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
