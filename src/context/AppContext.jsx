// One shared place for all BillVault data.
// localStorage stays the source of truth. Every save fires an event
// (see storage.js), and this provider re-reads the changed data, so
// pages that still call storage.js directly stay in sync too.

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  KEYS,
  STORAGE_EVENT,
  getCustomers,
  saveCustomers,
  getInvoices,
  saveInvoices,
  getPayments,
  savePayments,
  getProducts,
  saveProducts,
  getBusiness,
  saveBusiness,
  getSettings,
  saveSettings,
} from "../services/storage";
import { reconcileInvoices } from "../utils/paymentUtils";

const AppContext = createContext(null);

// ids can be numbers (customers) or strings (invoice dropdown values)
function sameId(a, b) {
  return String(a) === String(b);
}

// ---- Customers ----
function addCustomer(data) {
  const customer = { id: Date.now(), ...data };
  saveCustomers([...getCustomers(), customer]);
  return customer;
}

function updateCustomer(id, data) {
  saveCustomers(
    getCustomers().map((c) => (sameId(c.id, id) ? { ...c, ...data } : c))
  );
}

function deleteCustomer(id) {
  saveCustomers(getCustomers().filter((c) => !sameId(c.id, id)));
}

// ---- Invoices ----
function addInvoice(data) {
  const invoice = { id: `INV-${Date.now()}`, ...data };
  saveInvoices([...getInvoices(), invoice]);
  return invoice;
}

function updateInvoice(id, data) {
  saveInvoices(
    getInvoices().map((i) => (sameId(i.id, id) ? { ...i, ...data } : i))
  );
}

function deleteInvoice(id) {
  saveInvoices(getInvoices().filter((i) => !sameId(i.id, id)));
}

// ---- Payments ----
function addPayment(data) {
  const payment = { id: `PAY${Date.now()}`, ...data };
  savePayments([...getPayments(), payment]);
  return payment;
}

function updatePayment(id, data) {
  savePayments(
    getPayments().map((p) => (sameId(p.id, id) ? { ...p, ...data } : p))
  );
}

function deletePayment(id) {
  savePayments(getPayments().filter((p) => !sameId(p.id, id)));
}

// ---- Products ----
function addProduct(data) {
  const product = { id: `PRD${Date.now()}`, ...data };
  saveProducts([...getProducts(), product]);
  return product;
}

function updateProduct(id, data) {
  saveProducts(
    getProducts().map((p) => (sameId(p.id, id) ? { ...p, ...data } : p))
  );
}

function deleteProduct(id) {
  saveProducts(getProducts().filter((p) => !sameId(p.id, id)));
}

// ---- Business profile and settings ----
function setBusinessProfile(data) {
  if (data && Object.keys(data).length > 0) {
    saveBusiness(data);
  }
}

function updateSettings(changes) {
  saveSettings({ ...getSettings(), ...changes });
}

export function AppProvider({ children }) {
  const [customers, setCustomers] = useState(getCustomers);
  const [invoices, setInvoices] = useState(getInvoices);
  const [payments, setPayments] = useState(getPayments);
  const [products, setProducts] = useState(getProducts);
  const [businessProfile, setBusinessState] = useState(getBusiness);
  const [settings, setSettingsState] = useState(getSettings);

  useEffect(() => {
    const refreshers = {
      [KEYS.customers]: () => setCustomers(getCustomers()),
      [KEYS.invoices]: () => setInvoices(getInvoices()),
      [KEYS.payments]: () => setPayments(getPayments()),
      [KEYS.products]: () => setProducts(getProducts()),
      [KEYS.business]: () => setBusinessState(getBusiness()),
      [KEYS.settings]: () => setSettingsState(getSettings()),
    };

    function refreshAll() {
      Object.values(refreshers).forEach((refresh) => refresh());
    }

    function handleChange(event) {
      const key = event.detail?.key ?? event.key;
      if (key && refreshers[key]) {
        refreshers[key]();
      } else if (!key) {
        refreshAll();
      }
    }

    refreshAll();
    window.addEventListener(STORAGE_EVENT, handleChange);
    window.addEventListener("storage", handleChange);

    return () => {
      window.removeEventListener(STORAGE_EVENT, handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  useEffect(() => {
    const diffs = reconcileInvoices(invoices, payments);
    if (diffs.length > 0) {
      const diffMap = new Map(diffs.map((d) => [String(d.id), d.status]));
      const updatedInvoices = invoices.map((inv) => {
        const newStatus = diffMap.get(String(inv.id));
        return newStatus ? { ...inv, status: newStatus } : inv;
      });
      saveInvoices(updatedInvoices);
    }
  }, [invoices, payments]);

  const value = useMemo(
    () => ({
      customers,
      invoices,
      payments,
      products,
      businessProfile,
      settings,

      getCustomerById: (id) => customers.find((c) => sameId(c.id, id)),
      getInvoiceById: (id) => invoices.find((i) => sameId(i.id, id)),
      getInvoicePayments: (invoiceId) =>
        payments.filter((p) => sameId(p.invoiceId, invoiceId)),

      addCustomer,
      updateCustomer,
      deleteCustomer,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      addPayment,
      updatePayment,
      deletePayment,
      addProduct,
      updateProduct,
      deleteProduct,
      setBusinessProfile,
      updateSettings,
    }),
    [customers, invoices, payments, products, businessProfile, settings]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside <AppProvider>");
  }
  return context;
}