import { useState, useMemo } from 'react'
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
  setStockFilter,
  setGstFilter,
  setSortBy,
  setCurrentPage,
  setViewMode,
  resetFilters,
} from '../store/slices/productSlice'
import { Plus } from 'lucide-react'
import Modal from '../components/common/Modal'
import { useToast } from '../context/ToastContext'
import ProductStats from '../components/products/ProductStats'
import ProductFilters from '../components/products/ProductFilters'
import ProductTable from '../components/products/ProductTable'
import ProductCards from '../components/products/ProductCards'
import ProductFormModal from '../components/products/ProductFormModal'
import './ProductsPage.css'

const ITEMS_PER_PAGE = 10

function ProductsPage() {
  const toast = useToast()
  const dispatch = useDispatch()
  const products = useSelector(selectProducts)
  const {
    search,
    categoryFilter,
    typeFilter,
    stockFilter,
    gstFilter,
    sortBy,
    currentPage,
    viewMode,
  } = useSelector(selectProductFilters)

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [itemToDelete, setItemToDelete] = useState(null)

  // Extract unique categories dynamically
  const categories = useMemo(() => {
    return ['All', ...new Set(products.map((p) => p.category).filter(Boolean))]
  }, [products])

  // Open Add modal
  function handleOpenAdd() {
    setEditingItem(null)
    setModalOpen(true)
  }

  // Open Edit modal
  function handleOpenEdit(item) {
    setEditingItem(item)
    setModalOpen(true)
  }

  // Save (Add or Update)
  function handleSaveProduct(payload) {
    if (editingItem) {
      dispatch(updateProduct({ id: editingItem.id, data: payload }))
      toast.success(`"${payload.name}" updated successfully!`)
    } else {
      dispatch(addProduct(payload))
      toast.success(`"${payload.name}" added to catalog!`)
    }
    setModalOpen(false)
    setEditingItem(null)
  }

  // Delete product with confirmation
  function handleConfirmDelete() {
    if (!itemToDelete) return
    const name = itemToDelete.name
    dispatch(deleteProduct(itemToDelete.id))
    toast.success(`"${name}" removed from catalog!`)
    setItemToDelete(null)
  }

  // Filter pipeline
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // 1. Search filter: matches name, sku/id, category, hsn/sac, description
      if (search.trim()) {
        const q = search.toLowerCase().trim()
        const matchName = item.name?.toLowerCase().includes(q)
        const matchSku = String(item.sku || item.id || '').toLowerCase().includes(q)
        const matchCategory = item.category?.toLowerCase().includes(q)
        const matchHsn = item.hsnSac?.toLowerCase().includes(q)
        const matchDesc = item.description?.toLowerCase().includes(q)
        if (!matchName && !matchSku && !matchCategory && !matchHsn && !matchDesc) {
          return false
        }
      }

      // 2. Category filter
      if (categoryFilter !== 'All' && item.category !== categoryFilter) {
        return false
      }

      // 3. Type filter
      if (typeFilter !== 'All' && item.type !== typeFilter) {
        return false
      }

      // 4. Stock level filter
      if (stockFilter !== 'All') {
        const isProduct = item.type === 'Product'
        const s = Number(item.stock)
        if (!isProduct) return false // services don't match physical stock filters
        if (stockFilter === 'out' && s > 0) return false
        if (stockFilter === 'low' && (s === 0 || s > 10)) return false
        if (stockFilter === 'in' && s <= 10) return false
      }

      // 5. GST Rate filter
      if (gstFilter !== 'All') {
        if (String(item.gst) !== String(gstFilter)) {
          return false
        }
      }

      return true
    })
  }, [products, search, categoryFilter, typeFilter, stockFilter, gstFilter])

  // Sort pipeline
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '')
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '')
        case 'price-asc':
          return (Number(a.price) || 0) - (Number(b.price) || 0)
        case 'price-desc':
          return (Number(b.price) || 0) - (Number(a.price) || 0)
        case 'stock-asc': {
          const sA = a.type === 'Product' ? (Number(a.stock) || 0) : 999999
          const sB = b.type === 'Product' ? (Number(b.stock) || 0) : 999999
          return sA - sB
        }
        case 'stock-desc': {
          const sA = a.type === 'Product' ? (Number(a.stock) || 0) : -1
          const sB = b.type === 'Product' ? (Number(b.stock) || 0) : -1
          return sB - sA
        }
        default:
          return 0
      }
    })
  }, [filteredProducts, sortBy])

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE))
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE
  const paginatedItems = sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  return (
    <div className="page products-page">
      {/* Page Header */}
      <div className="page-header products-header">
        <div>
          <h1>Products & Services</h1>
          <p>Manage your product inventory, SKU codes, and service rates for accurate GST billing.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-add-product"
          onClick={handleOpenAdd}
        >
          <Plus size={16} aria-hidden="true" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Summary Metrics Cards */}
      <ProductStats
        products={products}
        onFilterStock={(filterVal) => {
          dispatch(setStockFilter(filterVal))
        }}
      />

      {/* Filter and Search Bar */}
      <ProductFilters
        search={search}
        onSearchChange={(val) => dispatch(setSearch(val))}
        categoryFilter={categoryFilter}
        onCategoryChange={(val) => dispatch(setCategoryFilter(val))}
        categories={categories}
        typeFilter={typeFilter}
        onTypeChange={(val) => dispatch(setTypeFilter(val))}
        stockFilter={stockFilter}
        onStockChange={(val) => dispatch(setStockFilter(val))}
        gstFilter={gstFilter}
        onGstChange={(val) => dispatch(setGstFilter(val))}
        sortBy={sortBy}
        onSortChange={(val) => dispatch(setSortBy(val))}
        viewMode={viewMode}
        onViewModeChange={(mode) => dispatch(setViewMode(mode))}
        onResetFilters={() => dispatch(resetFilters())}
      />

      {/* Main Catalog View */}
      {sortedProducts.length === 0 ? (
        <div className="card empty-state products-empty-state">
          <h3>No matching items found</h3>
          <p>
            {products.length === 0
              ? 'No products or services have been added yet. Click "+ Add Product" to create your first item.'
              : 'No items match your active search and filter filters.'}
          </p>
          {products.length === 0 ? (
            <button
              type="button"
              className="btn btn-primary"
              style={{ marginTop: '16px' }}
              onClick={handleOpenAdd}
            >
              <Plus size={16} aria-hidden="true" />
              <span>Add First Product</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginTop: '16px' }}
              onClick={() => dispatch(resetFilters())}
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'table' ? (
            <ProductTable
              items={paginatedItems}
              onEdit={handleOpenEdit}
              onDelete={(item) => setItemToDelete(item)}
            />
          ) : (
            <ProductCards
              items={paginatedItems}
              onEdit={handleOpenEdit}
              onDelete={(item) => setItemToDelete(item)}
            />
          )}

          {/* Pagination Navigation */}
          {totalPages > 1 && (
            <div className="card products-pagination-wrap" aria-label="Pagination Navigation">
              <div className="pagination-info">
                Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, sortedProducts.length)} of{' '}
                {sortedProducts.length} items
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
          )}
        </>
      )}

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <ProductFormModal
          key={editingItem ? String(editingItem.id) : 'new'}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setEditingItem(null)
          }}
          onSave={handleSaveProduct}
          editingItem={editingItem}
          existingProducts={products}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        title="Delete Catalog Item"
        onConfirm={handleConfirmDelete}
        confirmText="Confirm Delete"
        cancelText="Cancel"
        danger={true}
      >
        <p style={{ margin: 0, lineHeight: 1.6, color: 'rgb(209, 213, 219)', fontSize: '14px' }}>
          Are you sure you want to delete <strong style={{ color: 'rgb(233, 234, 238)' }}>{itemToDelete?.name}</strong>{' '}
          ({itemToDelete?.sku || itemToDelete?.id})?
        </p>
        <div style={{
          marginTop: '12px',
          padding: '12px 14px',
          background: 'rgba(217, 164, 65, 0.08)',
          border: '1px solid rgba(217, 164, 65, 0.25)',
          borderRadius: '6px',
          fontSize: '13px',
          color: 'rgb(217, 164, 65)'
        }}>
          <strong>Note:</strong> Deleting this item removes it from future catalog selection. Any existing invoices that already billed this item will retain their historical line items, pricing, and descriptions.
        </div>
      </Modal>
    </div>
  )
}

export default ProductsPage
