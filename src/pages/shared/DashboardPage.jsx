import { useNavigate } from 'react-router-dom'
import './DashboardPage.css'

const SUMMARY_CARDS = [
  {
    id: 'revenue',
    title: 'Total Revenue',
    value: '₹0',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    id: 'billed',
    title: 'Total Billed',
    value: '₹0',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    id: 'pending',
    title: 'Pending Payments',
    value: '₹0',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: 'overdue',
    title: 'Overdue Amount',
    value: '₹0',
    isWarning: true,
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
]

function DashboardPage() {
  const navigate = useNavigate()

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

          <div className="dashboard-empty-state card">
            <div className="dashboard-empty-icon">
              <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1.5" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h3>No invoices yet</h3>
            <p>Create your first invoice to see it here.</p>
            <button className="btn btn-primary" onClick={() => navigate('/invoices')}>
              Create Invoice
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default DashboardPage
