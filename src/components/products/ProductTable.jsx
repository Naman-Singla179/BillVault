import { Edit2, Trash2, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react'

function formatINR(val) {
  const num = Number(val) || 0
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function ProductTable({ items = [], onEdit, onDelete }) {
  return (
    <div className="product-table-wrapper card">
      <table className="product-table" aria-label="Products and services catalog table">
        <thead>
          <tr>
            <th scope="col" className="col-sku">SKU / ID</th>
            <th scope="col" className="col-name">Name & Category</th>
            <th scope="col" className="col-type">Type</th>
            <th scope="col" className="col-hsn">HSN / SAC</th>
            <th scope="col" className="col-price">Selling Price</th>
            <th scope="col" className="col-gst">GST Rate</th>
            <th scope="col" className="col-stock">Stock Level</th>
            <th scope="col" className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isProduct = item.type === 'Product'
            const stockNum = Number(item.stock)
            const isOutOfStock = isProduct && (isNaN(stockNum) || stockNum === 0)
            const isLowStock = isProduct && !isOutOfStock && stockNum <= 10

            return (
              <tr key={item.id} className="product-table-row">
                {/* SKU / ID */}
                <td data-label="SKU / ID" className="cell-sku">
                  <span className="sku-badge">{item.sku || item.id}</span>
                </td>

                {/* Name & Category */}
                <td data-label="Item" className="cell-name">
                  <div className="product-title-wrap">
                    <span className="product-cell-name">{item.name}</span>
                    <span className="product-cell-cat">{item.category || 'General'}</span>
                  </div>
                  {item.description && (
                    <p className="product-cell-desc">{item.description}</p>
                  )}
                </td>

                {/* Type */}
                <td data-label="Type" className="cell-type">
                  <span className={`product-type-pill ${isProduct ? 'pill-product' : 'pill-service'}`}>
                    {item.type || 'Product'}
                  </span>
                </td>

                {/* HSN / SAC */}
                <td data-label="HSN/SAC" className="cell-hsn">
                  {item.hsnSac ? (
                    <span className="hsn-code">{item.hsnSac}</span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>

                {/* Price */}
                <td data-label="Price" className="cell-price">
                  <span className="price-text">{formatINR(item.price)}</span>
                </td>

                {/* GST Rate */}
                <td data-label="GST" className="cell-gst">
                  <span className="gst-badge">{item.gst ?? 18}% GST</span>
                </td>

                {/* Stock Level */}
                <td data-label="Stock" className="cell-stock">
                  {isProduct ? (
                    isOutOfStock ? (
                      <span className="stock-status status-out" title="0 units remaining in inventory">
                        <AlertOctagon size={14} aria-hidden="true" />
                        <span>Out of Stock</span>
                      </span>
                    ) : isLowStock ? (
                      <span className="stock-status status-low" title={`${stockNum} units remaining`}>
                        <AlertTriangle size={14} aria-hidden="true" />
                        <span>Low: {stockNum} left</span>
                      </span>
                    ) : (
                      <span className="stock-status status-ok" title={`${stockNum} units in stock`}>
                        <CheckCircle2 size={14} aria-hidden="true" />
                        <span>{stockNum} units</span>
                      </span>
                    )
                  ) : (
                    <span className="stock-status status-service" title="Services do not have inventory limits">
                      <span>Unlimited (Service)</span>
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td data-label="Actions" className="cell-actions">
                  <div className="product-row-actions">
                    <button
                      type="button"
                      className="btn-action-icon btn-action-edit"
                      onClick={() => onEdit(item)}
                      aria-label={`Edit ${item.name}`}
                      title="Edit product details"
                    >
                      <Edit2 size={15} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="btn-action-icon btn-action-delete"
                      onClick={() => onDelete(item)}
                      aria-label={`Delete ${item.name}`}
                      title="Delete product from catalog"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ProductTable

