import { Link } from 'react-router-dom'
import './NotFoundPage.css'

function NotFoundPage() {
  return (
    <div className="page notfound-page">
      <div className="card notfound-card">
        <span className="notfound-code">404</span>
        <h1>Page not found</h1>
        <p>The page you're looking for doesn't exist or may have moved.</p>
        <Link to="/dashboard" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
