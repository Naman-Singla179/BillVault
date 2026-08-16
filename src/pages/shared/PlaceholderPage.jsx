import './PlaceholderPage.css'

/**
 * Generic placeholder for pages owned by other team members
 * (Dashboard/Invoices -> Member 1, Payments -> Member 3).
 * This only exists so the navigation and routing work end-to-end;
 * it contains no business logic and should be replaced by the
 * owning member's real page.
 */
function PlaceholderPage({ title, description }) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
      <div className="card placeholder-card">
        <p>This page is being built by another team member.</p>
      </div>
    </div>
  )
}

export default PlaceholderPage
