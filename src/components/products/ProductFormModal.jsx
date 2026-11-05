import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const GST_RATES = [0, 5, 12, 18, 28]

function getInitialForm(editingItem, existingProducts = []) {
  if (editingItem) {
    return {
      name: editingItem.name || '',
      sku: editingItem.sku || editingItem.id || '',
      type: editingItem.type || 'Product',
      hsnSac: editingItem.hsnSac || '',
      price: String(editingItem.price ?? ''),
      gst: String(editingItem.gst ?? '18'),
      category: editingItem.category || 'General',
      stock: editingItem.stock !== undefined && editingItem.stock !== null ? String(editingItem.stock) : '',
      description: editingItem.description || '',
      status: editingItem.status || 'Active',
    }
  }

  // Generate unique default SKU for new product
  let nextNum = existingProducts.length + 1
  let candidate = `PROD-${String(nextNum).padStart(3, '0')}`
  while (
    existingProducts.some(
      (p) =>
        String(p.id).toUpperCase() === candidate ||
        String(p.sku).toUpperCase() === candidate
    )
  ) {
    nextNum++
    candidate = `PROD-${String(nextNum).padStart(3, '0')}`
  }

  return {
    name: '',
    sku: candidate,
    type: 'Product',
    hsnSac: '',
    price: '',
    gst: '18',
    category: 'General',
    stock: '50',
    description: '',
    status: 'Active',
  }
}

