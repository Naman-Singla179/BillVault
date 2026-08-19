import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { getCustomers, saveCustomers, getBusiness, saveBusiness } from './services/storage'
import PageLayout from './components/layout/PageLayout'
import DashboardPage from './pages/DashboardPage'
import PlaceholderPage from './pages/PlaceholderPage'
import CustomersPage from './pages/CustomersPage'
import CustomerDetailsPage from './pages/CustomerDetailsPage'

import BusinessProfilePage from './pages/BusinessProfilePage'
import InvoicePreviewPage from './pages/InvoicePreviewPage'
import NotFoundPage from './pages/NotFoundPage'
import LandingPage from './pages/LandingPage'
import CreateInvoice from './pages/Invoices/CreateInvoice'
import Payments from './pages/Payments/Payments'
import './styles/global.css'


const INITIAL_CUSTOMERS = [];

function App() {
  const [customers, setCustomers] = useState(() => {
    const saved = getCustomers();
    return saved.length > 0 ? saved : INITIAL_CUSTOMERS;
  });
  const [businessProfile, setBusinessProfile] = useState(() => getBusiness())

  useEffect(() => {
    saveCustomers(customers);
  }, [customers]);

  useEffect(() => {
    if (businessProfile && Object.keys(businessProfile).length > 0) {
      saveBusiness(businessProfile);
    }
  }, [businessProfile]);

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
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
