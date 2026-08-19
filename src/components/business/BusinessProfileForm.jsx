import { useState } from 'react'
import './BusinessProfileForm.css'

const DEFAULT_PROFILE = {
  name: '',
  email: '',
  phone: '',
  address: '',
  gstin: '',
  upiId: '',
}

function BusinessProfileForm({ initialData, onSave }) {
  const [form, setForm] = useState(initialData || DEFAULT_PROFILE)
  const [logoPreview, setLogoPreview] = useState(null)
  const [saved, setSaved] = useState(false)

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  function handleLogoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setLogoPreview(url)
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave(form)
    setSaved(true)
  }

  function handleReset() {
    setForm(initialData || DEFAULT_PROFILE)
    setSaved(false)
  }

  return (
    <form className="business-form card" onSubmit={handleSubmit}>
      <div className="business-form-logo">
        <div className="business-form-logo-preview">
          {logoPreview ? (
            <img src={logoPreview} alt="Business logo preview" />
          ) : (
            <span>LOGO</span>
          )}
        </div>
        <div>
          <label htmlFor="logo-upload" className="btn btn-secondary business-form-logo-btn">
            Upload logo
          </label>
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="business-form-logo-input"
          />
          <p className="business-form-logo-hint">PNG or JPG, appears on invoices</p>
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="business-name">
            Business Name <span className="required">*</span>
          </label>
          <input
            id="business-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g. Sharma Traders"
          />
        </div>

        <div className="form-field">
          <label htmlFor="business-email">Email <span className="required">*</span></label>
          <input
            id="business-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="e.g. billing@sharmatraders.com"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="business-phone">Phone <span className="required">*</span></label>
          <input
            id="business-phone"
            type="tel"
            required
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="e.g. 98765 43210"
          />
        </div>

        <div className="form-field">
          <label htmlFor="business-gstin">GSTIN <span className="required">*</span></label>
          <input
            id="business-gstin"
            type="text"
            required
            value={form.gstin}
            onChange={(e) => handleChange('gstin', e.target.value)}
            placeholder="e.g. 22AAAAA0000A1Z5"
          />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="business-address">Address <span className="required">*</span></label>
        <textarea
          id="business-address"
          rows="3"
          required
          value={form.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Shop / street, city, state, PIN"
        />
      </div>

      <div className="form-field">
        <label htmlFor="business-upi">UPI ID <span className="required">*</span></label>
        <input
          id="business-upi"
          type="text"
          required
          value={form.upiId}
          onChange={(e) => handleChange('upiId', e.target.value)}
          placeholder="e.g. sharmatraders@upi"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleReset}>
          Reset
        </button>
        {saved && <span className="business-form-saved">Saved</span>}
      </div>
    </form>
  )
}

export default BusinessProfileForm
