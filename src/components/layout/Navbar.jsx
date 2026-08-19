import { NavLink, Link } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import './Navbar.css'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/invoices', label: 'Invoices' },
  { to: '/customers', label: 'Customers' },
  { to: '/payments', label: 'Payments' },
]

function Navbar({ title, profile }) {
  const bizName = profile?.name || "My Business";
  const bizInitials = bizName.substring(0, 2).toUpperCase();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="navbar-brand">
          <span className="navbar-brand-mark">BV</span>
          <span className="navbar-brand-name">BillVault</span>
        </div>
        <nav className="navbar-nav">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `navbar-link ${isActive ? 'navbar-link-active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="navbar-right" style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/business-profile" className="navbar-business-link">
          <div className="navbar-avatar" aria-hidden="true">
            {bizInitials}
          </div>
          <div className="navbar-business">
            <span className="navbar-business-name">{bizName}</span>
            <span className="navbar-business-sub">Free plan</span>
          </div>
        </Link>
        
        <Link to="/" className="btn-icon" title="Sign Out" style={{ marginLeft: '12px', display: 'flex' }}>
          <LogOut size={20} />
        </Link>
      </div>
    </header>
  )
}

export default Navbar
