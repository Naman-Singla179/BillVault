import { useState } from 'react'
import './CustomerForm.css'

const EMPTY_FORM = { name: '', email: '', phone: '', gstin: '', address: '' }

function CustomerForm({ initialData, onSave, onCancel }) {
  const [form, setForm] = useState(() => (initialData ? {
    name: initialData.name || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    gstin: initialData.gstin || '',
    address: initialData.address || '',
  } : EMPTY_FORM))

  const [errors, setErrors] = useState({})

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  function validate() {
    const nextErrors = {}

    // Name validation
    if (!form.name.trim()) {
      nextErrors.name = 'Full name is required'
    }

    // Phone validation (10 digits)
    const cleanPhone = form.phone.replace(/\D/g, '')
    if (!form.phone.trim()) {
      nextErrors.phone = 'Phone number is required'
    } else if (cleanPhone.length !== 10) {
      nextErrors.phone = 'Phone number must be exactly 10 digits'
    }

    // Email validation (optional, but validate format if entered)
    if (form.email && form.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(form.email.trim())) {
        nextErrors.email = 'Please enter a valid email address (e.g. client@example.com)'
      }
    }

    // GSTIN validation (optional, but must be 15 alphanumeric characters if entered)
    if (form.gstin && form.gstin.trim()) {
      const gstinVal = form.gstin.trim().toUpperCase()
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
      if (gstinVal.length !== 15 || !gstinRegex.test(gstinVal)) {
        nextErrors.gstin = 'Enter a valid 15-character GSTIN (e.g. 04AABCB5678F1Z2)'
      }
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

    onSave({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.replace(/\D/g, '').slice(0, 10),
      gstin: form.gstin.trim().toUpperCase(),
      address: form.address.trim(),
    })
  }

  return (
    <form className="customer-form card" onSubmit={handleSubmit} noValidate>
      <h3 className="customer-form-title">
        {initialData ? 'Edit Customer Details' : 'Add New Customer'}
      </h3>

      <div className="form-field">
        <label htmlFor="customer-name">
          Customer / Business Name <span className="required">*</span>
        </label>
        <input
          id="customer-name"
          type="text"
          aria-required="true"
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'customer-name-error' : undefined}
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g. Skyline Heights Developers or Rahul Sharma"
        />
        {errors.name && (
          <span id="customer-name-error" className="field-error" role="alert">
            {errors.name}
          </span>
        )}
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="customer-phone">
            Phone Number <span className="required">*</span>
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
            placeholder="10-digit number (e.g. 9814123456)"
          />
          {errors.phone && (
            <span id="customer-phone-error" className="field-error" role="alert">
              {errors.phone}
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="customer-email">Email Address</label>
          <input
            id="customer-email"
            type="email"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'customer-email-error' : undefined}
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="e.g. billing@skylineheights.in"
          />
          {errors.email && (
            <span id="customer-email-error" className="field-error" role="alert">
              {errors.email}
            </span>
          )}
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="customer-gstin">GSTIN (Optional)</label>
        <input
          id="customer-gstin"
          type="text"
          maxLength={15}
          aria-invalid={errors.gstin ? 'true' : 'false'}
          aria-describedby={errors.gstin ? 'customer-gstin-error' : undefined}
          value={form.gstin}
          onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
          placeholder="15-character GSTIN (e.g. 04AABCB5678F1Z2)"
        />
        {errors.gstin && (
          <span id="customer-gstin-error" className="field-error" role="alert">
            {errors.gstin}
          </span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="customer-address">Billing & Delivery Address</label>
        <textarea
          id="customer-address"
          rows="3"
          value={form.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Site address, tower/plot number, city, state, PIN"
        />
      </div>

      <div className="form-actions customer-form-actions">
        <button type="submit" className="btn btn-primary">
          {initialData ? 'Save Changes' : 'Save Customer'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default CustomerForm
