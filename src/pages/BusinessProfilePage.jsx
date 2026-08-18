
import { Link } from 'react-router-dom'
import BusinessProfileForm from '../components/business/BusinessProfileForm'

function BusinessProfilePage({ profile, onSave }) {
  return (
    <div className="page">
      <div className="page-header">
        <div>

          <h1>Business Profile</h1>
          <p>These details appear on every invoice you send.</p>
        </div>
      </div>
      <BusinessProfileForm initialData={profile} onSave={onSave} />
    </div>
  )
}

export default BusinessProfilePage
