import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IndianRupee, FileText, Clock, AlertCircle } from 'lucide-react'
import { getInvoices, getPayments, getCustomers } from '../services/storage'
import { calculateTotalPaid, calculateRemaining, calculatePaymentStatus, formatInvoiceId } from '../utils/paymentUtils'

import './DashboardPage.css'

function DashboardPage({ profile }) {
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    revenue: 0,
    billed: 0,
    pending: 0,
    overdue: 0
  })
  const [allInvoices, setAllInvoices] = useState([])
  const [showAllInvoices, setShowAllInvoices] = useState(false)
  const [customers, setCustomers] = useState([])

  useEffect(() => {
    const savedInvoices = getInvoices()
    const payments = getPayments()
    const savedCustomers = getCustomers()
    const combined = [...savedInvoices]
    const uniqueInvoices = Array.from(new Map(combined.map(item => [item.id, item])).values())

    let totalRevenue = 0
    let totalBilled = 0
    let pendingPayments = 0
    let overdueAmount = 0

    for (let i = 0; i < uniqueInvoices.length; i++) {
      const invoice = uniqueInvoices[i]
      const totalPaid = calculateTotalPaid(payments, invoice.id)
      const remaining = calculateRemaining(invoice.total, totalPaid)
      const status = calculatePaymentStatus(invoice, totalPaid)

      totalRevenue += totalPaid
      totalBilled += invoice.total

      if (status === "OVERDUE") {
        overdueAmount += remaining
      } else {
        pendingPayments += remaining
      }
    }

    setStats({
      revenue: totalRevenue,
      billed: totalBilled,
      pending: pendingPayments,
      overdue: overdueAmount
    })

    const sorted = [...uniqueInvoices].reverse()
    setAllInvoices(sorted)
    setCustomers(savedCustomers)
  }, [])

  const SUMMARY_CARDS = [
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: `₹${stats.revenue}`,
      valueColor: 'rgb(63, 182, 127)',
      icon: <IndianRupee size={20} />,
    },
    {
      id: 'billed',
      title: 'Total Billed',
      value: `₹${stats.billed}`,
      valueColor: 'rgb(233, 234, 238)',
      icon: <FileText size={20} />,
    },
    {
      id: 'pending',
      title: 'Pending Payments',
      value: `₹${stats.pending}`,
      valueColor: 'rgb(217, 164, 65)',
      icon: <Clock size={20} />,
    },
    {
      id: 'overdue',
      title: 'Overdue Amount',
      value: `₹${stats.overdue}`,
      valueColor: 'rgb(229, 72, 77)',
      isWarning: true,
      icon: <AlertCircle size={20} />,
    },
  ]

  const bizName = profile?.name || "Business Owner";

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero-bg"></div>

      <div className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-greeting">Good afternoon,<br />{bizName}</h1>
            <p className="dashboard-subtitle">Here's your business overview.</p>
          </div>
          <div className="dashboard-header-actions">
            <button className="btn btn-primary" onClick={() => navigate('/invoices')}>
              + Create Invoice
            </button>
          </div>
        </header>

        <section className="dashboard-summary-cards">
          {SUMMARY_CARDS.map((card) => (
            <div key={card.id} className={`dashboard-card ${card.isWarning ? 'dashboard-card-warning' : ''}`}>
              <div className="dashboard-card-icon" aria-hidden="true">
                {card.icon}
              </div>
              <h2 className="dashboard-card-title">{card.title}</h2>
              <p className="dashboard-card-value" style={card.valueColor ? { color: card.valueColor } : {}}>{card.value}</p>
            </div>
          ))}
        </section>

        <section className="dashboard-recent">
          <div className="dashboard-recent-header">
            <h2>{showAllInvoices ? "All Transactions" : "Recent Transactions"}</h2>
            {allInvoices.length > 5 && (
              <button className="btn-link" onClick={() => setShowAllInvoices(!showAllInvoices)}>
                {showAllInvoices ? "Show Less ←" : "View More →"}
              </button>
            )}
          </div>

          {allInvoices.length > 0 ? (
            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgb(51, 57, 71)' }}>
                    <th style={{ padding: '16px 20px', color: 'rgb(233, 234, 238)', fontSize: '14px', fontWeight: 600 }}>ID</th>
                    <th style={{ padding: '16px 20px', color: 'rgb(233, 234, 238)', fontSize: '14px', fontWeight: 600 }}>Customer</th>
                    <th style={{ padding: '16px 20px', color: 'rgb(233, 234, 238)', fontSize: '14px', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '16px 20px', color: 'rgb(233, 234, 238)', fontSize: '14px', fontWeight: 600 }}>Total</th>
                    <th style={{ padding: '16px 20px', color: 'rgb(233, 234, 238)', fontSize: '14px', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(showAllInvoices ? allInvoices : allInvoices.slice(0, 5)).map((inv, index, arr) => {
                    const customer = customers.find(c => String(c.id) === String(inv.customerId));
                    const custName = customer ? customer.name : (inv.customerName || inv.customerId || "Unknown");
                    const isLast = index === arr.length - 1;

                    const displayStatus = inv.status || 'PENDING';
                    let statusColor = '#E9484D';
                    if (displayStatus === 'PAID') statusColor = 'rgb(63, 182, 127)';
                    if (displayStatus === 'PENDING') statusColor = 'rgb(245, 166, 35)';

                    return (
                      <tr key={inv.id} style={{ borderBottom: isLast ? 'none' : '1px solid rgb(51, 57, 71)' }}>
                        <td style={{ padding: '16px 20px', color: 'rgb(233, 234, 238)' }}>{formatInvoiceId(inv.id)}</td>
                        <td style={{ padding: '16px 20px', color: 'rgb(233, 234, 238)' }}>{custName}</td>
                        <td style={{ padding: '16px 20px', color: 'rgb(233, 234, 238)' }}>{inv.date || '—'}</td>
                        <td style={{ padding: '16px 20px', color: 'rgb(233, 234, 238)' }}>₹{Number(inv.total).toFixed(2)}</td>
                        <td style={{ padding: '16px 20px', color: statusColor, fontWeight: 600 }}>{displayStatus}</td>
                      </tr>
                    )
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
              <button className="btn btn-primary" onClick={() => navigate('/invoices')}>
                Create Invoice
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default DashboardPage
