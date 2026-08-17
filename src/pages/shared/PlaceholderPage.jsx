import './PlaceholderPage.css'

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
