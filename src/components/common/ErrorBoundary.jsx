import { Component } from 'react';
import ErrorState from './ErrorState';

/**
 * Class-based error boundary.
 *
 * Props
 * ─────
 * children    ReactNode  – subtree to protect
 * resetKey    any        – when this value changes the error is cleared
 * fallback    ReactNode  – custom fallback; default renders ErrorState
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught render error:', error, info);
  }

  componentDidUpdate(prevProps) {
    // Clear error when resetKey changes so a navigation heals the boundary.
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <ErrorState
        icon="💥"
        title="Something went wrong"
        message="An unexpected error occurred on this page. You can try again or go back to the dashboard."
        primaryLabel="Try again"
        onPrimary={this.handleReset}
        secondaryLabel="Go to Dashboard"
        // Use plain <a> — boundary may sit outside the router
        onSecondary={() => { window.location.href = '/dashboard'; }}
      />
    );
  }
}

export default ErrorBoundary;

