import { screen } from '@testing-library/react';
import { renderWithProviders, userEvent } from './testUtils';
import ErrorBoundary from '../components/common/ErrorBoundary';

// ── Helpers ───────────────────────────────────────────────────────────────

function ThrowOnce({ shouldThrow }) {
  if (shouldThrow) throw new Error('Test render error');
  return <p>All good</p>;
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('ErrorBoundary', () => {
  // Silence the expected console.error from React's error boundary machinery.
  let consoleErrorSpy;
  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('shows fallback when child throws', () => {
    renderWithProviders(
      <ErrorBoundary>
        <ThrowOnce shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.queryByText('All good')).not.toBeInTheDocument();
  });

  test('"Try again" clears the error when the child no longer throws', async () => {
    // We need to control the throwing from outside the component tree.
    let throwing = true;

    function ControlledChild() {
      if (throwing) throw new Error('Test render error');
      return <p>Recovered</p>;
    }

    const user = userEvent.setup();
    renderWithProviders(
      <ErrorBoundary>
        <ControlledChild />
      </ErrorBoundary>
    );

    // Boundary is showing the fallback.
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Stop throwing, then click "Try again".
    throwing = false;
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    // Child should now render successfully.
    expect(screen.getByText('Recovered')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });
});
