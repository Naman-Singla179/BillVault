import InvoicePreview from '../../components/member2/invoicePreview/InvoicePreview'

/*
 * Sample data so the preview can be viewed on its own during Phase 1.
 * Integration point: once Invoice Core (Member 1) exists, this page
 * should receive `business`, `customer`, `invoice`, and `items` as
 * props/route data instead of using these placeholders.
 */
const SAMPLE_BUSINESS = {
  name: 'Sharma Traders',
  email: 'billing@sharmatraders.com',
  phone: '98765 43210',
  address: 'Shop 12, MG Road, Rajpura, Punjab',
  gstin: '03AAAAA0000A1Z5',
  upiId: 'sharmatraders@upi',
}

const SAMPLE_CUSTOMER = {
  name: 'Ravi Kumar',
  email: 'ravi@example.com',
  phone: '91234 56789',
  address: '221 Model Town, Patiala, Punjab',
}

const SAMPLE_INVOICE = {
  number: 'INV-1001',
  date: '2026-08-15',
  subtotal: '₹4,500.00',
  tax: '₹225.00',
  discount: '−₹100.00',
  total: '₹4,625.00',
  paymentStatus: 'unpaid',
}

const SAMPLE_ITEMS = [
  { id: 1, name: 'Printed Invoice Books (x10)', quantity: 2, price: '₹1,500.00', amount: '₹3,000.00' },
  { id: 2, name: 'Custom Stamp', quantity: 1, price: '₹1,500.00', amount: '₹1,500.00' },
]

function InvoicePreviewPage() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Invoice Preview</h1>
          <p>Sample preview — connects to real invoice data once Invoice Core is ready</p>
        </div>
      </div>
      <InvoicePreview
        business={SAMPLE_BUSINESS}
        customer={SAMPLE_CUSTOMER}
        invoice={SAMPLE_INVOICE}
        items={SAMPLE_ITEMS}
      />
    </div>
  )
}

export default InvoicePreviewPage
