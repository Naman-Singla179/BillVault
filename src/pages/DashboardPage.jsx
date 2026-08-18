import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IndianRupee, FileText, Clock, AlertCircle } from 'lucide-react'
import { getInvoices, getPayments, getCustomers } from '../services/storage'
import './DashboardPage.css'

function DashboardPage() {
  const navigate = useNavigate()
  const [invoices] = useState(() => getInvoices())
  const [payments] = useState(() => getPayments())
  const [customers] = useState(() => getCustomers())

  const totalBilled = invoices.reduce((sum, inv) => sum + Number(inv.total), 0)
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const totalPending = totalBilled - totalPaid

  const today = new Date().toISOString().split('T')[0]
  const overdueAmount = invoices
    .filter(inv => inv.status !== 'PAID' && inv.dueDate < today)
    .reduce((sum, inv) => {
      const invPayments = payments
        .filter(p => p.invoiceId === inv.id)
        .reduce((s, p) => s + p.amount, 0)
      return sum + (Number(inv.total) - invPayments)
    }, 0)

  const summaryCards = [
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: `₹${totalPaid.toFixed(2)}`,
      icon: <IndianRupee size={20} />,
    },
    {
      id: 'billed',
      title: 'Total Billed',
      value: `₹${totalBilled.toFixed(2)}`,
      icon: <FileText size={20} />,
    },
    {
      id: 'pending',
      title: 'Pending Payments',
      value: `₹${totalPending.toFixed(2)}`,
      icon: <Clock size={20} />,
    },
    {
      id: 'overdue',
      title: 'Overdue Amount',
      value: `₹${overdueAmount.toFixed(2)}`,
      isWarning: true,
      icon: <AlertCircle size={20} />,
    },
  ]

  const recentInvoices = [...invoices].reverse().slice(0, 5)

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero-bg"></div>

      <div className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-greeting">Good afternoon,<br />Business Owner</h1>
            <p className="dashboard-subtitle">Here's your business overview.</p>
          </div>
          <div className="dashboard-header-actions">
            <button className="btn btn-primary" onClick={() => navigate('/invoices/new')}>
              + Create Invoice
            </button>
          </div>
        </header>

        <section className="dashboard-summary-cards">
          {summaryCards.map((card) => (
            <div key={card.id} className={`dashboard-card ${card.isWarning ? 'dashboard-card-warning' : ''}`}>
              <div className="dashboard-card-icon" aria-hidden="true">
                {card.icon}
              </div>
              <h2 className="dashboard-card-title">{card.title}</h2>
              <p className="dashboard-card-value">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="dashboard-recent">
          <div className="dashboard-recent-header">
            <h2>Recent Invoices</h2>
            <button className="btn-link" onClick={() => navigate('/invoices')}>
              View All →
            </button>
          </div>

          {recentInvoices.length > 0 ? (
            <div className="card" style={{ padding: '20px', overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <th style={{ padding: '10px' }}>ID</th>
                    <th style={{ padding: '10px' }}>Customer</th>
                    <th style={{ padding: '10px' }}>Date</th>
                    <th style={{ padding: '10px' }}>Total</th>
                    <th style={{ padding: '10px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map(inv => {
                    const customer = customers.find(c => c.id === inv.customerId || c.id === Number(inv.customerId));
                    return (
                      <tr key={inv.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>{inv.id}</td>
                        <td style={{ padding: '10px' }}>{customer ? customer.name : 'Unknown'}</td>
                        <td style={{ padding: '10px' }}>{inv.date}</td>
                        <td style={{ padding: '10px' }}>₹{Number(inv.total).toFixed(2)}</td>
                        <td style={{ padding: '10px', color: inv.status === 'PENDING' ? 'orange' : (inv.status === 'PAID' ? 'green' : 'inherit') }}>
                          {inv.status}
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
  )
}

export default DashboardPage
