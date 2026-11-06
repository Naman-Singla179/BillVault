import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useApp } from './context/AppContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import PageLayout from './components/layout/PageLayout'
import DashboardPage from './pages/DashboardPage'
import NotFoundPage from './pages/NotFoundPage'

import CustomersPage from './pages/CustomersPage'
import CustomerDetailsPage from './pages/CustomerDetailsPage'
import CustomerLedgerPage from './pages/CustomerLedgerPage'
import ProductsPage from './pages/ProductsPage'

import BusinessProfilePage from './pages/BusinessProfilePage'
import InvoicePreviewPage from './pages/InvoicePreviewPage'
import Invoices from './pages/Invoices/Invoices'
import CreateInvoice from './pages/Invoices/CreateInvoice'
import Payments from './pages/Payments/Payments'
import './styles/global.css'

/**
 * Wraps each page with an ErrorBoundary keyed to the current route.
 * When a page crashes its content area shows the fallback; the navbar
 * stays visible. Navigating to another route clears the error.
 */
function RouteGuard({ children }) {
  const location = useLocation();
  return (
    <ErrorBoundary resetKey={location.pathname}>
      {children}
    </ErrorBoundary>
  );
}

function App() {
  const { customers, businessProfile, addCustomer, updateCustomer, deleteCustomer, setBusinessProfile } = useApp()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<PageLayout profile={businessProfile} />}>
          <Route
            path="dashboard"
            element={<RouteGuard><DashboardPage profile={businessProfile} /></RouteGuard>}
          />
          <Route
            path="invoices"
            element={<RouteGuard><Invoices /></RouteGuard>}
          />
          <Route
            path="invoices/new"
            element={<RouteGuard><CreateInvoice customers={customers} onAddCustomer={addCustomer} /></RouteGuard>}
          />
          <Route
            path="invoices/edit/:id"
            element={<RouteGuard><CreateInvoice customers={customers} onAddCustomer={addCustomer} /></RouteGuard>}
          />
          <Route
            path="customers"
            element={
              <RouteGuard>
                <CustomersPage
                  customers={customers}
                  onAdd={addCustomer}
                  onUpdate={updateCustomer}
                  onDelete={deleteCustomer}
                />
              </RouteGuard>
            }
          />
          <Route
            path="customers/:id"
            element={
              <RouteGuard>
                <CustomerDetailsPage
                  customers={customers}
                  onUpdate={updateCustomer}
                  onDelete={deleteCustomer}
                />
              </RouteGuard>
            }
          />
          <Route
            path="customers/:id/ledger"
            element={<RouteGuard><CustomerLedgerPage customers={customers} /></RouteGuard>}
          />
          <Route
            path="payments"
            element={<RouteGuard><Payments /></RouteGuard>}
          />
          <Route
            path="products"
            element={<RouteGuard><ProductsPage /></RouteGuard>}
          />
          <Route
            path="business-profile"
            element={<RouteGuard><BusinessProfilePage profile={businessProfile} onSave={setBusinessProfile} /></RouteGuard>}
          />
          <Route path="invoice-preview" element={<RouteGuard><InvoicePreviewPage /></RouteGuard>} />
          {/* Catch-all: unknown paths inside the layout keep the navbar visible */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
