import { useState } from 'react'
import './CustomerForm.css'

const EMPTY_FORM = { name: '', email: '', phone: '', address: '' }

function CustomerForm({ initialData, onSave, onCancel }) {
  const [form, setForm] = useState(initialData || EMPTY_FORM)
  const [errors, setErrors] = useState({})

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  function validate() {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Full name is required'
    if (!form.phone.trim()) {
      nextErrors.phone = 'Phone number is required'
    } else if (form.phone.replace(/\D/g, '').length !== 10) {
      nextErrors.phone = 'Phone number must be exactly 10 digits'
    }
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
    <form className="customer-form card" onSubmit={handleSubmit} noValidate>
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
          aria-required="true"
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'customer-name-error' : undefined}
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g. Skyline Heights Developers"
        />
        {errors.name && (
          <span id="customer-name-error" className="field-error" role="alert">
            {errors.name}
          </span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="customer-email">Email</label>
        <input
          id="customer-email"
          type="email"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="e.g. billing@skylineheights.in"
        />
      </div>

      <div className="form-field">
        <label htmlFor="customer-phone">
          Phone <span className="required">*</span>
        </label>
        <input
          id="customer-phone"
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          aria-required="true"
          aria-invalid={errors.phone ? 'true' : 'false'}
          aria-describedby={errors.phone ? 'customer-phone-error' : undefined}
          value={form.phone}
          onKeyDown={(e) => {
            if (
              ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) ||
              (e.ctrlKey || e.metaKey)
            ) {
              return
            }
            if (!/^[0-9]$/.test(e.key)) {
              e.preventDefault()
            }
          }}
          onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="10-digit number (e.g. 9876543210)"
        />
        {errors.phone && (
          <span id="customer-phone-error" className="field-error" role="alert">
            {errors.phone}
          </span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="customer-address">Address</label>
        <textarea
          id="customer-address"
          rows="3"
          value={form.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Street, site address, city, state, PIN"
        />
      </div>

      <div className="form-actions customer-form-actions">
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
