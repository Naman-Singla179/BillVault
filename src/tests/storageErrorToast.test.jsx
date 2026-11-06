import { screen, act } from '@testing-library/react';
import { renderWithProviders } from './testUtils';
import { STORAGE_ERROR_EVENT } from '../services/storage';

function dispatch(type, key) {
  window.dispatchEvent(
    new CustomEvent(STORAGE_ERROR_EVENT, { detail: { key, type } })
  );
}

describe('storage error → toast', () => {
  test('a write error dispatched inside renderWithProviders shows the error toast', async () => {
    renderWithProviders(<div>App shell</div>);

    act(() => dispatch('write', 'billvault_customers'));

    expect(
      await screen.findByText(
        "Couldn't save your changes. Your browser storage may be full."
      )
    ).toBeInTheDocument();
  });

  test('dispatching the same event twice shows the toast only once', async () => {
    renderWithProviders(<div>App shell</div>);

    act(() => {
      dispatch('read', 'billvault_invoices');
      dispatch('read', 'billvault_invoices');
    });

    // findAllByText throws if nothing is found; we expect exactly one match.
    const toasts = await screen.findAllByText(
      "Some saved data couldn't be read, so defaults are being shown."
    );
    expect(toasts).toHaveLength(1);
  });
});

