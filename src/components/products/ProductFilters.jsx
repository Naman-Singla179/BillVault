import { Search, X, LayoutGrid, List, RotateCcw } from 'lucide-react'

const GST_RATES = ['0', '5', '12', '18', '28']

function ProductFilters({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  categories = [],
  typeFilter,
  onTypeChange,
  stockFilter,
  onStockChange,
  gstFilter,
  onGstChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onResetFilters,
}) {
  const hasActiveFilters =
    search.trim() !== '' ||
    categoryFilter !== 'All' ||
    typeFilter !== 'All' ||
    stockFilter !== 'All' ||
    gstFilter !== 'All' ||
    sortBy !== 'name-asc'

  return (
    <div className="product-filters-container card" role="search" aria-label="Product catalog filters">
      {/* Top Filter Row: Search & View Toggle */}
      <div className="product-filters-top">
        <div className="product-search-box">
          <Search size={16} className="product-search-icon" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, SKU/ID, category, or HSN/SAC code..."
            aria-label="Search products"
          />
          {search && (
            <button
              type="button"
              className="product-search-clear"
              onClick={() => onSearchChange('')}
              aria-label="Clear search query"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="product-view-toggle" role="group" aria-label="Catalog view style">
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => onViewModeChange('table')}
            aria-label="Table view"
            title="Table view"
          >
            <List size={16} aria-hidden="true" />
            <span className="view-toggle-label">Table</span>
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            aria-label="Card grid view"
            title="Card grid view"
          >
            <LayoutGrid size={16} aria-hidden="true" />
            <span className="view-toggle-label">Cards</span>
          </button>
        </div>
      </div>

      {/* Bottom Filter Row: Controls */}
      <div className="product-filters-bottom">
        <div className="filter-select-group">
          <label htmlFor="filter-category" className="filter-label">Category</label>
          <select
            id="filter-category"
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="All">All Categories</option>
            {categories
              .filter((c) => c !== 'All')
              .map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
          </select>
        </div>

        <div className="filter-select-group">
          <label htmlFor="filter-type" className="filter-label">Type</label>
          <select
            id="filter-type"
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value)}
            aria-label="Filter by item type"
          >
            <option value="All">All Types</option>
            <option value="Product">Products (Goods)</option>
            <option value="Service">Services</option>
          </select>
        </div>

        <div className="filter-select-group">
          <label htmlFor="filter-stock" className="filter-label">Stock Status</label>
          <select
            id="filter-stock"
            value={stockFilter}
            onChange={(e) => onStockChange(e.target.value)}
            aria-label="Filter by stock availability"
          >
            <option value="All">All Stock Levels</option>
            <option value="in">In Stock (&gt; 10)</option>
            <option value="low">Low Stock (1–10)</option>
            <option value="out">Out of Stock (0)</option>
          </select>
        </div>

        <div className="filter-select-group">
          <label htmlFor="filter-gst" className="filter-label">GST Rate</label>
          <select
            id="filter-gst"
            value={gstFilter}
            onChange={(e) => onGstChange(e.target.value)}
            aria-label="Filter by GST tax rate"
          >
            <option value="All">All GST Rates</option>
            {GST_RATES.map((rate) => (
              <option key={rate} value={rate}>
                {rate}% GST
              </option>
            ))}
          </select>
        </div>

        <div className="filter-select-group filter-sort-group">
          <label htmlFor="filter-sort" className="filter-label">Sort By</label>
          <select
            id="filter-sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort products"
          >
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stock-asc">Stock: Low to High</option>
            <option value="stock-desc">Stock: High to Low</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-secondary btn-reset-filters"
            onClick={onResetFilters}
            title="Reset all filters"
            aria-label="Reset all search and filter options"
          >
            <RotateCcw size={14} aria-hidden="true" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default ProductFilters

