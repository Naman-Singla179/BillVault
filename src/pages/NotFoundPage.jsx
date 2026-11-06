import { useLocation, useNavigate } from 'react-router-dom';
import ErrorState from '../components/common/ErrorState';

function NotFoundPage() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="page">
      <ErrorState
        icon="🔍"
        title="Page not found"
        message={`The path "${location.pathname}" doesn't exist. It may have been moved or the link might be wrong.`}
        primaryLabel="Go to Dashboard"
        primaryTo="/dashboard"
        secondaryLabel="Go back"
        onSecondary={() => navigate(-1)}
      />
    </div>
  );
}

export default NotFoundPage;

