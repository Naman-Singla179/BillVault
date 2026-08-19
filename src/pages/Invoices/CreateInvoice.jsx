import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoices, saveInvoices } from '../../services/storage';

export default function CreateInvoice({ customers = [], onAddCustomer }) {
  const navigate = useNavigate();

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
    const newSubtotal = invoice.items.reduce((sum, item) => {
      return sum + (Number(item.quantity) * Number(item.price));
    }, 0);

    const taxAmount = newSubtotal * (Number(invoice.tax) / 100);
    const newTotal = newSubtotal + taxAmount - Number(invoice.discount);

    setInvoice(prev => ({ ...prev, subtotal: newSubtotal, total: newTotal }));
  }, [invoice.items, invoice.tax, invoice.discount]);

  const handleCustomerChange = (e) => {
    const name = e.target.value;
    const existingCustomer = customers.find(c => c.name === name || String(c.id) === String(name));
    
    if (existingCustomer) {
      setInvoice(prev => ({
        ...prev,
        customerId: name,
        customerPhone: existingCustomer.phone || '',
        customerEmail: existingCustomer.email || '',
        customerAddress: existingCustomer.address || ''
      }));
    } else {
      setInvoice(prev => ({ ...prev, customerId: name }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoice.items];
    newItems[index][field] = value;
    setInvoice(prev => ({ ...prev, items: newItems }));
  };

  const addItemRow = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), description: '', quantity: 1, price: 0 }]
    }));
  };

  const handleSave = () => {
    if (!invoice.customerId) return alert("Enter or select a customer!");
    if (!invoice.date) return alert("Select an invoice date!");
    if (!invoice.dueDate) return alert("Select a due date!");

    const existing = getInvoices();
    const isDuplicate = existing.some(inv => inv.id === invoice.id);

    if (!isDuplicate) {
      saveInvoices([...existing, invoice]);
    }

    if (onAddCustomer && invoice.customerId) {
      const existingCustomer = customers.find(
        c => String(c.id) === String(invoice.customerId) || c.name.toLowerCase() === invoice.customerId.toLowerCase()
      );
      if (!existingCustomer) {
        onAddCustomer({ 
          name: invoice.customerId, 
          email: invoice.customerEmail, 
          phone: invoice.customerPhone, 
          address: invoice.customerAddress 
        });
      }
    }

    alert("Invoice Saved!");
    navigate('/payments', { state: { invoiceId: invoice.id, amount: invoice.total } });
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Create Invoice</h1>
          <p>Fill out the details below to generate a new invoice.</p>
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        
        <div className="form-row" style={{ marginBottom: '16px' }}>
          <div className="form-field">
            <label>Customer Name</label>
            <input
              list="customer-list"
              value={invoice.customerId}
              onChange={handleCustomerChange}
              placeholder="Enter or select customer"
            />
            <datalist id="customer-list">
              {customers.map(c => <option key={c.id} value={c.name} />)}
            </datalist>
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
            <label>Invoice Date</label>
            <input
              type="date"
              value={invoice.date}
              onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label>Due Date</label>
            <input
              type="date"
              value={invoice.dueDate}
              onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
            />
          </div>
        </div>

        <h3 style={{ marginBottom: '16px', borderBottom: '1px solid rgb(38, 43, 54)', paddingBottom: '8px' }}>Item Description</h3>

        {invoice.items.map((item, index) => (
          <div key={item.id} className="form-row" style={{ gridTemplateColumns: '2fr 1fr 1fr', marginBottom: '12px' }}>
            <div className="form-field" style={{ marginBottom: 0 }}>
              {index === 0 && <label>Item Description</label>}
              <input
                type="text" placeholder="Item Description" value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
              />
            </div>
            <div className="form-field" style={{ marginBottom: 0 }}>
              {index === 0 && <label>Quantity</label>}
              <input
                type="number" min="1" placeholder="Qty" value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
              />
            </div>
            <div className="form-field" style={{ marginBottom: 0 }}>
              {index === 0 && <label>Price (₹)</label>}
              <input
                type="number" min="0" placeholder="Price" value={item.price}
                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
              />
            </div>
          </div>
        ))}

        <button className="btn btn-secondary" onClick={addItemRow} style={{ marginBottom: '24px', marginTop: '4px' }}>
          + Add Item
        </button>

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
                <input type="number" min="0" value={invoice.tax} onChange={e => setInvoice({ ...invoice, tax: e.target.value })} />
              </div>

              <span style={{ fontSize: '20px', color: 'rgb(107, 114, 128)', marginTop: '18px', fontWeight: 'bold' }}>-</span>

              <div className="form-field" style={{ marginBottom: 0, width: '120px' }}>
                <label>Discount (₹)</label>
                <input type="number" min="0" value={invoice.discount} onChange={e => setInvoice({ ...invoice, discount: e.target.value })} />
              </div>

              <span style={{ fontSize: '20px', color: 'rgb(107, 114, 128)', marginTop: '18px', fontWeight: 'bold' }}>=</span>

            </div>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'right', minWidth: '150px' }}>
                <h2 style={{ color: 'rgb(63, 182, 127)', margin: 0 }}>Total: ₹{invoice.total.toFixed(2)}</h2>
              </div>
              <button className="btn btn-primary" onClick={handleSave} style={{ padding: '12px 24px', fontSize: '15px' }}>
                Save Invoice
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}