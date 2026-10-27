import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { getInvoices, saveInvoices } from '../../services/storage';
import { useSelector } from 'react-redux';
import { selectProducts } from '../../store/slices/productSlice';

export default function CreateInvoice({ customers = [], onAddCustomer }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const toast = useToast();

  const [selectedRowId, setSelectedRowId] = useState(null);
  const catalogProducts = useSelector(selectProducts);
  const [errors, setErrors] = useState({});
  const [itemErrors, setItemErrors] = useState({});

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
    const today = new Date().toISOString().split('T')[0];
    
    return {
      id: nextId,
      customerId: '',
      customerPhone: '',
      customerEmail: '',
      customerAddress: '',
      date: today,
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
        customerPhone: (found.phone || '').replace(/\D/g, '').slice(0, 10),
        customerEmail: found.email || '',
        customerAddress: found.address || ''
      });
      // Clear auto-populated errors if valid
      setErrors(prev => ({
        ...prev,
        customerId: '',
        customerPhone: '',
        customerEmail: ''
      }));
    } else {
      setInvoice({ ...invoice, customerId: name });
      if (errors.customerId) {
        setErrors(prev => ({ ...prev, customerId: '' }));
      }
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoice.items];
    newItems[index][field] = value;
    setInvoice({ ...invoice, items: newItems });

    const itemId = newItems[index].id;
    if (itemErrors[itemId]?.[field]) {
      setItemErrors(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          [field]: ''
        }
      }));
    }
    if (errors.itemsGeneral) {
      setErrors(prev => ({ ...prev, itemsGeneral: '' }));
    }
  };

  const handleCatalogSelect = (index, productId) => {
    const product = catalogProducts.find(p => String(p.id) === String(productId));
    if (!product) return;

    const newItems = [...invoice.items];
    const itemId = newItems[index].id;
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

    if (itemErrors[itemId]) {
      setItemErrors(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          description: '',
          price: ''
        }
      }));
    }
    if (errors.itemsGeneral) {
      setErrors(prev => ({ ...prev, itemsGeneral: '' }));
    }
  };

  const addItemRow = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { id: Date.now(), description: '', quantity: 1, price: 0 }]
    });
    if (errors.itemsGeneral) {
      setErrors(prev => ({ ...prev, itemsGeneral: '' }));
    }
  };

  const removeSelectedItem = () => {
    if (invoice.items.length <= 1) return;
    
    let newItems;
    let removedId = null;
    if (selectedRowId) {
      removedId = selectedRowId;
      newItems = invoice.items.filter(item => item.id !== selectedRowId);
    } else {
      removedId = invoice.items[invoice.items.length - 1].id;
      newItems = invoice.items.slice(0, -1);
    }
    
    setInvoice({ ...invoice, items: newItems.length ? newItems : invoice.items });
    if (removedId && itemErrors[removedId]) {
      setItemErrors(prev => {
        const copy = { ...prev };
        delete copy[removedId];
        return copy;
      });
    }
    setSelectedRowId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    const newItemErrors = {};

    // 1. Customer Name validation
    if (!invoice.customerId || !invoice.customerId.trim()) {
      newErrors.customerId = 'Customer name is required';
    }

    // 2. Phone Number validation (validates format if provided)
    if (invoice.customerPhone && invoice.customerPhone.trim()) {
      const cleanPhone = invoice.customerPhone.trim().replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        newErrors.customerPhone = 'Phone number must be exactly 10 digits';
      }
    }

    // 3. Email validation (validates format if provided)
    if (invoice.customerEmail && invoice.customerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(invoice.customerEmail.trim())) {
        newErrors.customerEmail = 'Enter a valid email address (e.g. name@example.com)';
      }
    }

    // 4. Invoice Date validation
    if (!invoice.date) {
      newErrors.date = 'Invoice date is required';
    } else {
      const year = Number(invoice.date.split('-')[0]);
      if (isNaN(year) || year < 2000 || year > 2099) {
        newErrors.date = 'Please enter a valid 4-digit year (between 2000 and 2099)';
      }
    }

    // 5. Due Date validation
    if (!invoice.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const year = Number(invoice.dueDate.split('-')[0]);
      if (isNaN(year) || year < 2000 || year > 2099) {
        newErrors.dueDate = 'Please enter a valid 4-digit year (between 2000 and 2099)';
      } else if (invoice.date && invoice.dueDate < invoice.date) {
        newErrors.dueDate = 'Due date cannot be earlier than invoice date';
      }
    }

    // 6. Tax rate validation
    if (invoice.tax !== '' && invoice.tax !== null && invoice.tax !== undefined) {
      const taxNum = Number(invoice.tax);
      if (isNaN(taxNum) || taxNum < 0 || taxNum > 100) {
        newErrors.tax = 'Tax rate must be between 0% and 100%';
      }
    }

    // 7. Discount validation
    if (invoice.discount !== '' && invoice.discount !== null && invoice.discount !== undefined) {
      const discountNum = Number(invoice.discount);
      if (isNaN(discountNum) || discountNum < 0) {
        newErrors.discount = 'Discount cannot be negative';
      }
    }

    // 8. Line items validation (Description, Quantity, Price)
    if (!invoice.items || invoice.items.length === 0) {
      newErrors.itemsGeneral = 'Please add at least one line item';
    } else {
      invoice.items.forEach((item) => {
        const itemErr = {};

        if (!item.description || !String(item.description).trim()) {
          itemErr.description = 'Description is required';
        }

        const qtyNum = Number(item.quantity);
        if (item.quantity === '' || item.quantity === null || item.quantity === undefined || isNaN(qtyNum)) {
          itemErr.quantity = 'Quantity is required';
        } else if (qtyNum <= 0) {
          itemErr.quantity = 'Must be at least 1';
        }

        const priceNum = Number(item.price);
        if (item.price === '' || item.price === null || item.price === undefined || isNaN(priceNum)) {
          itemErr.price = 'Price is required';
        } else if (priceNum < 0) {
          itemErr.price = 'Price cannot be negative';
        }

        if (Object.keys(itemErr).length > 0) {
          newItemErrors[item.id] = itemErr;
        }
      });
    }

    const hasItemErrors = Object.keys(newItemErrors).length > 0;
    const hasFieldErrors = Object.keys(newErrors).length > 0;

    if (hasFieldErrors || hasItemErrors) {
      setErrors(newErrors);
      setItemErrors(newItemErrors);
      if (hasItemErrors && !hasFieldErrors) {
        toast.error('Please check item descriptions, quantities, and prices');
      } else {
        toast.error('Please fix the errors in the form before saving');
      }
      return;
    }

    setErrors({});
    setItemErrors({});

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
              className={errors.customerId ? 'input-error' : ''}
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
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              className={errors.customerPhone ? 'input-error' : ''}
              value={invoice.customerPhone}
              onKeyDown={(e) => {
                if (
                  ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) ||
                  (e.ctrlKey || e.metaKey)
                ) {
                  return;
                }
                if (!/^[0-9]$/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                setInvoice({ ...invoice, customerPhone: numericOnly });
                if (errors.customerPhone) setErrors(prev => ({ ...prev, customerPhone: '' }));
              }}
              placeholder="10-digit number (e.g. 9876543210)"
            />
            {errors.customerPhone && <span className="field-error">{errors.customerPhone}</span>}
          </div>
        </div>

        <div className="form-row" style={{ marginBottom: '16px' }}>
          <div className="form-field">
            <label>Email</label>
            <input
              type="email"
              className={errors.customerEmail ? 'input-error' : ''}
              value={invoice.customerEmail}
              onChange={(e) => {
                setInvoice({ ...invoice, customerEmail: e.target.value });
                if (errors.customerEmail) setErrors(prev => ({ ...prev, customerEmail: '' }));
              }}
              placeholder="e.g. customer@example.com"
            />
            {errors.customerEmail && <span className="field-error">{errors.customerEmail}</span>}
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
              min="2000-01-01"
              max="2099-12-31"
              className={errors.date ? 'input-error' : ''}
              value={invoice.date}
              onChange={(e) => {
                let val = e.target.value;
                if (val) {
                  const parts = val.split('-');
                  if (parts[0] && parts[0].length > 4) {
                    parts[0] = parts[0].slice(0, 4);
                    val = parts.join('-');
                  }
                }
                setInvoice({ ...invoice, date: val });
                if (errors.date) setErrors(prev => ({ ...prev, date: '' }));
              }}
            />
            {errors.date && <span className="field-error">{errors.date}</span>}
          </div>
          <div className="form-field">
            <label>Due Date <span className="required">*</span></label>
            <input
              type="date"
              min={invoice.date || '2000-01-01'}
              max="2099-12-31"
              className={errors.dueDate ? 'input-error' : ''}
              value={invoice.dueDate}
              onChange={(e) => {
                let val = e.target.value;
                if (val) {
                  const parts = val.split('-');
                  if (parts[0] && parts[0].length > 4) {
                    parts[0] = parts[0].slice(0, 4);
                    val = parts.join('-');
                  }
                }
                setInvoice({ ...invoice, dueDate: val });
                if (errors.dueDate) setErrors(prev => ({ ...prev, dueDate: '' }));
              }}
            />
            {errors.dueDate && <span className="field-error">{errors.dueDate}</span>}
          </div>
        </div>

        <h3 style={{ marginBottom: '16px', borderBottom: '1px solid rgb(38, 43, 54)', paddingBottom: '8px' }}>
          Item Description
        </h3>

        {errors.itemsGeneral && (
          <div style={{ marginBottom: '12px' }}>
            <span className="field-error">{errors.itemsGeneral}</span>
          </div>
        )}

        {invoice.items.map((item, index) => {
          const itemErr = itemErrors[item.id] || {};
          return (
            <div 
              key={item.id} 
              className="form-row" 
              onClick={() => setSelectedRowId(item.id)}
              style={{ 
                gridTemplateColumns: catalogProducts.length > 0 ? '1.5fr 2fr 1fr 1fr' : '2fr 1fr 1fr', 
                marginBottom: '14px',
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
                {index === 0 && <label>Item Description <span className="required">*</span></label>}
                <input
                  type="text" 
                  className={itemErr.description ? 'input-error' : ''}
                  placeholder="Item Description" 
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                />
                {itemErr.description && <span className="field-error">{itemErr.description}</span>}
              </div>
              <div className="form-field" style={{ marginBottom: 0 }}>
                {index === 0 && <label>Quantity <span className="required">*</span></label>}
                <input
                  type="number" 
                  className={itemErr.quantity ? 'input-error' : ''}
                  min="1" 
                  step="1"
                  placeholder="Qty" 
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                />
                {itemErr.quantity && <span className="field-error">{itemErr.quantity}</span>}
              </div>
              <div className="form-field" style={{ marginBottom: 0 }}>
                {index === 0 && <label>Price (₹) <span className="required">*</span></label>}
                <input
                  type="number" 
                  className={itemErr.price ? 'input-error' : ''}
                  min="0" 
                  step="0.01"
                  placeholder="Price" 
                  value={item.price}
                  onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                />
                {itemErr.price && <span className="field-error">{itemErr.price}</span>}
              </div>
            </div>
          );
        })}

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

              <div className="form-field" style={{ marginBottom: 0, width: '130px' }}>
                <label>Tax (%)</label>
                <input 
                  type="number" 
                  className={errors.tax ? 'input-error' : ''}
                  min="0" 
                  max="100"
                  step="0.5"
                  value={invoice.tax} 
                  onChange={e => {
                    setInvoice({ ...invoice, tax: e.target.value });
                    if (errors.tax) setErrors(prev => ({ ...prev, tax: '' }));
                  }} 
                />
                {errors.tax && <span className="field-error">{errors.tax}</span>}
              </div>

              <span style={{ fontSize: '20px', color: 'rgb(107, 114, 128)', marginTop: '18px', fontWeight: 'bold' }}>-</span>

              <div className="form-field" style={{ marginBottom: 0, width: '130px' }}>
                <label>Discount (₹)</label>
                <input 
                  type="number" 
                  className={errors.discount ? 'input-error' : ''}
                  min="0" 
                  step="0.01"
                  value={invoice.discount} 
                  onChange={e => {
                    setInvoice({ ...invoice, discount: e.target.value });
                    if (errors.discount) setErrors(prev => ({ ...prev, discount: '' }));
                  }} 
                />
                {errors.discount && <span className="field-error">{errors.discount}</span>}
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