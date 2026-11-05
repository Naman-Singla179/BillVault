import { useState, useEffect, useRef } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import './Navbar.css'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/invoices', label: 'Invoices' },
  { to: '/customers', label: 'Customers' },
  { to: '/payments', label: 'Payments' },
  { to: '/products', label: 'Products' },
]

function Navbar({ profile }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navRef = useRef(null)
  const location = useLocation()
  const [prevPath, setPrevPath] = useState(location.pathname)

  // Close mobile navigation drawer whenever route changes
  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname)
    if (mobileMenuOpen) {
      setMobileMenuOpen(false)
    }
  }

  const bizName = profile?.name || "My Business"
  const bizInitials = bizName.substring(0, 2).toUpperCase()

  // Handle escape key and outside click to close mobile menu
  useEffect(() => {
    if (!mobileMenuOpen) return

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false)
      }
    }

    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mobileMenuOpen])

  return (
    <header className="navbar" ref={navRef}>
      <div className="navbar-left">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="navbar-hamburger"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {mobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>

        <Link to="/dashboard" className="navbar-brand-link">
          <div className="navbar-brand">
            <span className="navbar-brand-mark">BV</span>
            <span className="navbar-brand-name">BillVault</span>
          </div>
        </Link>

        {/* Desktop Primary Navigation */}
        <nav className="navbar-nav" aria-label="Primary navigation">
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

      <div className="navbar-right">
        <Link
          to="/business-profile"
          className="navbar-business-link"
          title="Business Profile"
          aria-label={`Business Profile: ${bizName}`}
        >
          <div className="navbar-avatar" aria-hidden="true">
            {bizInitials}
          </div>
          <div className="navbar-business">
            <span className="navbar-business-name">{bizName}</span>
            <span className="navbar-business-sub">Free plan</span>
          </div>
        </Link>

        <Link
          to="/"
          className="btn-icon navbar-signout-btn"
          title="Sign Out"
          aria-label="Sign out"
        >
          <LogOut size={18} aria-hidden="true" />
        </Link>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="navbar-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <nav
            id="mobile-navigation"
            className="navbar-mobile-menu"
            aria-label="Mobile navigation"
          >
            <div className="navbar-mobile-nav-list">
              {NAV_ITEMS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `navbar-mobile-link ${isActive ? 'navbar-mobile-link-active' : ''}`
                  }
                >
                  {label}
                </NavLink>
              ))}

              <div className="navbar-mobile-divider" />

              <NavLink
                to="/business-profile"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `navbar-mobile-link ${isActive ? 'navbar-mobile-link-active' : ''}`
                }
              >
                Business Profile
              </NavLink>

              <NavLink
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="navbar-mobile-link"
              >
                Sign Out
              </NavLink>
            </div>
          </nav>
        </>
      )}
    </header>
  )
}

export default Navbar
