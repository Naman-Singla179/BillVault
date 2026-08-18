import { useNavigate } from 'react-router-dom'
import { IndianRupee, FileText, Clock, AlertCircle } from 'lucide-react'
import './DashboardPage.css'

const SUMMARY_CARDS = [
  {
    id: 'revenue',
    title: 'Total Revenue',
    value: '₹0',
    icon: <IndianRupee size={20} />,
  },
  {
    id: 'billed',
    title: 'Total Billed',
    value: '₹0',
    icon: <FileText size={20} />,
  },
  {
    id: 'pending',
    title: 'Pending Payments',
    value: '₹0',
    icon: <Clock size={20} />,
  },
  {
    id: 'overdue',
    title: 'Overdue Amount',
    value: '₹0',
    isWarning: true,
    icon: <AlertCircle size={20} />,
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
              <FileText size={48} strokeWidth={1.5} />
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
