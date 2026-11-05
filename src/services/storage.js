export const STORAGE_EVENT = "billvault:storage-changed";

export const KEYS = {
  customers: "billvault_customers",
  invoices: "billvault_invoices",
  payments: "billvault_payments",
  products: "billvault_products",
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

const DEFAULT_CONSTRUCTION_PRODUCTS = [
  {
    id: "PROD-CONST-001",
    name: "UltraTech Super PPC Cement (50kg Bag)",
    type: "Product",
    hsnSac: "2523",
    price: 380,
    gst: 28,
    category: "Cement & Aggregates",
    stock: 450,
    description: "High-grade Portland Pozzolana Cement for structural foundation and slab casting",
    status: "Active"
  },
  {
    id: "PROD-CONST-002",
    name: "Fe-550D TMT Steel Rebars (12mm, Metric Ton)",
    type: "Product",
    hsnSac: "7214",
    price: 62000,
    gst: 18,
    category: "Steel & Rebars",
    stock: 24,
    description: "Primary thermo-mechanically treated high-ductility reinforcement steel",
    status: "Active"
  },
  {
    id: "PROD-CONST-003",
    name: "River Sand Coarse Grade (100 Cu.Ft)",
    type: "Product",
    hsnSac: "2505",
    price: 4200,
    gst: 5,
    category: "Cement & Aggregates",
    stock: 15,
    description: "Triple washed coarse river sand for plastering and concrete mix",
    status: "Active"
  },
  {
    id: "PROD-CONST-004",
    name: "Red Clay Kiln Bricks (Per 1,000 Pcs)",
    type: "Product",
    hsnSac: "6901",
    price: 8500,
    gst: 12,
    category: "Bricks & Masonry",
    stock: 35,
    description: "First-class machine-moulded kiln burnt red clay bricks",
    status: "Active"
  },
  {
    id: "PROD-CONST-005",
    name: "Ready Mix Concrete M-25 Grade (Per Cu.Meter)",
    type: "Product",
    hsnSac: "3824",
    price: 4600,
    gst: 18,
    category: "Cement & Aggregates",
    stock: 80,
    description: "Standard design mix concrete for columns, beams, and slabs",
    status: "Active"
  },
  {
    id: "PROD-CONST-006",
    name: "Crushed Blue Metal Aggregates 20mm (100 Cu.Ft)",
    type: "Product",
    hsnSac: "2517",
    price: 3100,
    gst: 5,
    category: "Cement & Aggregates",
    stock: 20,
    description: "Machine-crushed angular granite aggregates for RCC construction",
    status: "Active"
  },
  {
    id: "PROD-CONST-007",
    name: "Heavy Excavator & JCB Earthwork (Per Hour)",
    type: "Service",
    hsnSac: "9954",
    price: 1800,
    gst: 18,
    category: "Civil Works & Equipment",
    stock: null,
    description: "Site levelling, basement excavation, and trenching with certified operator",
    status: "Active"
  },
  {
    id: "PROD-CONST-008",
    name: "Structural RCC Column & Slab Casting (Per Sq.Ft)",
    type: "Service",
    hsnSac: "9954",
    price: 240,
    gst: 18,
    category: "Civil Works & Equipment",
    stock: null,
    description: "Shuttering, rebar fixing, pouring, and vibrator compaction labor",
    status: "Active"
  },
  {
    id: "PROD-CONST-009",
    name: "Astral CPVC Plumbing Pipe 1 inch (Bundle of 10)",
    type: "Product",
    hsnSac: "3917",
    price: 3400,
    gst: 18,
    category: "Plumbing & Pipes",
    stock: 4,
    description: "Heavy duty hot and cold water distribution pipes (SDR 11)",
    status: "Active"
  },
  {
    id: "PROD-CONST-010",
    name: "Finolex FRLS Copper Wire 2.5 sq mm (90m Coil)",
    type: "Product",
    hsnSac: "8544",
    price: 2850,
    gst: 18,
    category: "Electrical & Wiring",
    stock: 0,
    description: "Flame retardant low smoke concealed electrical wiring cable",
    status: "Active"
  },
  {
    id: "PROD-CONST-011",
    name: "Double Charged Vitrified Tiles 2x2 ft (Box of 4)",
    type: "Product",
    hsnSac: "6907",
    price: 1250,
    gst: 18,
    category: "Finishing & Tiles",
    stock: 120,
    description: "Stain resistant glossy finish nano-polished floor tiles",
    status: "Active"
  },
  {
    id: "PROD-CONST-012",
    name: "Site Waterproofing & Epoxy Coating (Per Sq.Ft)",
    type: "Service",
    hsnSac: "9954",
    price: 85,
    gst: 18,
    category: "Civil Works & Equipment",
    stock: null,
    description: "Terrace and sunken slab chemical membrane waterproofing",
    status: "Active"
  },
  {
    id: "PROD-CONST-013",
    name: "Architectural Drafting & Structural Audit",
    type: "Service",
    hsnSac: "9983",
    price: 15000,
    gst: 18,
    category: "Civil Works & Equipment",
    stock: null,
    description: "CAD blueprints, structural load calculations, and municipal submission drawings",
    status: "Active"
  }
];

export function getProducts() {
  return safeGet(KEYS.products, DEFAULT_CONSTRUCTION_PRODUCTS);
}

export function saveProducts(products) {
  return safeSet(KEYS.products, products);
}

export function clearAllData() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key: null } }));
}
