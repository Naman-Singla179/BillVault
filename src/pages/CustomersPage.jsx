import { useState, useMemo } from 'react'
import CustomerList from '../components/customers/CustomerList'
import CustomerForm from '../components/customers/CustomerForm'
import { useToast } from '../context/ToastContext'
import { getInvoices, getPayments } from '../services/storage'
import { calculateTotalPaid, calculatePaymentStatus } from '../utils/paymentUtils'
import { Users, AlertTriangle, CheckCircle2, TrendingUp, Plus } from 'lucide-react'

function formatINR(amount) {
  const num = Number(amount) || 0
  return '₹' + num.toLocaleString('en-IN')
}

function CustomersPage({ customers = [], onAdd, onUpdate, onDelete }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const toast = useToast()

  const invoices = getInvoices()
  const payments = getPayments()

  // Calculate overview metrics across all customers
  const metrics = useMemo(() => {
    let totalOutstanding = 0
    let overdueCustomerCount = 0
    let activeCustomerCount = 0

    customers.forEach((c) => {
      const custInvoices = invoices.filter(
        (i) => String(i.customerId) === String(c.id) || i.customerId === c.name
      )
      if (custInvoices.length > 0) activeCustomerCount++

      let custBilled = 0
      let custPaid = 0
      let hasOverdue = false

      custInvoices.forEach((inv) => {
        const invTotal = Number(inv.total) || 0
        const invPaid = calculateTotalPaid(payments, inv.id)
        custBilled += invTotal
        custPaid += invPaid

        if (calculatePaymentStatus(inv, invPaid) === 'OVERDUE') {
          hasOverdue = true
        }
      })

      const bal = Math.max(0, custBilled - custPaid)
      totalOutstanding += bal
      if (hasOverdue) overdueCustomerCount++
    })

    return {
      totalCustomers: customers.length,
      activeCustomerCount,
      totalOutstanding,
      overdueCustomerCount,
    }
  }, [customers, invoices, payments])

  function openAddForm() {
    setEditingCustomer(null)
    setFormOpen(true)
  }

  function openEditForm(customer) {
    setEditingCustomer(customer)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingCustomer(null)
  }

  function handleSave(formData) {
    if (editingCustomer) {
      onUpdate(editingCustomer.id, formData)
      toast.success(`Customer "${formData.name}" updated successfully!`)
    } else {
      onAdd(formData)
      toast.success(`Customer "${formData.name}" added successfully!`)
    }
    closeForm()
  }

  return (
    <div className="page customers-page">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1>Customers Directory</h1>
          <p>Manage customer contacts, billing accounts, and overdue receivables.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openAddForm}>
          <Plus size={16} aria-hidden="true" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="product-stats-grid" style={{ marginBottom: 24 }}>
        <div className="product-stat-card">
          <div className="stat-icon-wrap icon-total" aria-hidden="true">
            <Users size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Customers</span>
            <div className="stat-value">{metrics.totalCustomers}</div>
            <span className="stat-sub">{metrics.activeCustomerCount} active billed accounts</span>
          </div>
        </div>

        <div className="product-stat-card">
          <div className="stat-icon-wrap icon-out" aria-hidden="true">
            <AlertTriangle size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Overdue Accounts</span>
            <div className={`stat-value ${metrics.overdueCustomerCount > 0 ? 'text-danger' : 'text-neutral'}`}>
              {metrics.overdueCustomerCount}
            </div>
            <span className="stat-sub">{metrics.overdueCustomerCount > 0 ? 'Follow-up needed' : 'All accounts current'}</span>
          </div>
        </div>

        <div className="product-stat-card">
          <div className="stat-icon-wrap icon-low" aria-hidden="true">
            <TrendingUp size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Receivables</span>
            <div className={`stat-value ${metrics.totalOutstanding > 0 ? 'text-warning' : 'text-success'}`}>
              {formatINR(metrics.totalOutstanding)}
            </div>
            <span className="stat-sub">Pending customer settlements</span>
          </div>
        </div>

        <div className="product-stat-card">
          <div className="stat-icon-wrap icon-value" aria-hidden="true">
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Settled Clients</span>
            <div className="stat-value text-success">
              {metrics.totalCustomers - metrics.overdueCustomerCount}
            </div>
            <span className="stat-sub">Good payment standing</span>
          </div>
        </div>
      </div>

      {formOpen && (
        <div style={{ marginBottom: 24 }}>
          <CustomerForm initialData={editingCustomer} onSave={handleSave} onCancel={closeForm} />
        </div>
      )}

      <CustomerList customers={customers} onEdit={openEditForm} onDelete={onDelete} />
    </div>
  )
}

export default CustomersPage
