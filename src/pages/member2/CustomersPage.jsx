import { useState } from 'react'
import CustomerList from '../../components/member2/customers/CustomerList'
import CustomerForm from '../../components/member2/customers/CustomerForm'

function CustomersPage({ customers, onAdd, onUpdate, onDelete }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)

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
    } else {
      onAdd(formData)
    }
    closeForm()
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>Manage your customers</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openAddForm}>
          + Add Customer
        </button>
      </div>

      {formOpen && (
        <CustomerForm initialData={editingCustomer} onSave={handleSave} onCancel={closeForm} />
      )}

      <CustomerList customers={customers} onEdit={openEditForm} onDelete={onDelete} />
    </div>
  )
}

export default CustomersPage
