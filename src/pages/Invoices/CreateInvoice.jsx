import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { getInvoices, saveInvoices, getProducts } from '../../services/storage';

export default function CreateInvoice({ customers = [], onAddCustomer }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const toast = useToast();

  const [selectedRowId, setSelectedRowId] = useState(null);
  const [catalogProducts] = useState(() => getProducts());
  const [errors, setErrors] = useState({});

  const [invoice, setInvoice] = useState(() => {
    const existing = getInvoices();
    let maxNum = 0;
    existing.forEach(inv => {
      const match = String(inv.id).match(/^INV-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const nextId = `INV-${String(maxNum + 1).padStart(4, '0')}`;
    
    return {
      id: nextId,
      customerId: '',
      customerPhone: '',
      customerEmail: '',
      customerAddress: '',
      date: '',
      dueDate: '',
      items: [{ id: Date.now(), description: '', quantity: 1, price: 0 }],
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      status: 'PENDING'
    };
  });

  useEffect(() => {
    const subtotal = invoice.items.reduce((sum, item) => {
      return sum + (Number(item.quantity || 0) * Number(item.price || 0));
    }, 0);

    const taxAmount = subtotal * (Number(invoice.tax || 0) / 100);
    const total = Math.max(0, subtotal + taxAmount - Number(invoice.discount || 0));

    setInvoice(prev => ({ ...prev, subtotal, total }));
  }, [invoice.items, invoice.tax, invoice.discount]);

  useEffect(() => {
    if (id) {
      const existing = getInvoices().find(inv => String(inv.id) === String(id));
      if (existing) {
        setInvoice(existing);
      }
    }
  }, [id]);

  const handleCustomerChange = (e) => {
    const name = e.target.value;
    const found = customers.find(c => c.name === name || String(c.id) === String(name));
    
    if (found) {
      setInvoice({
        ...invoice,
        customerId: name,
        customerPhone: found.phone || '',
        customerEmail: found.email || '',
        customerAddress: found.address || ''
      });
    } else {
      setInvoice({ ...invoice, customerId: name });
    }

    if (errors.customerId) {
      setErrors({ ...errors, customerId: '' });
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoice.items];
    newItems[index][field] = value;
    setInvoice({ ...invoice, items: newItems });
  };

  const handleCatalogSelect = (index, productId) => {
    const product = catalogProducts.find(p => String(p.id) === String(productId));
    if (!product) return;

    const newItems = [...invoice.items];
    newItems[index] = {
      ...newItems[index],
      description: product.name,
      price: product.price
    };

    setInvoice({
      ...invoice,
      items: newItems,
      tax: product.gst ? Number(product.gst) : invoice.tax
    });
  };

  const addItemRow = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { id: Date.now(), description: '', quantity: 1, price: 0 }]
    });
  };

  const removeSelectedItem = () => {
    if (invoice.items.length <= 1) return;
    
    let newItems;
    if (selectedRowId) {
      newItems = invoice.items.filter(item => item.id !== selectedRowId);
    } else {
      newItems = invoice.items.slice(0, -1);
    }
    
    setInvoice({ ...invoice, items: newItems.length ? newItems : invoice.items });
    setSelectedRowId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!invoice.customerId.trim()) {
      newErrors.customerId = 'Customer name is required';
    }
    if (!invoice.date) {
      newErrors.date = 'Invoice date is required';
    }
    if (!invoice.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fill in all required fields');
      return;
    }

    const allInvoices = getInvoices();
    let updated;

    if (isEditMode) {
      updated = allInvoices.map(inv => String(inv.id) === String(id) ? invoice : inv);
    } else {
      updated = [...allInvoices, invoice];
    }

    saveInvoices(updated);

    if (onAddCustomer && invoice.customerId) {
      const exists = customers.some(
        c => String(c.id) === String(invoice.customerId) || c.name.toLowerCase() === invoice.customerId.toLowerCase()
      );
      if (!exists) {
        onAddCustomer({ 
          name: invoice.customerId, 
          email: invoice.customerEmail, 
          phone: invoice.customerPhone, 
          address: invoice.customerAddress 
        });
      }
    }

    toast.success(isEditMode ? 'Invoice updated successfully!' : 'Invoice created successfully!');
    navigate('/invoices');
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{isEditMode ? 'Edit Invoice' : 'Create Invoice'}</h1>
          <p>{isEditMode ? `Update details for invoice ${invoice.id}` : 'Fill out the details below to generate a new invoice.'}</p>
        </div>
        <button 
          type="button" 
          className="btn btn-secondary" 
          onClick={() => navigate('/invoices')}
        >
          ← Back to Invoices
        </button>
      </div>

      <form className="card" onSubmit={handleSubmit} style={{ padding: '24px' }}>
        
        <div className="form-row" style={{ marginBottom: '16px' }}>
          <div className="form-field">
            <label>Customer Name <span className="required">*</span></label>
            <input
              list="customer-list"
              value={invoice.customerId}
              onChange={handleCustomerChange}
              placeholder="Enter or select customer"
            />
            <datalist id="customer-list">
              {customers.map(c => <option key={c.id} value={c.name} />)}
            </datalist>
            {errors.customerId && <span className="field-error">{errors.customerId}</span>}
          </div>
          <div className="form-field">
            <label>Phone Number</label>
            <input
              type="tel"
              value={invoice.customerPhone}
              onChange={(e) => setInvoice({ ...invoice, customerPhone: e.target.value })}
              placeholder="Phone Number"
            />
          </div>
        </div>

        <div className="form-row" style={{ marginBottom: '16px' }}>
          <div className="form-field">
            <label>Email</label>
            <input
              type="email"
              value={invoice.customerEmail}
              onChange={(e) => setInvoice({ ...invoice, customerEmail: e.target.value })}
              placeholder="Email Address"
            />
          </div>
          <div className="form-field">
            <label>Address</label>
            <input
              type="text"
              value={invoice.customerAddress}
              onChange={(e) => setInvoice({ ...invoice, customerAddress: e.target.value })}
              placeholder="Physical Address"
            />
          </div>
        </div>

        <div className="form-row" style={{ marginBottom: '24px' }}>
          <div className="form-field">
            <label>Invoice Date <span className="required">*</span></label>
            <input
              type="date"
              value={invoice.date}
              onChange={(e) => {
                setInvoice({ ...invoice, date: e.target.value });
                if (errors.date) setErrors({ ...errors, date: '' });
              }}
            />
            {errors.date && <span className="field-error">{errors.date}</span>}
          </div>
          <div className="form-field">
            <label>Due Date <span className="required">*</span></label>
            <input
              type="date"
              value={invoice.dueDate}
              onChange={(e) => {
                setInvoice({ ...invoice, dueDate: e.target.value });
                if (errors.dueDate) setErrors({ ...errors, dueDate: '' });
              }}
            />
            {errors.dueDate && <span className="field-error">{errors.dueDate}</span>}
          </div>
        </div>

        <h3 style={{ marginBottom: '16px', borderBottom: '1px solid rgb(38, 43, 54)', paddingBottom: '8px' }}>
          Item Description
        </h3>

        {invoice.items.map((item, index) => (
          <div 
            key={item.id} 
            className="form-row" 
            onClick={() => setSelectedRowId(item.id)}
            style={{ 
              gridTemplateColumns: catalogProducts.length > 0 ? '1.5fr 2fr 1fr 1fr' : '2fr 1fr 1fr', 
              marginBottom: '12px',
              borderRadius: '4px',
              padding: '4px',
              cursor: 'pointer'
            }}
          >
            {catalogProducts.length > 0 && (
              <div className="form-field" style={{ marginBottom: 0 }}>
                {index === 0 && <label>From Catalog</label>}
                <select
                  defaultValue=""
                  onChange={(e) => {
                    handleCatalogSelect(index, e.target.value);
                    e.target.value = '';
                  }}
                  aria-label="Select item from catalog"
                >
                  <option value="" disabled>-- Select Catalog Item --</option>
                  {catalogProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{p.price})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-field" style={{ marginBottom: 0 }}>
              {index === 0 && <label>Item Description</label>}
              <input
                type="text" 
                placeholder="Item Description" 
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
              />
            </div>
            <div className="form-field" style={{ marginBottom: 0 }}>
              {index === 0 && <label>Quantity</label>}
              <input
                type="number" 
                min="1" 
                placeholder="Qty" 
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
              />
            </div>
            <div className="form-field" style={{ marginBottom: 0 }}>
              {index === 0 && <label>Price (₹)</label>}
              <input
                type="number" 
                min="0" 
                placeholder="Price" 
                value={item.price}
                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
              />
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', marginTop: '4px' }}>
          <button type="button" className="btn btn-secondary" onClick={addItemRow}>
            + Add Item
          </button>
          {invoice.items.length > 1 && (
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={removeSelectedItem} 
              style={{ borderColor: 'rgb(229, 72, 77)', color: 'rgb(229, 72, 77)' }}
            >
              - Remove Item
            </button>
          )}
        </div>

        <div style={{ background: 'rgb(20, 23, 30)', padding: '16px', borderRadius: '6px', border: '1px solid rgb(51, 57, 71)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              
              <div className="form-field" style={{ marginBottom: 0, width: '120px' }}>
                <label>Subtotal (₹)</label>
                <input type="text" value={invoice.subtotal.toFixed(2)} readOnly />
              </div>

              <span style={{ fontSize: '20px', color: 'rgb(107, 114, 128)', marginTop: '18px', fontWeight: 'bold' }}>+</span>

              <div className="form-field" style={{ marginBottom: 0, width: '120px' }}>
                <label>Tax (%)</label>
                <input 
                  type="number" 
                  min="0" 
                  value={invoice.tax} 
                  onChange={e => setInvoice({ ...invoice, tax: e.target.value })} 
                />
              </div>

              <span style={{ fontSize: '20px', color: 'rgb(107, 114, 128)', marginTop: '18px', fontWeight: 'bold' }}>-</span>

              <div className="form-field" style={{ marginBottom: 0, width: '120px' }}>
                <label>Discount (₹)</label>
                <input 
                  type="number" 
                  min="0" 
                  value={invoice.discount} 
                  onChange={e => setInvoice({ ...invoice, discount: e.target.value })} 
                />
              </div>

              <span style={{ fontSize: '20px', color: 'rgb(107, 114, 128)', marginTop: '18px', fontWeight: 'bold' }}>=</span>

            </div>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'right', minWidth: '150px' }}>
                <h2 style={{ color: 'rgb(63, 182, 127)', margin: 0 }}>Total: ₹{invoice.total.toFixed(2)}</h2>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ padding: '12px 24px', fontSize: '15px' }}
              >
                {isEditMode ? 'Update Invoice' : 'Save Invoice'}
              </button>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
}