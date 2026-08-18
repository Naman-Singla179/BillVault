const KEYS = {
  customers: "billvault_customers",
  invoices: "billvault_invoices",
  payments: "billvault_payments",
  business: "billvault_business",
  settings: "billvault_settings",
};

function safeGet(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error(`storage.js: failed to read "${key}", using default.`, error);
    return defaultValue;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`storage.js: failed to save "${key}".`, error);
    return false;
  }
}

export function getCustomers() {
  return safeGet(KEYS.customers, []);
}

export function saveCustomers(customers) {
  return safeSet(KEYS.customers, customers);
}

export function getInvoices() {
  return safeGet(KEYS.invoices, []);
}

export function saveInvoices(invoices) {
  return safeSet(KEYS.invoices, invoices);
}

export function getPayments() {
  return safeGet(KEYS.payments, []);
}

export function savePayments(payments) {
  return safeSet(KEYS.payments, payments);
}

export function getBusiness() {
  return safeGet(KEYS.business, {});
}

export function saveBusiness(business) {
  return safeSet(KEYS.business, business);
}

export function getSettings() {
  return safeGet(KEYS.settings, {
    currency: "INR",
    taxPreference: "exclusive",
    theme: "dark",
  });
}

export function saveSettings(settings) {
  return safeSet(KEYS.settings, settings);
}

export function clearAllData() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}