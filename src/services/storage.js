export const STORAGE_EVENT = "billvault:storage-changed";

export const KEYS = {
  customers: "billvault_customers",
  invoices: "billvault_invoices",
  payments: "billvault_payments",
  products: "billvault_products",
  business: "billvault_business",
  settings: "billvault_settings",
  products: "billvault_products",
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
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }));
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

const DEFAULT_PRODUCTS = [
  {
    id: "PROD-001",
    name: "Printed Invoice Books (x10)",
    type: "Product",
    hsnSac: "4820",
    price: 1500,
    gst: 18,
    category: "Printing",
    stock: 50,
    description: "Pack of 10 custom invoice books",
    status: "Active"
  },
  {
    id: "PROD-002",
    name: "Logo Design",
    type: "Service",
    hsnSac: "9983",
    price: 5000,
    gst: 18,
    category: "Design",
    stock: null,
    description: "Custom business logo design",
    status: "Active"
  },
  {
    id: "PROD-003",
    name: "Custom Rubber Stamp",
    type: "Product",
    hsnSac: "9611",
    price: 1500,
    gst: 12,
    category: "Office",
    stock: 25,
    description: "Business name rubber stamp",
    status: "Active"
  },
  {
    id: "PROD-004",
    name: "Accounting Consultation",
    type: "Service",
    hsnSac: "9982",
    price: 2000,
    gst: 18,
    category: "Consulting",
    stock: null,
    description: "1-hour financial consultation",
    status: "Active"
  },
  {
    id: "PROD-005",
    name: "Receipt Paper Roll",
    type: "Product",
    hsnSac: "4811",
    price: 350,
    gst: 5,
    category: "Supplies",
    stock: 3,
    description: "Thermal receipt paper, 80mm",
    status: "Active"
  },
  {
    id: "PROD-006",
    name: "Business Card Set",
    type: "Product",
    hsnSac: "4911",
    price: 800,
    gst: 12,
    category: "Printing",
    stock: 0,
    description: "100 premium business cards",
    status: "Active"
  },
  {
    id: "PROD-007",
    name: "Website Maintenance",
    type: "Service",
    hsnSac: "9983",
    price: 3500,
    gst: 18,
    category: "Design",
    stock: null,
    description: "Monthly website updates & security check",
    status: "Active"
  },
  {
    id: "PROD-008",
    name: "A4 Copier Paper (5 Reams)",
    type: "Product",
    hsnSac: "4802",
    price: 1250,
    gst: 12,
    category: "Supplies",
    stock: 40,
    description: "75 GSM Multipurpose copy paper",
    status: "Active"
  },
  {
    id: "PROD-009",
    name: "GST Return Filing",
    type: "Service",
    hsnSac: "9982",
    price: 1500,
    gst: 18,
    category: "Consulting",
    stock: null,
    description: "Quarterly GST filing assistance",
    status: "Active"
  },
  {
    id: "PROD-010",
    name: "Ballpoint Pens (Box of 50)",
    type: "Product",
    hsnSac: "9608",
    price: 250,
    gst: 18,
    category: "Office",
    stock: 15,
    description: "Blue ink ballpoint pens",
    status: "Active"
  },
  {
    id: "PROD-011",
    name: "Brochure Design & Print",
    type: "Service",
    hsnSac: "9983",
    price: 4500,
    gst: 18,
    category: "Design",
    stock: null,
    description: "Tri-fold promotional brochure",
    status: "Active"
  },
  {
    id: "PROD-012",
    name: "Shipping Labels (500 Pack)",
    type: "Product",
    hsnSac: "4821",
    price: 600,
    gst: 18,
    category: "Supplies",
    stock: 18,
    description: "Self-adhesive thermal shipping labels",
    status: "Active"
  }
];

export function getProducts() {
  return safeGet(KEYS.products, DEFAULT_PRODUCTS);
}

export function saveProducts(products) {
  return safeSet(KEYS.products, products);
}

export function clearAllData() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key: null } }));
}