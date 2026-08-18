import { useState } from 'react'
import './CustomerForm.css'

const EMPTY_FORM = { name: '', email: '', phone: '', address: '' }

function CustomerForm({ initialData, onSave, onCancel }) {
  const [form, setForm] = useState(initialData || EMPTY_FORM)
  const [errors, setErrors] = useState({})

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function validate() {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Full name is required'
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required'
    return nextErrors
  }

  function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    onSave(form)
  }

  return (
    <form className="customer-form card" onSubmit={handleSubmit}>
      <h3 className="customer-form-title">
        {initialData ? 'Edit Customer' : 'Add Customer'}
      </h3>

      <div className="form-field">
        <label htmlFor="customer-name">
          Full Name <span className="required">*</span>
        </label>
        <input
          id="customer-name"
          type="text"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g. Ravi Kumar"
        />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="customer-email">Email</label>
        <input
          id="customer-email"
          type="email"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="e.g. ravi@example.com"
        />
      </div>

      <div className="form-field">
        <label htmlFor="customer-phone">
          Phone <span className="required">*</span>
        </label>
        <input
          id="customer-phone"
          type="tel"
          value={form.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="e.g. 98765 43210"
        />
        {errors.phone && <span className="field-error">{errors.phone}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="customer-address">Address</label>
        <textarea
          id="customer-address"
          rows="3"
          value={form.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Street, city, state"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Save Customer
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default CustomerForm
