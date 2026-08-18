import { NavLink, Link } from 'react-router-dom'
import './Navbar.css'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/invoices', label: 'Invoices' },
  { to: '/customers', label: 'Customers' },
  { to: '/payments', label: 'Payments' },
]

function Navbar() {
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

      <Link to="/business-profile" className="navbar-right navbar-business-link">
        <div className="navbar-business">
          <span className="navbar-business-name">My Business</span>
          <span className="navbar-business-sub">Free plan</span>
        </div>
        <div className="navbar-avatar" aria-hidden="true">
          MB
        </div>
      </Link>
    </header>
  )
}

export default Navbar
