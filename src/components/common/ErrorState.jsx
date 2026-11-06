import { Link } from 'react-router-dom';
import './ErrorState.css';

/**
 * Reusable friendly error/empty state.
 *
 * Props
 * ─────
 * title          string   – headline
 * message        string   – supporting text
 * icon           string   – emoji / character (default "⚠️")
 *
 * Primary action – exactly one of:
 *   primaryTo    string   – react-router <Link> destination
 *   primaryHref  string   – plain <a href>, safe outside the router
 *   onPrimary    fn       – button click callback
 * primaryLabel   string   – label for the primary action
 *
 * Optional secondary action:
 *   secondaryLabel  string
 *   onSecondary     fn
 */
function ErrorState({
  title = 'Something went wrong',
  message = '',
  icon = '⚠️',
  primaryLabel,
  primaryTo,
  primaryHref,
  onPrimary,
  secondaryLabel,
  onSecondary,
}) {
  function renderPrimary() {
    if (!primaryLabel) return null;

    if (primaryTo) {
      return (
        <Link to={primaryTo} className="btn btn-primary">
          {primaryLabel}
        </Link>
      );
    }

    if (primaryHref) {
      return (
        <a href={primaryHref} className="btn btn-primary">
          {primaryLabel}
        </a>
      );
    }

    if (onPrimary) {
      return (
        <button type="button" className="btn btn-primary" onClick={onPrimary}>
          {primaryLabel}
        </button>
      );
    }

    return null;
  }

  return (
    <div className="error-state empty-state">
      <div className="error-state__icon" aria-hidden="true">
        {icon}
      </div>
      <h3 className="error-state__title">{title}</h3>
      {message && <p className="error-state__message">{message}</p>}
      <div className="error-state__actions">
        {renderPrimary()}
        {secondaryLabel && onSecondary && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onSecondary}
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorState;

