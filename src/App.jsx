import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PageLayout from './components/layout/PageLayout'
import DashboardPage from './pages/DashboardPage'
import PlaceholderPage from './pages/PlaceholderPage'
import CustomersPage from './pages/CustomersPage'
import CustomerDetailsPage from './pages/CustomerDetailsPage'

import BusinessProfilePage from './pages/BusinessProfilePage'
import InvoicePreviewPage from './pages/InvoicePreviewPage'
import NotFoundPage from './pages/NotFoundPage'
import LandingPage from './pages/LandingPage'
import './styles/global.css'

import CreateInvoice from './pages/Invoices/CreateInvoice';
import Payments from './pages/Payments/Payments';

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
        <Route path="/" element={<LandingPage />} />
        <Route element={<PageLayout />}>
          <Route
            path="dashboard"
            element={<DashboardPage />}
          />
          <Route
            path="invoices"
            element={<CreateInvoice />} 
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
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;