function ProductFormModal({
  isOpen,
  onClose,
  onSave,
  editingItem,
  existingProducts = [],
}) {
  const [form, setForm] = useState(() =>
    getInitialForm(editingItem, existingProducts)
  )
  const [errors, setErrors] = useState({})

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  function validate() {
    const errs = {}

    // Name validation
    if (!form.name.trim()) {
      errs.name = 'Product or service name is required'
    }

    // SKU validation
    const trimmedSku = form.sku.trim()
    if (!trimmedSku) {
      errs.sku = 'Product ID / SKU is required'
    } else {
      const isDuplicate = existingProducts.some((p) => {
        const existingKey = String(p.sku || p.id).toUpperCase()
        const currentKey = trimmedSku.toUpperCase()
        if (editingItem && String(editingItem.id).toUpperCase() === existingKey) {
          return false
        }
        return existingKey === currentKey
      })

      if (isDuplicate) {
        errs.sku = `SKU "${trimmedSku}" is already taken by another item. Please choose a unique SKU.`
      }
    }

    // Price validation
    const priceNum = Number(form.price)
    if (form.price === '' || isNaN(priceNum) || priceNum < 0) {
      errs.price = 'Selling price must be a valid positive amount'
    }

    // GST validation
    const gstNum = Number(form.gst)
    if (form.gst === '' || isNaN(gstNum) || gstNum < 0 || gstNum > 100) {
      errs.gst = 'Please select a valid GST rate'
    }

    // Stock validation
    if (form.type === 'Product') {
      const stockNum = Number(form.stock)
      if (form.stock !== '' && (isNaN(stockNum) || stockNum < 0)) {
        errs.stock = 'Stock quantity must be a non-negative number'
      }
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

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      type: form.type,
      hsnSac: form.hsnSac.trim(),
      price: Number(form.price),
      gst: Number(form.gst),
      category: form.category.trim() || 'General',
      stock: form.type === 'Product' ? (form.stock === '' ? 0 : Number(form.stock)) : null,
      description: form.description.trim(),
      status: form.status,
    }

    onSave(payload)
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="card modal-content product-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 id="product-form-title">
              {editingItem ? 'Edit Product / Service' : 'Add New Product or Service'}
            </h2>
            <p className="modal-subtitle">
              {editingItem
                ? 'Update catalog details, pricing, and available stock levels.'
                : 'Create a new catalog item with SKU, HSN/SAC code, and GST tax rate.'}
            </p>
          </div>
          <button
            type="button"
            className="btn-icon modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-modal-form" noValidate>
          {/* Item Type & SKU */}
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="form-item-type">
                Item Type <span className="required-star">*</span>
              </label>
              <select
                id="form-item-type"
                value={form.type}
                onChange={(e) => {
                  const newType = e.target.value
                  setForm({
                    ...form,
                    type: newType,
                    stock: newType === 'Product' ? (form.stock || '50') : '',
                  })
                }}
              >
                <option value="Product">Product (Goods / Materials)</option>
                <option value="Service">Service (Labor / Consulting / Contracting)</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="form-item-sku">
                Product ID / SKU <span className="required-star">*</span>
              </label>
              <input
                id="form-item-sku"
                type="text"
                aria-required="true"
                aria-invalid={errors.sku ? 'true' : 'false'}
                aria-describedby={errors.sku ? 'form-sku-error' : undefined}
                value={form.sku}
                onChange={(e) => {
                  setForm({ ...form, sku: e.target.value })
                  if (errors.sku) setErrors({ ...errors, sku: '' })
                }}
                placeholder="e.g. PROD-001 or ELEC-101"
              />
              {errors.sku && (
                <span id="form-sku-error" className="error-text" role="alert">
                  {errors.sku}
                </span>
              )}
            </div>
          </div>

          {/* Product Name */}
          <div className="form-field">
            <label htmlFor="form-item-name">
              Product / Service Name <span className="required-star">*</span>
            </label>
            <input
              id="form-item-name"
              type="text"
              aria-required="true"
              aria-invalid={errors.name ? 'true' : 'false'}
              aria-describedby={errors.name ? 'form-name-error' : undefined}
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value })
                if (errors.name) setErrors({ ...errors, name: '' })
              }}
              placeholder="e.g. Fe-550D TMT Steel Rebars or Site Waterproofing"
            />
            {errors.name && (
              <span id="form-name-error" className="error-text" role="alert">
                {errors.name}
              </span>
            )}
          </div>

          {/* Category & HSN/SAC */}
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="form-item-category">Category</label>
              <input
                id="form-item-category"
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Cement, Steel, Civil Works, Electronics"
              />
            </div>

            <div className="form-field">
              <label htmlFor="form-item-hsn">
                {form.type === 'Product' ? 'HSN Code (Goods)' : 'SAC Code (Services)'}
              </label>
              <input
                id="form-item-hsn"
                type="text"
                value={form.hsnSac}
                onChange={(e) => setForm({ ...form, hsnSac: e.target.value })}
                placeholder={form.type === 'Product' ? 'e.g. 2523, 7214, 8471' : 'e.g. 9954, 9983'}
              />
            </div>
          </div>

          {/* Price & GST Rate */}
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="form-item-price">
                Selling Price (₹) <span className="required-star">*</span>
              </label>
              <input
                id="form-item-price"
                type="number"
                min="0"
                step="0.01"
                aria-required="true"
                aria-invalid={errors.price ? 'true' : 'false'}
                aria-describedby={errors.price ? 'form-price-error' : undefined}
                value={form.price}
                onChange={(e) => {
                  setForm({ ...form, price: e.target.value })
                  if (errors.price) setErrors({ ...errors, price: '' })
                }}
                placeholder="0.00"
              />
              {errors.price && (
                <span id="form-price-error" className="error-text" role="alert">
                  {errors.price}
                </span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="form-item-gst">
                Applicable GST Rate (%) <span className="required-star">*</span>
              </label>
              <select
                id="form-item-gst"
                aria-required="true"
                aria-invalid={errors.gst ? 'true' : 'false'}
                value={form.gst}
                onChange={(e) => setForm({ ...form, gst: e.target.value })}
              >
                {GST_RATES.map((rate) => (
                  <option key={rate} value={rate}>
                    {rate}% GST {rate === 18 ? '(Standard)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock Quantity (Physical vs Service) */}
          <div className="form-row">
            {form.type === 'Product' ? (
              <div className="form-field">
                <label htmlFor="form-item-stock">
                  Available Stock (Units) <span className="required-star">*</span>
                </label>
                <input
                  id="form-item-stock"
                  type="number"
                  min="0"
                  aria-required="true"
                  aria-invalid={errors.stock ? 'true' : 'false'}
                  aria-describedby={errors.stock ? 'form-stock-error' : undefined}
                  value={form.stock}
                  onChange={(e) => {
                    setForm({ ...form, stock: e.target.value })
                    if (errors.stock) setErrors({ ...errors, stock: '' })
                  }}
                  placeholder="e.g. 50"
                />
                {errors.stock && (
                  <span id="form-stock-error" className="error-text" role="alert">
                    {errors.stock}
                  </span>
                )}
              </div>
            ) : (
              <div className="form-field">
                <label htmlFor="form-item-stock-na">Available Stock</label>
                <input
                  id="form-item-stock-na"
                  type="text"
                  value="Unlimited (Not applicable for services)"
                  disabled
                  className="input-disabled"
                />
              </div>
            )}

            <div className="form-field">
              <label htmlFor="form-item-status">Catalog Status</label>
              <select
                id="form-item-status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Active">Active (Available for billing)</option>
                <option value="Inactive">Inactive (Archived)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="form-field">
            <label htmlFor="form-item-desc">Product / Service Description</label>
            <textarea
              id="form-item-desc"
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Technical specs, brand, unit dimensions, or scope of service details..."
            />
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary">
              {editingItem ? 'Save Changes' : 'Add to Catalog'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductFormModal
