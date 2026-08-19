import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import './PageLayout.css'

const TITLES = [
  { match: '/dashboard', title: 'Dashboard' },
  { match: '/invoices', title: 'Invoices' },
  { match: '/customers', title: 'Customers' },
  { match: '/payments', title: 'Payments' },
  { match: '/settings/business-profile', title: 'Business Profile' },
  { match: '/settings', title: 'Settings' },
  { match: '/invoice-preview', title: 'Invoice Preview' },
]

function getTitle(pathname) {
  const found = TITLES.find((entry) => pathname.startsWith(entry.match))
  return found ? found.title : 'BillVault'
}

function PageLayout({ profile }) {
  const location = useLocation()

  return (
    <div className="app-shell">
      <div className="app-shell-main">
        <Navbar title={getTitle(location.pathname)} profile={profile} />
        <main className="app-shell-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default PageLayout
