/* eslint-disable react-refresh/only-export-components */
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '../context/ToastContext';
import { AppProvider } from '../context/AppContext';
import {
  saveCustomers,
  saveInvoices,
  savePayments,
  saveProducts,
  saveBusiness,
  saveSettings,
} from '../services/storage';

export function renderWithProviders(ui, { route = '/', ...renderOptions } = {}) {
  function Wrapper({ children }) {
    return (
      /* Redux <Provider store={store}> will go here once Lakshman's store exists */
      <MemoryRouter initialEntries={[route]}>
        <ToastProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </ToastProvider>
      </MemoryRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export function seedStorage({ customers, invoices, payments, products, business, settings } = {}) {
  if (customers !== undefined) {
    saveCustomers(customers);
  }
  if (invoices !== undefined) {
    saveInvoices(invoices);
  }
  if (payments !== undefined) {
    savePayments(payments);
  }
  if (products !== undefined) {
    saveProducts(products);
  }
  if (business !== undefined) {
    saveBusiness(business);
  }
  if (settings !== undefined) {
    saveSettings(settings);
  }
}

export * from '@testing-library/react';
export { userEvent };
