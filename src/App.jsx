import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PageLayout from './components/member2/layout/PageLayout'
import PlaceholderPage from './pages/shared/PlaceholderPage'
import CustomersPage from './pages/member2/CustomersPage'
import CustomerDetailsPage from './pages/member2/CustomerDetailsPage'

import BusinessProfilePage from './pages/member2/BusinessProfilePage'
import InvoicePreviewPage from './pages/member2/InvoicePreviewPage'
import NotFoundPage from './pages/member2/NotFoundPage'
import './styles/member2.css'

// Sample data for development
const INITIAL_CUSTOMERS = [
  {
    id: 1,
    name: 'Ravi Kumar',
    email: 'ravi@example.com',
    phone: '91234 56789',
    address: '221 Model Town, Patiala, Punjab',
  },
  {
    id: 2,
    name: 'Anita Sharma',
    email: 'anita.sharma@example.com',
    phone: '98765 12340',
    address: 'Sector 14, Chandigarh',
  },
]

function App() {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS)
  const [businessProfile, setBusinessProfile] = useState(null)

  function addCustomer(data) {
    const newCustomer = { id: Date.now(), ...data }
    setCustomers((prev) => [...prev, newCustomer])
  }

  function updateCustomer(id, data) {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
  }

  function deleteCustomer(id) {
    setCustomers((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PageLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <PlaceholderPage title="Dashboard" description="Revenue overview and recent activity" />
            }
          />
          <Route
            path="invoices"
            element={<PlaceholderPage title="Invoices" description="Create and manage invoices" />}
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
            element={<PlaceholderPage title="Payments" description="Track payments and dues" />}
          />
          <Route
            path="business-profile"
            element={<BusinessProfilePage profile={businessProfile} onSave={setBusinessProfile} />}
          />
          <Route path="invoice-preview" element={<InvoicePreviewPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
