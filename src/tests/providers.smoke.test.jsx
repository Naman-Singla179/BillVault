import { screen } from '@testing-library/react';
import { renderWithProviders, seedStorage, userEvent } from './testUtils';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

// Collects every toast reference the component receives across renders.
// If the toast object is ever recreated (unstable), the Set will grow > 1.
const collectedToastRefs = new Set();

function TestConsumer() {
  const { invoices } = useApp();
  const toast = useToast();

  // Record this render's toast reference — used by the stability assertion
  collectedToastRefs.add(toast);

  const invoiceToShow = invoices.find((inv) => inv.id === 'INV-SMOKE-001');

  return (
    <div>
      <h1>Providers Smoke Test</h1>

      {/* Renders the seeded invoice so the test can assert on it */}
      {invoiceToShow && (
        <p data-testid="invoice-row">
          {invoiceToShow.id} | {invoiceToShow.customerName} | ₹{invoiceToShow.total}
        </p>
      )}

      {/* Button that exercises useToast() — clicked by userEvent in the test */}
      <button onClick={() => toast.info('Hello')}>Show Toast</button>
    </div>
  );
}

describe('providers smoke test — regression: stable toast reference', () => {
  beforeEach(() => {
    collectedToastRefs.clear();
  });

  test(
    'toast.info() fires correctly, invoice is readable via useApp(), ' +
      'and the toast object is the same reference on every render',
    async () => {
      seedStorage({
        invoices: [
          {
            id: 'INV-SMOKE-001',
            customerName: 'Acme Corp',
            total: 1500,
            status: 'PENDING',
            dueDate: '2030-12-31',
          },
        ],
      });

      const user = userEvent.setup();

      renderWithProviders(<TestConsumer />);

      // (b) The seeded invoice is visible via useApp()
      expect(screen.getByTestId('invoice-row')).toBeInTheDocument();
      expect(screen.getByText(/INV-SMOKE-001 \| Acme Corp \| ₹1500/)).toBeInTheDocument();

      // (a) Clicking the button fires toast.info() and the toast text appears
      await user.click(screen.getByRole('button', { name: 'Show Toast' }));
      expect(screen.getByText('Hello')).toBeInTheDocument();

      // (c) Every toast reference collected across all renders is the same object.
      // If ToastContext ever regresses to an inline object literal, this will fail
      // immediately (size > 1) instead of hanging the test runner.
      expect(collectedToastRefs.size).toBe(1);
    }
  );
});
