import { useState, useEffect } from 'react'
import { getSettings, saveSettings } from '../../services/storage'
import { Sun, Moon, Check } from 'lucide-react'
import './BusinessProfileForm.css'

const DEFAULT_PROFILE = {
  name: 'BuildCraft Infra & Construction Pvt. Ltd.',
  email: 'accounts@buildcraftinfra.com',
  phone: '9876543210',
  address: 'Plot 45-B, Industrial Area Phase 2, Chandigarh, 160002',
  gstin: '04AABCB5678F1Z2',
  upiId: 'buildcraft@okaxis',
}

function BusinessProfileForm({ initialData, onSave }) {
  const [form, setForm] = useState(() => (initialData && initialData.name ? initialData : DEFAULT_PROFILE))
  const [logoPreview, setLogoPreview] = useState(null)
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState({})

  // Theme settings (Dark / Light)
  const [theme, setTheme] = useState(() => getSettings().theme || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Sync state if initialData changes after mount
  const [prevData, setPrevData] = useState(initialData)
  if (initialData !== prevData) {
    setPrevData(initialData)
    if (initialData && initialData.name) {
      setForm(initialData)
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  function handleLogoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setLogoPreview(url)
  }

  function validate() {
    const errs = {}

    // Name validation
    if (!form.name.trim()) {
      errs.name = 'Business name is required'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.email.trim()) {
      errs.email = 'Email address is required'
    } else if (!emailRegex.test(form.email.trim())) {
      errs.email = 'Enter a valid email address (e.g. accounts@business.com)'
    }

    // Phone validation
    const cleanPhone = form.phone.replace(/\D/g, '')
    if (!form.phone.trim()) {
      errs.phone = 'Phone number is required'
    } else if (cleanPhone.length !== 10) {
      errs.phone = 'Phone number must be exactly 10 digits'
    }

    // GSTIN validation (15 alphanumeric characters)
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    const gstinVal = form.gstin.trim().toUpperCase()
    if (!gstinVal) {
      errs.gstin = 'GSTIN is required for tax invoicing'
    } else if (gstinVal.length !== 15 || !gstinRegex.test(gstinVal)) {
      errs.gstin = 'Enter a valid 15-character GSTIN (e.g. 04AABCB5678F1Z2)'
    }

    // Address validation
    if (!form.address.trim()) {
      errs.address = 'Business address is required'
    }

    // UPI ID validation
    if (!form.upiId.trim()) {
      errs.upiId = 'UPI ID is required for QR code payments'
    }

    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    onSave({
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.replace(/\D/g, '').slice(0, 10),
      gstin: form.gstin.trim().toUpperCase(),
      address: form.address.trim(),
      upiId: form.upiId.trim(),
    })
    setSaved(true)
  }

  function handleReset() {
    setForm(DEFAULT_PROFILE)
    setErrors({})
    setSaved(false)
  }

  function handleThemeChange(newTheme) {
    setTheme(newTheme)
    const current = getSettings()
    saveSettings({ ...current, theme: newTheme })
  }

  return (
    <form className="business-form card" onSubmit={handleSubmit} noValidate>
      {/* Theme Appearance Selector */}
      <div className="business-form-theme-section">
        <label className="theme-section-label">Appearance & Display Theme</label>
        <div className="theme-toggle-chips" role="radiogroup" aria-label="Theme mode selection">
          <button
            type="button"
            className={`theme-chip-btn ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => handleThemeChange('dark')}
            role="radio"
            aria-checked={theme === 'dark'}
          >
            <Moon size={15} aria-hidden="true" />
            <span>Dark Theme</span>
            {theme === 'dark' && <Check size={14} className="theme-check-icon" aria-hidden="true" />}
          </button>
          <button
            type="button"
            className={`theme-chip-btn ${theme === 'light' ? 'active' : ''}`}
            onClick={() => handleThemeChange('light')}
            role="radio"
            aria-checked={theme === 'light'}
          >
            <Sun size={15} aria-hidden="true" />
            <span>Light Theme</span>
            {theme === 'light' && <Check size={14} className="theme-check-icon" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div className="business-form-logo">
        <div className="business-form-logo-preview" aria-hidden="true">
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
            aria-label="Upload business logo image"
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
            aria-required="true"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'biz-name-error' : undefined}
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g. BuildCraft Infra & Construction"
          />
          {errors.name && (
            <span id="biz-name-error" className="field-error" role="alert">
              {errors.name}
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="business-email">
            Email <span className="required">*</span>
          </label>
          <input
            id="business-email"
            type="email"
            required
            aria-required="true"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'biz-email-error' : undefined}
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="e.g. accounts@buildcraftinfra.com"
          />
          {errors.email && (
            <span id="biz-email-error" className="field-error" role="alert">
              {errors.email}
            </span>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="business-phone">
            Phone <span className="required">*</span>
          </label>
          <input
            id="business-phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            required
            aria-required="true"
            aria-invalid={errors.phone ? 'true' : 'false'}
            aria-describedby={errors.phone ? 'biz-phone-error' : undefined}
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="e.g. 9876543210"
          />
          {errors.phone && (
            <span id="biz-phone-error" className="field-error" role="alert">
              {errors.phone}
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="business-gstin">
            GSTIN <span className="required">*</span>
          </label>
          <input
            id="business-gstin"
            type="text"
            maxLength={15}
            required
            aria-required="true"
            aria-invalid={errors.gstin ? 'true' : 'false'}
            aria-describedby={errors.gstin ? 'biz-gstin-error' : undefined}
            value={form.gstin}
            onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
            placeholder="e.g. 04AABCB5678F1Z2"
          />
          {errors.gstin && (
            <span id="biz-gstin-error" className="field-error" role="alert">
              {errors.gstin}
            </span>
          )}
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="business-address">
          Address <span className="required">*</span>
        </label>
        <textarea
          id="business-address"
          rows="3"
          required
          aria-required="true"
          aria-invalid={errors.address ? 'true' : 'false'}
          aria-describedby={errors.address ? 'biz-address-error' : undefined}
          value={form.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Shop / plot, industrial area, city, state, PIN"
        />
        {errors.address && (
          <span id="biz-address-error" className="field-error" role="alert">
            {errors.address}
          </span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="business-upi">
          UPI ID <span className="required">*</span>
        </label>
        <input
          id="business-upi"
          type="text"
          required
          aria-required="true"
          aria-invalid={errors.upiId ? 'true' : 'false'}
          aria-describedby={errors.upiId ? 'biz-upi-error' : undefined}
          value={form.upiId}
          onChange={(e) => handleChange('upiId', e.target.value)}
          placeholder="e.g. buildcraft@okaxis"
        />
        {errors.upiId && (
          <span id="biz-upi-error" className="field-error" role="alert">
            {errors.upiId}
          </span>
        )}
      </div>

      <div className="form-actions business-form-actions">
        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleReset}>
          Reset to Demo
        </button>
        {saved && <span className="business-form-saved" role="status">Saved Successfully</span>}
      </div>
    </form>
  )
}

export default BusinessProfileForm
