import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectProducts,
  selectProductFilters,
  addProduct,
  updateProduct,
  deleteProduct,
  setSearch,
  setCategoryFilter,
  setTypeFilter,
  setSortBy,
  setCurrentPage,
} from '../store/slices/productSlice'
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react'
import Modal from '../components/common/Modal'
import { useToast } from '../context/ToastContext'
import './ProductsPage.css'

const GST_RATES = [0, 5, 12, 18, 28]
const ITEMS_PER_PAGE = 6

const EMPTY_FORM = {
  name: '',
  type: 'Product',
  hsnSac: '',
  price: '',
  gst: '18',
  category: 'General',
  stock: '50',
  description: '',
  status: 'Active',
}

function formatINR(val) {
  const num = Number(val) || 0
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function ProductsPage() {
  const toast = useToast()
  const dispatch = useDispatch()
  const products = useSelector(selectProducts)
  const { search, categoryFilter, typeFilter, sortBy, currentPage } = useSelector(selectProductFilters)

  // Modal form state
  const [modalOpen, setModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  // Extract unique categories
  const categories = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))]

  // Open modal for Adding
  function handleOpenAdd() {
    setEditingItem(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setModalOpen(true)
  }

  // Open modal for Editing
  function handleOpenEdit(item) {
    setEditingItem(item)
    setForm({
      name: item.name || '',
      type: item.type || 'Product',
      hsnSac: item.hsnSac || '',
      price: String(item.price ?? ''),
      gst: String(item.gst ?? '18'),
      category: item.category || 'General',
      stock: item.stock !== undefined && item.stock !== null ? String(item.stock) : '',
      description: item.description || '',
      status: item.status || 'Active',
    })
    setErrors({})
    setModalOpen(true)
  }

  function handleCloseModal() {
    setModalOpen(false)
    setEditingItem(null)
    setForm(EMPTY_FORM)
    setErrors({})
  }

  function validateForm() {
    const errs = {}
    if (!form.name.trim()) {
      errs.name = 'Product or service name is required'
    }

    const priceNum = Number(form.price)
    if (form.price === '' || isNaN(priceNum) || priceNum < 0) {
      errs.price = 'Selling price must be a valid non-negative number'
    }

    const gstNum = Number(form.gst)
    if (form.gst === '' || isNaN(gstNum) || gstNum < 0 || gstNum > 100) {
      errs.gst = 'GST rate must be between 0 and 100%'
    }

    if (form.type === 'Product' && form.stock !== '') {
      const stockNum = Number(form.stock)
      if (isNaN(stockNum) || stockNum < 0) {
        errs.stock = 'Stock must be a non-negative number'
      }
    }

    return errs
  }

  function handleSaveForm(e) {
    e.preventDefault()
    const errs = validateForm()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    const payload = {
      name: form.name.trim(),
      type: form.type,
      hsnSac: form.hsnSac.trim(),
      price: Number(form.price),
      gst: Number(form.gst),
      category: form.category.trim() || 'General',
      stock: form.type === 'Product' ? (form.stock === '' ? 0 : Number(form.stock)) : null,
      description: form.description.trim(),
      status: form.status,
    }

    if (editingItem) {
      dispatch(updateProduct({ id: editingItem.id, data: payload }))
      toast.success(`"${payload.name}" updated successfully!`)
    } else {
      dispatch(addProduct(payload))
      toast.success(`"${payload.name}" added to catalog!`)
    }

    handleCloseModal()
  }

  function handleConfirmDelete() {
    if (!itemToDelete) return
    const name = itemToDelete.name
    dispatch(deleteProduct(itemToDelete.id))
    toast.success(`"${name}" deleted from catalog!`)
    // If last item on page deleted, clamp pagination
    const remainingCount = filteredProducts.length - 1
    const newTotalPages = Math.max(1, Math.ceil(remainingCount / ITEMS_PER_PAGE))
    if (currentPage > newTotalPages) {
      dispatch(setCurrentPage(newTotalPages))
    }
    setItemToDelete(null)
  }

  // Filtering
  const filteredProducts = products.filter((p) => {
    // Search query matches name, description, or HSN/SAC
    const q = search.trim().toLowerCase()
    if (q) {
      const matchName = (p.name || '').toLowerCase().includes(q)
      const matchDesc = (p.description || '').toLowerCase().includes(q)
      const matchCode = (p.hsnSac || '').toLowerCase().includes(q)
      if (!matchName && !matchDesc && !matchCode) return false
    }

    // Category filter
    if (categoryFilter !== 'All' && p.category !== categoryFilter) {
      return false
    }

    // Type filter
    if (typeFilter !== 'All' && p.type !== typeFilter) {
      return false
    }

    return true
  })

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name)
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name)
    if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0)
    if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0)
    return 0
  })

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE))
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE
  const paginatedItems = sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  function handleSearchChange(e) {
    dispatch(setSearch(e.target.value))
  }

  function handleCategoryChange(e) {
    dispatch(setCategoryFilter(e.target.value))
  }

  function handleTypeChange(e) {
    dispatch(setTypeFilter(e.target.value))
  }

  return (
    <div className="page products-page">
      {/* Header */}
      <div className="page-header products-header">
        <div>
          <h1>Products &amp; Services</h1>
          <p>Manage your product and service catalog.</p>
        </div>
        <button type="button" className="btn btn-primary btn-add-product" onClick={handleOpenAdd}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card products-filter-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search products..."
            aria-label="Search products"
          />
        </div>

        <div className="filter-controls">
          <select value={categoryFilter} onChange={handleCategoryChange} aria-label="Filter by category">
            <option value="All">All Categories</option>
            {categories
              .filter((c) => c !== 'All')
              .map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
          </select>

          <select value={typeFilter} onChange={handleTypeChange} aria-label="Filter by item type">
            <option value="All">Product/Service</option>
            <option value="Product">Products only</option>
            <option value="Service">Services only</option>
          </select>

          <select value={sortBy} onChange={(e) => dispatch(setSortBy(e.target.value))} aria-label="Sort products">
            <option value="name-asc">Sort by: Name A-Z</option>
            <option value="name-desc">Sort by: Name Z-A</option>
            <option value="price-asc">Sort by: Price: Low to High</option>
            <option value="price-desc">Sort by: Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Catalog Display */}
      {sortedProducts.length === 0 ? (
        <div className="card empty-state products-empty-state">
          <h3>No items found</h3>
          <p>
            {products.length === 0
              ? 'No products or services have been added yet. Click "+ Add Product" to get started.'
              : 'No catalog items match your search or filter criteria.'}
          </p>
          {products.length === 0 && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ marginTop: '16px' }}
              onClick={handleOpenAdd}
            >
              <Plus size={16} /> Add First Product
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="products-grid">
            {paginatedItems.map((item) => {
              const isProduct = item.type === 'Product'
              const stockNum = Number(item.stock) || 0

              return (
                <div key={item.id} className="card product-card">
                  <div className="card-top-row">
                    <span className={`type-badge ${isProduct ? 'badge-product' : 'badge-service'}`}>
                      {item.type}
                    </span>
                    {item.hsnSac && (
                      <span className="code-pill">
                        {isProduct ? 'HSN' : 'SAC'}: {item.hsnSac}
                      </span>
                    )}
                  </div>

                  <h3 className="product-title" title={item.name}>
                    {item.name}
                  </h3>
                  <p className="product-desc">{item.description || '—'}</p>

                  <div className="product-price">{formatINR(item.price)}</div>

                  <div className="product-meta-row">
                    <span className="meta-text">Tax: {item.gst}% GST</span>
                    {isProduct ? (
                      <span className="meta-stock">
                        Stock:{' '}
                        {stockNum === 0 ? (
                          <span className="stock-tag tag-out">0 units Out of Stock</span>
                        ) : stockNum <= 5 ? (
                          <span className="stock-tag tag-low">{stockNum} units Low Stock</span>
                        ) : (
                          <span className="stock-tag tag-ok">
                            <span className="dot-green" /> {stockNum} units
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="meta-stock">Stock: —</span>
                    )}
                  </div>

                  <div className="product-card-actions">
                    <button
                      type="button"
                      className="card-action-btn btn-edit"
                      onClick={() => handleOpenEdit(item)}
                      aria-label={`Edit ${item.name}`}
                      title="Edit"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      className="card-action-btn btn-delete"
                      onClick={() => setItemToDelete(item)}
                      aria-label={`Delete ${item.name}`}
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination Controls */}
          <div className="card products-pagination-wrap">
            <div className="pagination-info">
              Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, sortedProducts.length)} of{' '}
              {sortedProducts.length} results
            </div>

            <div className="pagination-pills">
              <button
                type="button"
                className="pagination-btn"
                onClick={() => dispatch(setCurrentPage(validCurrentPage - 1))}
                disabled={validCurrentPage <= 1}
                aria-label="Previous page"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  className={`pagination-pill ${validCurrentPage === pageNum ? 'active' : ''}`}
                  onClick={() => dispatch(setCurrentPage(pageNum))}
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={validCurrentPage === pageNum ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                className="pagination-btn"
                onClick={() => dispatch(setCurrentPage(validCurrentPage + 1))}
                disabled={validCurrentPage >= totalPages}
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="card modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Item' : 'Add Product or Service'}</h2>
              <button
                type="button"
                className="btn-icon"
                onClick={handleCloseModal}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="product-form">
              <div className="form-field">
                <label htmlFor="item-name">
                  Product / Service Name <span className="required-star">*</span>
                </label>
                <input
                  id="item-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Wireless Keyboard or Logo Design"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="item-type">Item Type</label>
                  <select
                    id="item-type"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="Product">Product</option>
                    <option value="Service">Service</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="item-hsn">
                    {form.type === 'Product' ? 'HSN Code' : 'SAC Code'}
                  </label>
                  <input
                    id="item-hsn"
                    type="text"
                    value={form.hsnSac}
                    onChange={(e) => setForm({ ...form, hsnSac: e.target.value })}
                    placeholder={form.type === 'Product' ? 'e.g. 8471' : 'e.g. 9983'}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="item-price">
                    Selling Price (₹) <span className="required-star">*</span>
                  </label>
                  <input
                    id="item-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0.00"
                  />
                  {errors.price && <span className="error-text">{errors.price}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="item-gst">
                    GST Rate (%) <span className="required-star">*</span>
                  </label>
                  <select
                    id="item-gst"
                    value={form.gst}
                    onChange={(e) => setForm({ ...form, gst: e.target.value })}
                  >
                    {GST_RATES.map((rate) => (
                      <option key={rate} value={rate}>
                        {rate}% GST
                      </option>
                    ))}
                  </select>
                  {errors.gst && <span className="error-text">{errors.gst}</span>}
                </div>
              </div>

              <div className="form-row">
                {form.type === 'Product' ? (
                  <div className="form-field">
                    <label htmlFor="item-stock">Available Stock (Units)</label>
                    <input
                      id="item-stock"
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      placeholder="e.g. 50"
                    />
                    {errors.stock && <span className="error-text">{errors.stock}</span>}
                  </div>
                ) : (
                  <div className="form-field">
                    <label>Stock</label>
                    <input type="text" value="Not applicable for services" disabled />
                  </div>
                )}

                <div className="form-field">
                  <label htmlFor="item-category">Category</label>
                  <input
                    id="item-category"
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. Hardware, Printing, Consulting"
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="item-desc">Description (Optional)</label>
                <textarea
                  id="item-desc"
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional details about this product or service"
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Save Changes' : 'Add Item to Catalog'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        title="Delete Item"
        onConfirm={handleConfirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
        danger={true}
      >
        <p style={{ margin: 0, lineHeight: 1.6, color: 'rgb(209, 213, 219)', fontSize: '14px' }}>
          Are you sure you want to delete <strong style={{ color: 'rgb(233, 234, 238)' }}>{itemToDelete?.name}</strong> from catalog?
        </p>
        <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'rgb(154, 161, 175)' }}>
          This will permanently remove this item from your product catalog.
        </p>
      </Modal>
    </div>
  )
}

export default ProductsPage
