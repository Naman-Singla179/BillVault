import { Package, AlertTriangle, AlertOctagon, TrendingUp } from 'lucide-react'

function formatCurrency(val) {
  const num = Number(val) || 0
  return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

function ProductStats({ products = [], onFilterStock }) {
  const totalItems = products.length
  const physicalProducts = products.filter((p) => p.type === 'Product')
  const servicesCount = products.filter((p) => p.type === 'Service').length

  const lowStockCount = physicalProducts.filter((p) => {
    const s = Number(p.stock)
    return !isNaN(s) && s > 0 && s <= 10
  }).length

  const outOfStockCount = physicalProducts.filter((p) => {
    const s = Number(p.stock)
    return isNaN(s) || s === 0
  }).length

  const totalInventoryValue = physicalProducts.reduce((sum, p) => {
    const qty = Number(p.stock) || 0
    const price = Number(p.price) || 0
    return sum + (qty * price)
  }, 0)

  return (
    <div className="product-stats-grid" aria-label="Inventory metrics overview">
      <div
        className="product-stat-card stat-total"
        onClick={() => onFilterStock && onFilterStock('All')}
        role="button"
        tabIndex={0}
        aria-label={`Total products: ${totalItems}`}
        onKeyDown={(e) => e.key === 'Enter' && onFilterStock && onFilterStock('All')}
      >
        <div className="stat-icon-wrap icon-total" aria-hidden="true">
          <Package size={20} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Total Catalog</span>
          <div className="stat-value">{totalItems}</div>
          <span className="stat-sub">
            {physicalProducts.length} Products · {servicesCount} Services
          </span>
        </div>
      </div>

      <div
        className="product-stat-card stat-low-stock"
        onClick={() => onFilterStock && onFilterStock('low')}
        role="button"
        tabIndex={0}
        aria-label={`Low stock items: ${lowStockCount}`}
        onKeyDown={(e) => e.key === 'Enter' && onFilterStock && onFilterStock('low')}
      >
        <div className="stat-icon-wrap icon-low" aria-hidden="true">
          <AlertTriangle size={20} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Low Stock (≤ 10)</span>
          <div className="stat-value text-warning">{lowStockCount}</div>
          <span className="stat-sub">Reorder recommended</span>
        </div>
      </div>

      <div
        className="product-stat-card stat-out-stock"
        onClick={() => onFilterStock && onFilterStock('out')}
        role="button"
        tabIndex={0}
        aria-label={`Out of stock items: ${outOfStockCount}`}
        onKeyDown={(e) => e.key === 'Enter' && onFilterStock && onFilterStock('out')}
      >
        <div className="stat-icon-wrap icon-out" aria-hidden="true">
          <AlertOctagon size={20} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Out of Stock</span>
          <div className="stat-value text-danger">{outOfStockCount}</div>
          <span className="stat-sub">Immediate restocking needed</span>
        </div>
      </div>

      <div className="product-stat-card stat-valuation" aria-label={`Inventory valuation: ${formatCurrency(totalInventoryValue)}`}>
        <div className="stat-icon-wrap icon-value" aria-hidden="true">
          <TrendingUp size={20} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Inventory Valuation</span>
          <div className="stat-value text-success">{formatCurrency(totalInventoryValue)}</div>
          <span className="stat-sub">Available stock asset value</span>
        </div>
      </div>
    </div>
  )
}

export default ProductStats

