import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'
import PageLayout from './components/layout/PageLayout'
import DashboardPage from './pages/DashboardPage'

import CustomersPage from './pages/CustomersPage'
import CustomerDetailsPage from './pages/CustomerDetailsPage'

import BusinessProfilePage from './pages/BusinessProfilePage'
import InvoicePreviewPage from './pages/InvoicePreviewPage'
import CreateInvoice from './pages/Invoices/CreateInvoice'
import Payments from './pages/Payments/Payments'
import './styles/global.css'

function App() {
  const { customers, businessProfile, addCustomer, updateCustomer, deleteCustomer, setBusinessProfile } = useApp()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<PageLayout profile={businessProfile} />}>
          <Route
            path="dashboard"
            element={<DashboardPage profile={businessProfile} />}
          />
          <Route
            path="invoices"
            element={<CreateInvoice customers={customers} onAddCustomer={addCustomer} />}
          />
          <Route
            path="customers"
            element={
              <CustomersPage
                customers={customers}
                onAdd={addCustomer}
                onUpdate={updateCustomer}
                onDelete={deleteCustomer}
              />
            }
          />
          <Route
            path="customers/:id"
            element={
              <CustomerDetailsPage
                customers={customers}
                onUpdate={updateCustomer}
                onDelete={deleteCustomer}
              />
            }
          />
          <Route
            path="payments"
            element={<Payments />}
          />
          <Route
            path="business-profile"
            element={<BusinessProfilePage profile={businessProfile} onSave={setBusinessProfile} />}
          />
          <Route path="invoice-preview" element={<InvoicePreviewPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
