import { Edit2, Trash2, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react'

function formatINR(val) {
  const num = Number(val) || 0
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function ProductCards({ items = [], onEdit, onDelete }) {
  return (
    <div className="product-cards-grid" aria-label="Product catalog card grid">
      {items.map((item) => {
        const isProduct = item.type === 'Product'
        const stockNum = Number(item.stock)
        const isOutOfStock = isProduct && (isNaN(stockNum) || stockNum === 0)
        const isLowStock = isProduct && !isOutOfStock && stockNum <= 10

        return (
          <div key={item.id} className="card product-item-card">
            <div className="product-card-header">
              <div className="product-card-badges">
                <span className={`product-type-pill ${isProduct ? 'pill-product' : 'pill-service'}`}>
                  {item.type || 'Product'}
                </span>
                <span className="sku-badge">{item.sku || item.id}</span>
              </div>
              {item.hsnSac && (
                <span className="hsn-pill">
                  {isProduct ? 'HSN' : 'SAC'}: {item.hsnSac}
                </span>
              )}
            </div>

            <div className="product-card-body">
              <h3 className="product-card-title" title={item.name}>
                {item.name}
              </h3>
              <span className="product-card-category">{item.category || 'General'}</span>

              <p className="product-card-desc">
                {item.description || 'No detailed description provided.'}
              </p>

              <div className="product-card-pricing">
                <div className="product-card-price">{formatINR(item.price)}</div>
                <div className="product-card-gst">Tax: {item.gst ?? 18}% GST</div>
              </div>

              <div className="product-card-stock-wrap">
                {isProduct ? (
                  isOutOfStock ? (
                    <span className="stock-status status-out">
                      <AlertOctagon size={14} aria-hidden="true" />
                      <span>0 units (Out of Stock)</span>
                    </span>
                  ) : isLowStock ? (
                    <span className="stock-status status-low">
                      <AlertTriangle size={14} aria-hidden="true" />
                      <span>Low Stock: {stockNum} units remaining</span>
                    </span>
                  ) : (
                    <span className="stock-status status-ok">
                      <CheckCircle2 size={14} aria-hidden="true" />
                      <span>{stockNum} units in stock</span>
                    </span>
                  )
                ) : (
                  <span className="stock-status status-service">
                    <span>Unlimited capacity (Service)</span>
                  </span>
                )}
              </div>
            </div>

            <div className="product-card-footer">
              <button
                type="button"
                className="btn-card-action btn-card-edit"
                onClick={() => onEdit(item)}
                aria-label={`Edit ${item.name}`}
              >
                <Edit2 size={14} aria-hidden="true" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                className="btn-card-action btn-card-delete"
                onClick={() => onDelete(item)}
                aria-label={`Delete ${item.name}`}
              >
                <Trash2 size={14} aria-hidden="true" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ProductCards

